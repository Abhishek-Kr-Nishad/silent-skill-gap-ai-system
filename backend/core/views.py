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
            # Increased timeout to 60s for RAG + LLM response
            res = requests.post(chat_url, json={"message": message}, timeout=60)
            
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
            # Increased timeout to 60s for Code Review
            res = requests.post(review_url, json={
                "code": code,
                "language": language,
                "problem_statement": problem_statement or "Unknown problem"
            }, timeout=60)
            
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
            # Increased timeout to 60s for Interview Prep
            res = requests.post(url, json={
                "target_role": target_role,
                "resume_skills": resume_skills,
                "weak_skills": weak_skills
            }, timeout=60)
            
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to get AI interview", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

import os
import requests
from django.http import HttpResponse
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# ----------------------------------------------------
# Document Generators (PDF & DOCX)
# ----------------------------------------------------
def generate_pdf_report(report):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="ATS_Report_{report.id}.pdf"'
    
    doc = SimpleDocTemplate(response, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4f46e5'),
        spaceAfter=15
    )
    section_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#131a2a'),
        spaceBefore=15,
        spaceAfter=10
    )
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )
    
    story.append(Paragraph(f"ATS Resume Analysis Report", title_style))
    story.append(Paragraph(f"Target Role: {report.target_role or 'Not Specified'}", body_style))
    story.append(Paragraph(f"Overall ATS Score: {report.ats_score}/100", section_style))
    story.append(Spacer(1, 10))
    
    # Scores table
    scores = report.report_data.get("scores", {})
    score_data = [["Category", "Score"]]
    for cat, val in scores.items():
        score_data.append([cat.replace('_', ' ').title(), str(val)])
    
    t = Table(score_data, colWidths=[200, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.HexColor('#4f46e5')),
        ('TEXTCOLOR', (0,0), (1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    # Recruiter Suggestions
    story.append(Paragraph("Key Recruiter Suggestions", section_style))
    suggestions = report.report_data.get("recruiter_suggestions", [])
    for sug in suggestions:
        story.append(Paragraph(f"• {sug}", body_style))
    story.append(Spacer(1, 15))
    
    # Formatting review
    story.append(Paragraph("Formatting Review", section_style))
    fmt = report.report_data.get("formatting_review", {})
    for issue in fmt.get("issues", []):
        story.append(Paragraph(f"• Issue: {issue}", body_style))
    for rec in fmt.get("recommendations", []):
        story.append(Paragraph(f"• Recommendation: {rec}", body_style))
        
    doc.build(story)
    return response


def generate_docx_resume(report):
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    response['Content-Disposition'] = f'attachment; filename="Improved_Resume_{report.id}.docx"'
    
    doc = Document()
    
    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
    rewritten = report.rewritten_resumes
    improved_text = ""
    if rewritten:
        improved_text = rewritten.get("keyword_optimized") or rewritten.get("tailored") or rewritten.get("optimized") or rewritten.get("interview_ready") or ""
        
    if improved_text:
        # Format the markdown-style text into Word paragraphs
        for line in improved_text.split('\n'):
            line = line.strip()
            if not line:
                continue
            if line.startswith('###') or line.startswith('##') or line.startswith('#'):
                clean_header = line.lstrip('#').strip()
                p = doc.add_paragraph()
                r = p.add_run(clean_header)
                r.bold = True
                r.font.size = Pt(14)
                p.space_before = Pt(10)
                p.space_after = Pt(4)
            elif line.startswith('*') or line.startswith('-'):
                clean_bullet = line.lstrip('*-').strip()
                doc.add_paragraph(clean_bullet, style='List Bullet')
            else:
                p = doc.add_paragraph(line)
                p.space_after = Pt(6)
    else:
        # Build formatted document from parser data
        parser_data = report.report_data.get("parser", {})
        
        # Name
        p_name = doc.add_paragraph()
        p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_name = p_name.add_run(parser_data.get("name", "Candidate Name"))
        r_name.bold = True
        r_name.font.size = Pt(20)
        
        # Contact info
        p_contact = doc.add_paragraph()
        p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
        contacts = []
        if parser_data.get("email"): contacts.append(parser_data["email"])
        if parser_data.get("phone"): contacts.append(parser_data["phone"])
        if parser_data.get("linkedin"): contacts.append(parser_data["linkedin"])
        if parser_data.get("github"): contacts.append(parser_data["github"])
        p_contact.add_run(" | ".join(contacts))
        p_contact.space_after = Pt(12)
        
        # Professional Summary
        summary = report.report_data.get("professional_summary", {}).get("suggested", "") or report.report_data.get("professional_summary", {}).get("original", "")
        if summary:
            h = doc.add_paragraph()
            h.add_run("PROFESSIONAL SUMMARY").bold = True
            doc.add_paragraph(summary)
            doc.add_paragraph().space_after = Pt(6)
            
        # Experience
        experience = parser_data.get("experience", [])
        if experience:
            h = doc.add_paragraph()
            h.add_run("WORK EXPERIENCE").bold = True
            for exp in experience:
                p = doc.add_paragraph()
                r_role = p.add_run(f"{exp.get('role', '')} - {exp.get('company', '')}")
                r_role.bold = True
                p.add_run(f"\n{exp.get('duration', '')}")
                doc.add_paragraph(exp.get('description', ''))
            doc.add_paragraph().space_after = Pt(6)
            
        # Education
        education = parser_data.get("education", [])
        if education:
            h = doc.add_paragraph()
            h.add_run("EDUCATION").bold = True
            for edu in education:
                p = doc.add_paragraph()
                r_deg = p.add_run(f"{edu.get('degree', '')} - {edu.get('school', '')}")
                r_deg.bold = True
                p.add_run(f"\n{edu.get('year', '')}")
            doc.add_paragraph().space_after = Pt(6)
            
        # Skills
        skills = parser_data.get("skills", [])
        if skills:
            h = doc.add_paragraph()
            h.add_run("SKILLS").bold = True
            doc.add_paragraph(", ".join(skills))
            
    doc.save(response)
    return response


# ----------------------------------------------------
# Resume / ATS View Endpoints
# ----------------------------------------------------
class ResumeUploadView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('resume')
        if not file_obj:
            return Response({"error": "No resume file provided."}, status=status.HTTP_400_BAD_REQUEST)
            
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        extract_url = f"{ml_url}/extract-text"
        
        try:
            files = {'file': (file_obj.name, file_obj.read(), file_obj.content_type)}
            # Increased timeout to 60s for file text extraction
            res = requests.post(extract_url, files=files, timeout=60)
            
            if res.status_code == 200:
                data = res.json()
                return Response({
                    "resume_text": data.get("text", ""),
                    "resume_name": file_obj.name
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to parse resume", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class JobDescriptionUploadView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        jd_text = request.data.get('job_description_text', '').strip()
        file_obj = request.FILES.get('job_description_file')
        
        if not jd_text and not file_obj:
            return Response({"error": "Please provide job description text or file."}, status=status.HTTP_400_BAD_REQUEST)
            
        if file_obj:
            ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
            extract_url = f"{ml_url}/extract-text"
            try:
                files = {'file': (file_obj.name, file_obj.read(), file_obj.content_type)}
                # Increased timeout to 60s for JD file extraction
                res = requests.post(extract_url, files=files, timeout=60)
                if res.status_code == 200:
                    jd_text = res.json().get("text", "")
                else:
                    return Response({"error": "Failed to parse job description file", "details": res.text}, status=res.status_code)
            except requests.exceptions.RequestException as e:
                return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                
        return Response({"jd_text": jd_text}, status=status.HTTP_200_OK)


class ResumeAnalyzeView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        resume_text = request.data.get('resume_text', '')
        jd_text = request.data.get('jd_text', '')
        target_role = request.data.get('target_role', 'Software Engineer')
        resume_name = request.data.get('resume_name', 'Resume')
        
        if not resume_text:
            return Response({"error": "Resume text is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        analyze_url = f"{ml_url}/analyze-ats"
        
        try:
            res = requests.post(analyze_url, json={
                "resume_text": resume_text,
                "jd_text": jd_text,
                "target_role": target_role
            }, timeout=120)
            
            if res.status_code == 200:
                report_data = res.json()
                ats_score = report_data.get("scores", {}).get("overall", 0)
                
                # Save to DB
                report = ResumeReport.objects.create(
                    user=request.user,
                    resume_name=resume_name,
                    target_role=target_role,
                    job_description=jd_text,
                    ats_score=ats_score,
                    report_data=report_data
                )
                serializer = ResumeReportSerializer(report)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "Failed to analyze resume", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class ResumeImproveView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        text = request.data.get('text', '')
        improve_type = request.data.get('type', 'experience')
        jd_text = request.data.get('jd_text', '')
        
        if not text:
            return Response({"error": "Text is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        improve_url = f"{ml_url}/improve-bullet"
        
        try:
            # Increased timeout to 60s for bullet improvement
            res = requests.post(improve_url, json={
                "text": text,
                "type": improve_type,
                "jd_text": jd_text
            }, timeout=60)
            
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to improve bullet points", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class ResumeRewriteView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        report_id = request.data.get('report_id')
        resume_text = request.data.get('resume_text', '')
        jd_text = request.data.get('jd_text', '')
        target_role = request.data.get('target_role', 'Software Engineer')
        
        if not resume_text and report_id:
            try:
                report = ResumeReport.objects.get(id=report_id, user=request.user)
                # Pull raw text from report_data parser
                resume_text = report.report_data.get("parser_raw_text", resume_text)
                jd_text = report.job_description or jd_text
                target_role = report.target_role or target_role
            except ResumeReport.DoesNotExist:
                return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
                
        ml_url = os.environ.get('ML_SERVICE_URL', 'http://ml_service:5000')
        rewrite_url = f"{ml_url}/rewrite-resume"
        
        try:
            res = requests.post(rewrite_url, json={
                "resume_text": resume_text,
                "jd_text": jd_text,
                "target_role": target_role
            }, timeout=120)
            
            if res.status_code == 200:
                rewritten_data = res.json()
                if report_id:
                    report = ResumeReport.objects.get(id=report_id, user=request.user)
                    report.rewritten_resumes = rewritten_data
                    report.save()
                return Response(rewritten_data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Failed to rewrite resume", "details": res.text}, status=res.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({"error": "ML Service Unavailable", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class ResumeHistoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        reports = ResumeReport.objects.filter(user=request.user).order_by('-created_at')
        data = []
        for r in reports:
            data.append({
                "id": r.id,
                "resume_name": r.resume_name,
                "target_role": r.target_role,
                "ats_score": r.ats_score,
                "created_at": r.created_at
            })
        return Response(data, status=status.HTTP_200_OK)


class ResumeReportDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        try:
            report = ResumeReport.objects.get(id=pk, user=request.user)
            serializer = ResumeReportSerializer(report)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ResumeReport.DoesNotExist:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk, *args, **kwargs):
        try:
            report = ResumeReport.objects.get(id=pk, user=request.user)
            report.delete()
            return Response({"message": "Report deleted successfully."}, status=status.HTTP_200_OK)
        except ResumeReport.DoesNotExist:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)


class ResumeReportPDFDownloadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        try:
            report = ResumeReport.objects.get(id=pk, user=request.user)
            return generate_pdf_report(report)
        except ResumeReport.DoesNotExist:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)


class ResumeReportDOCXDownloadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        try:
            report = ResumeReport.objects.get(id=pk, user=request.user)
            return generate_docx_resume(report)
        except ResumeReport.DoesNotExist:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

