from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    
    def __str__(self):
        return f"{self.username} - {self.role}"

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    college = models.CharField(max_length=255, blank=True, null=True)
    skills = models.CharField(max_length=500, blank=True, null=True)
    resume_link = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    leetcode = models.URLField(blank=True, null=True)
    hackerrank = models.URLField(blank=True, null=True)
    codeforces = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    
class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'TEACHER'})
    created_at = models.DateTimeField(auto_now_add=True)

class Unit(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, related_name='units', on_delete=models.CASCADE)

class Lesson(models.Model):
    title = models.CharField(max_length=255)
    video_url = models.URLField(blank=True, null=True)
    pdf_url = models.URLField(blank=True, null=True)
    unit = models.ForeignKey(Unit, related_name='lessons', on_delete=models.CASCADE)

class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    # in reality, would have another model for QuizQuestions

class CodingExam(models.Model):
    title = models.CharField(max_length=255)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    time_limit_sec = models.IntegerField(default=2)
    memory_limit_mb = models.IntegerField(default=128)
    problem_statement = models.TextField()
    hidden_test_cases = models.JSONField(default=dict)
    custom_test_cases = models.JSONField(default=dict)

class QuizAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    time_taken = models.IntegerField(help_text="Time taken in seconds")

class CodingAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    exam = models.ForeignKey(CodingExam, on_delete=models.CASCADE)
    accuracy = models.FloatField()
    time_taken = models.IntegerField(help_text="Time taken in seconds")
    retry_attempts = models.IntegerField(default=1)

class SkillGapReport(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    gap_probability = models.FloatField()
    weak_topic_detection = models.TextField()
    confidence_score = models.FloatField()
    recommendations = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)

class Problem(models.Model):
    DIFFICULTY_CHOICES = (
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard')
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Easy')
    tags = models.CharField(max_length=255, blank=True)
    statement = models.TextField()
    constraints = models.TextField(blank=True)
    examples = models.JSONField(default=list)  # [{'input': '...', 'output': '...', 'explanation': '...'}]
    test_cases = models.JSONField(default=list) # [{'input': '...', 'output': '...'}]
    created_at = models.DateTimeField(auto_now_add=True)

class Submission(models.Model):
    STATUS_CHOICES = (
        ('Accepted', 'Accepted'),
        ('Wrong Answer', 'Wrong Answer'),
        ('Time Limit Exceeded', 'Time Limit Exceeded'),
        ('Compilation Error', 'Compilation Error'),
        ('Runtime Error', 'Runtime Error')
    )
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    language = models.CharField(max_length=50)
    code = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Wrong Answer')
    runtime = models.FloatField(null=True, blank=True)
    memory = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class CodingTest(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'TEACHER'})
    duration_minutes = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)

class TestQuestion(models.Model):
    test = models.ForeignKey(CodingTest, related_name='questions', on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    marks = models.IntegerField(default=10)

class UploadedDocument(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_indexed = models.BooleanField(default=False)

class ChatHistory(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    response = models.TextField()
    context_used = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

class ResumeReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resume_reports')
    resume_name = models.CharField(max_length=255)
    target_role = models.CharField(max_length=255, blank=True, null=True)
    job_description = models.TextField(blank=True, null=True)
    ats_score = models.IntegerField(default=0)
    report_data = models.JSONField(default=dict)
    rewritten_resumes = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

