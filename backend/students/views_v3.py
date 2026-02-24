from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, InternshipCourse
import re

@api_view(['POST'])
def get_opportunities(request):
    """Get all opportunities, separated by Admin/Student posts or combined"""
    # Simply return all for now, sorted by date DESC
    posts = InternshipCourse.objects.all().order_by('-posted_date')
    data = []
    for p in posts:
        poster_name = "Admin"
        if p.posted_by_student:
            poster_name = p.posted_by_student.username
        
        data.append({
            "post_id": p.post_id,
            "title": p.title,
            "type": p.type,
            "description": p.description,
            "link": p.link,
            "posted_by": poster_name,
            "is_admin": p.is_admin_post,
            "date": p.posted_date
        })
    return Response(data)

@api_view(['POST'])
def create_opportunity(request):
    """Create new opportunity"""
    from django.core.mail import send_mail
    from django.conf import settings
    
    title = request.data.get('title')
    type_ = request.data.get('type')
    desc = request.data.get('description')
    link = request.data.get('link')
    student_id = request.data.get('student_id') # If null, assume admin if authorized?
    # For simplicity, we can have a flag 'is_admin' passed from frontend if it's admin dashboard
    is_admin = request.data.get('is_admin', False)

    student = None
    poster_name = "Admin"
    if student_id:
        try:
            student = Student.objects.get(student_id=student_id)
            poster_name = student.username
        except Student.DoesNotExist:
            pass
    
    InternshipCourse.objects.create(
        title=title,
        type=type_,
        description=desc,
        link=link,
        posted_by_student=student,
        is_admin_post=is_admin
    )
    
    # 📧 Send email notification to all students
    try:
        all_students = Student.objects.all()
        if student:
            all_students = all_students.exclude(student_id=student.student_id)
            
        recipient_emails = [s.email for s in all_students if s.email]
        
        if recipient_emails:
            send_mail(
                subject=f"New {type_} Opportunity - Elevare",
                message=f"{poster_name} posted a new {type_} opportunity:\n\n{title}\n\n{desc}\n\nLink: {link}\n\nLogin to Elevare to learn more!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_emails,
                fail_silently=True,
            )
    except Exception as e:
        # Log error but don't fail the post creation
        print(f"Email notification failed: {str(e)}")
    
    return Response({"message": "Opportunity posted successfully"})
