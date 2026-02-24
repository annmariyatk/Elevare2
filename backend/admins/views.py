import random
import string
from django.contrib.auth.hashers import make_password
from django.contrib.auth import logout as auth_logout
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth

from .models import Admin
from students.models import Student, StudyConnection, Assessment, Teacher, Certificate


# ==========================================
# ADMIN AUTH & SIGNUP
# ==========================================

def generate_password():
    return ''.join(random.choices(
        string.ascii_letters + string.digits + "@$!%*?",
        k=12 
    ))

@api_view(["POST"])
def admin_check_email(request):
    """Check if admin email exists"""
    email = request.data.get("email")
    if Admin.objects.filter(email=email).exists():
        return Response({"email": "Email already exists"})
    return Response({})

@api_view(["POST"])
def generate_admin_password(request):
    """Generate random password (legacy view)"""
    username = request.data.get("username")
    email = request.data.get("email")

    if not username or not email:
        return Response({"error": "Username and email required"}, status=400)

    if Admin.objects.filter(email=email).exists():
        return Response({"email": "Email already exists"}, status=400)

    password = generate_password()
    return Response({"one_time_password": password})

@api_view(["POST"])
def logout_view(request):
    auth_logout(request)
    return Response({"message": "Logged out successfully"})

@api_view(["POST"])
def confirm_admin_signup(request):
    """Confirm manual signup (legacy view)"""
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response({"error": "All fields required"}, status=400)

    if Admin.objects.filter(email=email).exists():
        return Response({"email": "Email already exists"}, status=400)

    Admin.objects.create(
        username=username,
        email=email,
        password=make_password(password)
    )
    return Response({"message": "Admin created successfully"})

@api_view(["POST"])
def create_admin_auto_password(request):
    """Create admin with auto-generated password"""
    username = request.data.get("username")
    email = request.data.get("email")

    if not username or not email:
        return Response({"error": "Username and email required"}, status=400)
    
    import re
    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
        return Response({"email": "Invalid email format"}, status=400)
    
    if Admin.objects.filter(email=email).exists():
        return Response({"email": "Email already exists"}, status=400)
    
    password = generate_password()
    Admin.objects.create(
        username=username,
        email=email,
        password=make_password(password)
    )
    
    return Response({
        "message": "Admin created successfully",
        "username": username,
        "email": email,
        "auto_password": password
    })


# ==========================================
# DASHBOARD STATS & STUDENT MANAGEMENT
# ==========================================

@api_view(["GET"])
def get_dashboard_stats(request):
    """Get dashboard statistics with monthly breakdown"""
    total_students = Student.objects.count()
    completed_studies = StudyConnection.objects.filter(status="Completed").count()
    cancelled_studies = StudyConnection.objects.filter(status="Cancelled").count()
    
    # Monthly Aggregation
    # We group by TruncMonth of 'created_at' (assuming StudyConnection has created_at)
    # If not, we use start_date. Assuming created_at exists based on models.py check.
    monthly_data = (
        StudyConnection.objects
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(
            completed=Count('study_id', filter=Q(status='Completed')),
            cancelled=Count('study_id', filter=Q(status='Cancelled'))
        )
        .order_by('month')
    )
    
    chart_data = []
    for entry in monthly_data:
        if entry['month']:
            month_name = entry['month'].strftime('%b') # Jan, Feb
            chart_data.append({
                "name": month_name,
                "completed": entry['completed'],
                "cancelled": entry['cancelled']
            })

    return Response({
        "total": total_students,
        "completed": completed_studies,
        "canceled": cancelled_studies,
        "chart_data": chart_data
    })

@api_view(["GET"])
def get_all_students(request):
    """Get students with search and filter"""
    search_query = request.GET.get('search', '')
    department = request.GET.get('department', '')

    students = Student.objects.all()

    if search_query:
        students = students.filter(username__icontains=search_query)
    
    if department:
        students = students.filter(department=department)

    data = []
    for s in students:
        data.append({
            "student_id": s.student_id,
            "username": s.username,
            "email": s.email,
            "phone_number": s.phone_number,
            "department": s.department
        })

    return Response(data)

@api_view(["GET"])
def get_student_details(request, student_id):
    """Get detailed history and assessments for a student"""
    try:
        student = Student.objects.get(student_id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    # 1. History (Study Connections)
    history_objs = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student)
    )
    
    history_data = []
    for h in history_objs:
        partner = h.student2 if h.student1 == student else h.student1
        
        # Determine current student's skill in this connection
        my_skill = h.student1_skill if h.student1 == student else h.student2_skill
        
        skill_info = "N/A"
        if my_skill:
            skill_info = f"{my_skill.offer} ({my_skill.level})"

        history_data.append({
            "study_id": h.study_id,
            "partner_name": partner.username,
            "start_date": h.start_date,
            "end_date": h.end_date,
            "status": h.status,
            "my_skill": skill_info
        })

    # 2. Assessments
    assessment_objs = Assessment.objects.select_related('study').filter(student=student)
    assessments_data = []
    for a in assessment_objs:
        assessments_data.append({
            "assessment_id": a.assessment_id,
            "project_title": a.project_title,
            "assessment_work": a.assessment_work, # Type
            "status": a.status,
            "assessment_file": a.assessment_file.url if a.assessment_file else None,
            "validation_form": a.validation_form_file.url if a.validation_form_file else None,
        })

    return Response({
        "student": {
            "username": student.username,
            "email": student.email,
            "department": student.department
        },
        "history": history_data,
        "assessments": assessments_data
    })

@api_view(["DELETE"])
def delete_student(request, student_id):
    """Delete a student record"""
    try:
        student = Student.objects.get(student_id=student_id)
        student.delete() 
        return Response({"message": "Student deleted successfully"})
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

@api_view(["POST"])
def update_study_status(request, study_id):
    """Update study status (Complete/Cancel)"""
    new_status = request.data.get("status")
    if new_status not in ["Completed", "Cancelled"]:
        return Response({"error": "Invalid status"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
        study.status = new_status
        study.save()
        return Response({"message": "Status updated successfully"})
    except StudyConnection.DoesNotExist:
        return Response({"error": "Study not found"}, status=404)


# ==========================================
# TEACHER MANAGEMENT
# ==========================================

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_teacher(request):
    """Add a new teacher"""
    data = request.data
    name = data.get("name")
    email = data.get("email")
    phone_number = data.get("phone_number")
    department = data.get("department")
    profile = data.get("profile") # Image file

    if not name or not email or not department:
        return Response({"error": "Name, Email and Department are required"}, status=400)
    
    import re
    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
        return Response({"error": "Invalid email format"}, status=400)
    
    if Teacher.objects.filter(email=email).exists():
        return Response({"error": "Teacher with this email already exists"}, status=400)

    Teacher.objects.create(
        name=name,
        email=email,
        phone_number=phone_number,
        department=department,
        profile=profile,
        status=0 # Default available
    )
    
    return Response({"message": "Teacher added successfully"})

@api_view(["GET"])
def get_teachers(request):
    """Get all teachers with search/filter"""
    search_query = request.GET.get('search', '')
    department = request.GET.get('department', '')

    teachers = Teacher.objects.all()

    if search_query:
        teachers = teachers.filter(name__icontains=search_query)
    
    if department:
        teachers = teachers.filter(department=department)

    data = []
    for t in teachers:
        data.append({
            "teacher_id": t.teacher_id,
            "name": t.name,
            "email": t.email,
            "department": t.department,
            "profile": t.profile.url if t.profile else None,
            "status": t.status
        })

    return Response(data)

@api_view(["DELETE"])
def delete_teacher(request, teacher_id):
    """Delete a teacher"""
    try:
        teacher = Teacher.objects.get(teacher_id=teacher_id)
        teacher.delete()
        return Response({"message": "Teacher deleted successfully"})
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

@api_view(["GET"])
def get_student_departments(request):
    """Get unique departments from Student table"""
    depts = Student.objects.values_list('department', flat=True).distinct()
    return Response(sorted([d for d in depts if d]))

@api_view(["GET"])
def get_teacher_departments(request):
    """Get unique departments from Teacher table"""
    depts = Teacher.objects.values_list('department', flat=True).distinct()
    return Response(sorted([d for d in depts if d]))
@api_view(["POST"])
def cancel_assessment(request, assessment_id):
    """Revert assessment status to Submitted and undo study completion"""
    try:
        assessment = Assessment.objects.get(assessment_id=assessment_id)
        study = assessment.study
        student = assessment.student

        # 1. Revert assessment status
        assessment.status = "Submitted"
        assessment.save()

        # 2. Revert study status to Progress
        if study.status == "Completed":
            study.status = "Progress"
            study.save()

        # 3. Revert skill status for both students (since they are linked)
        if study.student1_skill:
            study.student1_skill.status = 0
            study.student1_skill.save()
        if study.student2_skill:
            study.student2_skill.status = 0
            study.student2_skill.save()

        # 4. Mark certificate as cancelled (status 1) instead of deleting
        Certificate.objects.filter(student=student, study=study).update(status=1)

        return Response({"message": "Assessment reverted to Submitted status ✅"})
    except Assessment.DoesNotExist:
        return Response({"error": "Assessment not found"}, status=404)
