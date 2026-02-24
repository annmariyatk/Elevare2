from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, HelpSupport, WebsiteReview, Teacher, StudyConnection
import random
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

@api_view(['POST'])
def create_issue(request):
    """Student or Teacher creates a support issue"""
    student_id = request.data.get('student_id')
    teacher_id = request.data.get('teacher_id')
    email = request.data.get('email')
    issue_text = request.data.get('issue')

    if not issue_text:
        return Response({"error": "Issue text is required"}, status=400)
    
    if student_id:
        try:
            student = Student.objects.get(student_id=student_id)
            HelpSupport.objects.create(student=student, issue=issue_text)
            return Response({"message": "Issue submitted successfully"})
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

    if teacher_id:
        try:
            teacher = Teacher.objects.get(teacher_id=teacher_id)
            HelpSupport.objects.create(teacher=teacher, issue=issue_text)
            return Response({"message": "Issue submitted successfully"})
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=404)
    
    if email:
        try:
            teacher = Teacher.objects.get(email=email)
            HelpSupport.objects.create(teacher=teacher, issue=issue_text)
            return Response({"message": "Issue submitted successfully"})
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=404)

    return Response({"error": "Identification (Student/Teacher ID or Email) required"}, status=400)

@api_view(['POST'])
def find_mentor_by_email(request):
    """Find mentor by email and return their active studies"""
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        teacher = Teacher.objects.get(email=email)
        # Get active studies for this teacher
        active_studies = StudyConnection.objects.filter(teacher=teacher, status__in=["Started", "Progress"])
        
        studies_data = []
        for s in active_studies:
            studies_data.append({
                "study_id": s.study_id,
                "student1": s.student1.username,
                "student2": s.student2.username,
            })

        return Response({
            "teacher_id": teacher.teacher_id,
            "name": teacher.name,
            "active_studies": studies_data
        })
    except Teacher.DoesNotExist:
        return Response({"error": "Mentor not found with this email"}, status=404)

@api_view(['POST'])
def send_teacher_otp(request):
    """Send OTP to teacher's email for verification"""
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=400)
    
    try:
        teacher = Teacher.objects.get(email=email)
        otp = str(random.randint(100000, 999999))
        teacher.teacher_otp = otp
        teacher.teacher_otp_expiry = timezone.now() + timedelta(minutes=10)
        teacher.save()

        # ✅ Send Email
        send_mail(
            subject="Verification Code for Support Report - ELAVRE",
            message=f"Hello {teacher.name},\n\nYour verification code is: {otp}\n\nThis code will expire in 10 minutes.\n\nThank you,\nELAVRE Team",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[teacher.email],
            fail_silently=False,
        )

        # For demo/test if phone_number exists, log it
        if teacher.phone_number:
            print(f"DEBUG: Would also send OTP {otp} to {teacher.phone_number}")

        return Response({"message": "OTP sent successfully to your email"})
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found with this email"}, status=404)

@api_view(['POST'])
def verify_teacher_otp(request):
    """Verify the OTP sent to the teacher"""
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not email or not otp:
        return Response({"error": "Email and OTP are required"}, status=400)
    
    try:
        teacher = Teacher.objects.get(email=email)
        if teacher.teacher_otp == otp and teacher.teacher_otp_expiry > timezone.now():
            # Clear OTP after verification
            teacher.teacher_otp = None
            teacher.teacher_otp_expiry = None
            teacher.save()
            return Response({"message": "Verification successful", "teacher_id": teacher.teacher_id})
        else:
            return Response({"error": "Invalid or expired OTP"}, status=400)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

@api_view(['GET'])
def get_my_issues(request, student_id):
    """Get issues for a specific student"""
    issues = HelpSupport.objects.filter(student__student_id=student_id).order_by('-created_at')
    data = []
    for i in issues:
        data.append({
            "issue_id": i.issue_id,
            "issue": i.issue,
            "reply": i.reply,
            "status": i.status,
            "created_at": i.created_at
        })
    return Response(data)

@api_view(['POST'])
def post_review(request):
    """Student posts a website review"""
    student_id = request.data.get('student_id')
    review_text = request.data.get('review')
    rating = request.data.get('rating')
    
    try:
        student = Student.objects.get(student_id=student_id)
        WebsiteReview.objects.create(
            student=student, 
            review=review_text, 
            rating=rating
        )
        return Response({"message": "Review submitted for approval"})
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

@api_view(['GET'])
def get_public_reviews(request):
    """Get all approved reviews (status=1) for public display"""
    reviews = WebsiteReview.objects.filter(status=1).order_by('-created_at')
    data = []
    for r in reviews:
        # Get profile picture URL if exists
        pic_url = None
        if r.student.picture:
            pic_url = request.build_absolute_uri(r.student.picture.url)
            
        data.append({
            "review_id": r.review_id,
            "username": r.student.username,
            "department": r.student.department,
            "picture": pic_url,
            "review": r.review,
            "rating": r.rating,
            "created_at": r.created_at
        })
    return Response(data)
