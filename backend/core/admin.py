from django.contrib import admin
from .models import User, Profile, Course, Unit, Lesson, Enrollment, Quiz, CodingExam, QuizAttempt, CodingAttempt, SkillGapReport

admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Course)
admin.site.register(Unit)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(Quiz)
admin.site.register(CodingExam)
admin.site.register(QuizAttempt)
admin.site.register(CodingAttempt)
admin.site.register(SkillGapReport)
