from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *

# Admin routes
admin_router = DefaultRouter()
admin_router.register(r'users', AdminUserViewSet, basename='admin-users')
admin_router.register(r'analytics', AdminAnalyticsViewSet, basename='admin-analytics')

# Teacher routes
teacher_router = DefaultRouter()
teacher_router.register(r'courses', TeacherCourseViewSet, basename='teacher-courses')
teacher_router.register(r'units', TeacherUnitViewSet, basename='teacher-units')
teacher_router.register(r'lessons', TeacherLessonViewSet, basename='teacher-lessons')
teacher_router.register(r'quizzes', TeacherQuizViewSet, basename='teacher-quizzes')
teacher_router.register(r'coding-exams', TeacherCodingExamViewSet, basename='teacher-coding-exams')

# Student routes
student_router = DefaultRouter()
student_router.register(r'available-courses', StudentCourseViewSet, basename='student-courses')
student_router.register(r'enrollments', StudentEnrollmentViewSet, basename='student-enrollments')
student_router.register(r'quiz-attempts', StudentQuizAttemptViewSet, basename='student-quiz-attempts')
student_router.register(r'coding-attempts', StudentCodingAttemptViewSet, basename='student-coding-attempts')
student_router.register(r'skill-gap-reports', StudentSkillGapReportViewSet, basename='student-reports')

# Shared routes
shared_router = DefaultRouter()
shared_router.register(r'profiles', ProfileViewSet, basename='shared-profiles')
shared_router.register(r'problems', ProblemViewSet, basename='shared-problems')
shared_router.register(r'submissions', SubmissionViewSet, basename='shared-submissions')
shared_router.register(r'coding-tests', CodingTestViewSet, basename='shared-coding-tests')

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    
    path('admin/', include(admin_router.urls)),
    path('teacher/', include(teacher_router.urls)),
    path('student/', include(student_router.urls)),
    path('shared/', include(shared_router.urls)),
    path('shared/analyze-resume/', ResumeUploadView.as_view(), name='analyze-resume'),
    path('shared/ai-chat/', AIChatView.as_view(), name='ai-chat'),
    path('shared/ai-code-review/', AICodeReviewView.as_view(), name='ai-code-review'),
    path('shared/generate-interview/', AIGenerateInterviewView.as_view(), name='generate-interview'),
    
    # AI-Powered ATS Resume Analyzer Coach Endpoints
    path('resume/upload', ResumeUploadView.as_view(), name='resume-upload'),
    path('resume/upload/', ResumeUploadView.as_view(), name='resume-upload-slash'),
    path('resume/job-description', JobDescriptionUploadView.as_view(), name='resume-jd'),
    path('resume/job-description/', JobDescriptionUploadView.as_view(), name='resume-jd-slash'),
    path('resume/analyze', ResumeAnalyzeView.as_view(), name='resume-analyze'),
    path('resume/analyze/', ResumeAnalyzeView.as_view(), name='resume-analyze-slash'),
    path('resume/improve', ResumeImproveView.as_view(), name='resume-improve'),
    path('resume/improve/', ResumeImproveView.as_view(), name='resume-improve-slash'),
    path('resume/rewrite', ResumeRewriteView.as_view(), name='resume-rewrite'),
    path('resume/rewrite/', ResumeRewriteView.as_view(), name='resume-rewrite-slash'),
    path('resume/history', ResumeHistoryView.as_view(), name='resume-history'),
    path('resume/history/', ResumeHistoryView.as_view(), name='resume-history-slash'),
    path('resume/report/<int:pk>', ResumeReportDetailView.as_view(), name='resume-report-detail'),
    path('resume/report/<int:pk>/', ResumeReportDetailView.as_view(), name='resume-report-detail-slash'),
    path('resume/report/<int:pk>/download-pdf', ResumeReportPDFDownloadView.as_view(), name='resume-report-pdf'),
    path('resume/report/<int:pk>/download-docx', ResumeReportDOCXDownloadView.as_view(), name='resume-report-docx'),
]

