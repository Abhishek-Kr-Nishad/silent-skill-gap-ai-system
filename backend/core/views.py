from rest_framework import viewsets, mixins, status, generics, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import *
from .serializers import *
from .permissions import IsAdmin, IsTeacher, IsStudent

# AUTH VIEWS
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer


# ADMIN VIEWS
class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class AdminAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]
    def list(self, request):
        return Response({"message": "Global analytics and skill gap statistics here"})

# TEACHER VIEWS
class TeacherCourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class TeacherUnitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = UnitSerializer
    queryset = Unit.objects.all() # Filtering by teacher's courses in a real scenario

class TeacherLessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = LessonSerializer
    queryset = Lesson.objects.all()

class TeacherQuizViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()

class TeacherCodingExamViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = CodingExamSerializer
    queryset = CodingExam.objects.all()

# STUDENT VIEWS
class StudentCourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStudent]
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

class StudentEnrollmentViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsStudent]
    serializer_class = EnrollmentSerializer
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class StudentQuizAttemptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStudent]
    serializer_class = QuizAttemptSerializer
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class StudentCodingAttemptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStudent]
    serializer_class = CodingAttemptSerializer
    
    def get_queryset(self):
        return CodingAttempt.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class StudentSkillGapReportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStudent]
    serializer_class = SkillGapReportSerializer
    
    def get_queryset(self):
        return SkillGapReport.objects.filter(student=self.request.user)

# SHARED VIEWS (Authenticated Users)
class ProfileViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    
    def get_queryset(self):
        return Profile.objects.all()

    def get_object(self):
        # Returns the logged-in user's profile if detail view without pk is requested, otherwise standard.
        pk = self.kwargs.get('pk')
        if pk == 'me':
            profile, created = Profile.objects.get_or_create(user=self.request.user)
            return profile
        return super().get_object()

class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProblemSerializer
    queryset = Problem.objects.all()
    
    # Can add filtering logic here based on query params

class SubmissionViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionSerializer
    
    def get_queryset(self):
        # View own submissions or all if admin/teacher
        if self.request.user.role in ['ADMIN', 'TEACHER']:
            return Submission.objects.all().order_by('-timestamp')
        return Submission.objects.filter(student=self.request.user).order_by('-timestamp')

    def create(self, request, *args, **kwargs):
        import requests
        code = request.data.get('code', '')
        language = request.data.get('language', 'python')
        
        exec_output = {"stdout": "", "stderr": "", "status": "Error", "runtime": 0, "memory": 0}
        
        import os
        exec_url = os.environ.get('EXECUTION_SERVICE_URL', 'http://localhost:5001/execute')
        # Call the execution service
        try:
            exec_res = requests.post(exec_url, json={
                "language": language,
                "code": code,
                "input_data": "" 
            }, timeout=8)
            
            if exec_res.status_code == 200:
                exec_output = exec_res.json()
            else:
                exec_output["status"] = "System Error"
        except Exception:
            exec_output["status"] = "Service Unavailable"

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            student=request.user, 
            status=exec_output.get('status', 'Error'), 
            runtime=exec_output.get('runtime', 0), 
            memory=exec_output.get('memory', 0)
        )
        
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['execution_result'] = exec_output
        
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

class CodingTestViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CodingTestSerializer
    queryset = CodingTest.objects.all()

class ResumeUploadView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('resume')
        target_role = request.data.get('target_role', 'Software Engineer')
        
        if not file_obj:
            return Response({"error": "No resume file provided."}, status=status.HTTP_400_BAD_REQUEST)
            
        import requests
        import os
        
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        analyze_url = f"{ml_url}/analyze-resume"
        
        try:
            files = {'file': (file_obj.name, file_obj.read(), file_obj.content_type)}
            data = {'target_role': target_role}
            
            res = requests.post(analyze_url, files=files, data=data, timeout=30)
            
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to analyze resume", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class AIChatView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        message = request.data.get('message')
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        import requests
        import os
        
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        chat_url = f"{ml_url}/chat"
        
        try:
            # We skip sending history for now to keep it simple, but we could pass it
            res = requests.post(chat_url, json={"message": message}, timeout=15)
            
            if res.status_code == 200:
                data = res.json()
                # Save chat history
                ChatHistory.objects.create(
                    student=request.user,
                    message=message,
                    response=data.get('response', ''),
                    context_used=data.get('context_used', False)
                )
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to get AI response", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class AICodeReviewView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        language = request.data.get('language')
        problem_statement = request.data.get('problem_statement')
        
        if not code or not language:
            return Response({"error": "Code and language required"}, status=status.HTTP_400_BAD_REQUEST)
            
        import requests
        import os
        
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        review_url = f"{ml_url}/code-review"
        
        try:
            res = requests.post(review_url, json={
                "code": code,
                "language": language,
                "problem_statement": problem_statement or "Unknown problem"
            }, timeout=15)
            
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to get AI review", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class AIGenerateInterviewView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        target_role = request.data.get('target_role')
        resume_skills = request.data.get('resume_skills', [])
        weak_skills = request.data.get('weak_skills', [])
        
        import requests
        import os
        
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        url = f"{ml_url}/generate-interview"
        
        try:
            res = requests.post(url, json={
                "target_role": target_role,
                "resume_skills": resume_skills,
                "weak_skills": weak_skills
            }, timeout=20)
            
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to get AI interview", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
