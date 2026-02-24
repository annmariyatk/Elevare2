from django.contrib import admin
from .models import (
    Student,
    StudentSkill,
    StudyConnection,
    Resource,
    ChatMessage,
    Assessment,
    Rating,
    Certificate,
    InternshipCourse
)

admin.site.register(Student)
admin.site.register(StudentSkill)
admin.site.register(StudyConnection)
admin.site.register(Resource)
admin.site.register(ChatMessage)
admin.site.register(Assessment)
admin.site.register(Rating)
admin.site.register(Certificate)
admin.site.register(InternshipCourse)
