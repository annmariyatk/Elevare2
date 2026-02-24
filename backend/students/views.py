import secrets
from datetime import timedelta, date

from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password
import random
from django.db.models import Q, Avg

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from django.core.mail import send_mail, EmailMessage
from django.conf import settings

from .models import (
    Student,
    StudyConnection,
    Certificate,
    StudentUploadedCertificate,
    StudentSkill,
    Rating,
    Assessment,
    Teacher,
    ChatMessage,
    Resource,
    SkillPost,
    InternshipCourse
)

from .serializers import StudentSerializer, StudentSkillSerializer
from admins.models import Admin



# =========================
# HELPERS
# =========================
def get_student_from_token(request):
    auth = request.headers.get("Authorization")
    if not auth:
        return None
    token = auth.replace("Bearer ", "").strip()
    return Student.objects.filter(api_token=token).first()


# =========================
# AUTH
# =========================
@api_view(["POST"])
def signup(request):
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Signup successful"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def check_unique(request):
    email = request.data.get("email")
    phone = request.data.get("phone_number")
    errors = {}

    if email and Student.objects.filter(email=email).exists():
        errors["email"] = "Email already exists"

    if phone and Student.objects.filter(phone_number=phone).exists():
        errors["phone_number"] = "Phone number already exists"

    return Response(errors)


@api_view(["POST"])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    # ---------- ADMIN LOGIN ----------
    try:
        admin = Admin.objects.get(email=email)
        if check_password(password, admin.password):
            token = secrets.token_hex(32)
            admin.api_token = token
            admin.save()
            return Response({"role": "admin", "token": token, "admin_id": admin.admin_id})
    except Admin.DoesNotExist:
        pass

    # ---------- STUDENT LOGIN ----------
    try:
        student = Student.objects.get(email=email)
        if check_password(password, student.password):
            token = secrets.token_hex(32)
            student.api_token = token
            student.save()
            return Response({"role": "student", "token": token, "student_id": student.student_id})
    except Student.DoesNotExist:
        pass

    return Response({"error": "Invalid credentials"}, status=401)


@api_view(["POST"])
def forgot_password_request(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)
    
    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return Response({"error": "No account found with this email"}, status=404)
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    student.reset_otp = otp
    student.otp_expiry = timezone.now() + timedelta(minutes=10)
    student.save()
    
    try:
        send_mail(
            subject="Password Reset Request - ELEVARE",
            message=f"""Hello,

You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:

OTP: {otp}

This OTP is valid for 10 minutes only.

If you did not request this password reset, please ignore this email.

Best regards,
ELEVARE Team
""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)
    
    return Response({"message": "OTP sent to your email ✅"})

@api_view(["POST"])
def forgot_password_reset(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    new_password = request.data.get("new_password")
    
    if not all([email, otp, new_password]):
        return Response({"error": "All fields are required"}, status=400)
    
    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return Response({"error": "No account found with this email"}, status=404)
    
    if not student.reset_otp or student.reset_otp != otp:
        return Response({"error": "Invalid OTP"}, status=400)
    
    if not student.otp_expiry or timezone.now() > student.otp_expiry:
        return Response({"error": "OTP has expired"}, status=400)
    
    # Update password using hashing
    student.password = make_password(new_password)
    student.reset_otp = None
    student.otp_expiry = None
    student.save()
    
    return Response({"message": "Password updated successfully ✅"})


@api_view(["POST"])
def logout(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    student.api_token = None
    student.save()
    return Response({"message": "Logged out successfully"})


# =========================
# DASHBOARD ✅ FIXED
# =========================
class StudentDashboardView(APIView):
    def get(self, request):
        student = get_student_from_token(request)
        if not student:
            return Response({"error": "Unauthorized"}, status=401)

        # ================= ACTIVE STUDY =================
        # 1. First priority: Look for Started or Progress studies
        active = StudyConnection.objects.filter(
            Q(student1=student) | Q(student2=student),
            status__in=["Started", "Progress"],
        ).order_by("-study_id").first()

        # 2. Secondary priority: Find a study where THIS student still has status=0 (Pending)
        # This keeps the Chat and sidebar links active even if the study is "Completed"
        if not active:
            active = StudyConnection.objects.filter(
                (Q(student1=student) & Q(student1_skill__status=0)) |
                (Q(student2=student) & Q(student2_skill__status=0))
            ).exclude(status="Cancelled").order_by("-study_id").first()

        try:
            # 🔥 AUTO COMPLETE ALL EXPIRED STUDIES
            # Only auto-complete if the student DOESN'T have an active skill 0
            # (Otherwise we keep it open for chat)
            expired_studies = StudyConnection.objects.filter(
                Q(student1=student) | Q(student2=student),
                status__in=["Started", "Progress"],
                end_date__lt=date.today()
            )

            for study_to_close in expired_studies:
                print(f"DEBUG: Closing expired study {study_to_close.study_id}")
                study_to_close.status = "Completed"
                study_to_close.save()

                # ✅ Also free up student skills so they can be matched again
               


                # Send email to teacher about auto-completion
                if study_to_close.teacher:
                    try:
                        # Determine which student this is
                        current_student = student
                        partner = study_to_close.student2 if study_to_close.student1 == student else study_to_close.student1
                        my_skill = study_to_close.student1_skill if study_to_close.student1 == student else study_to_close.student2_skill
                        
                        subject = "Student Study Completion Notification - ELEVARE"
                        
                        text_body = f"""Hello {study_to_close.teacher.name},

We are pleased to inform you that {current_student.username} has successfully completed their study session.

Student: {current_student.username}
Partner: {partner.username}
Skills Exchanged: {my_skill.offer if my_skill else 'N/A'} ↔ {my_skill.want if my_skill else 'N/A'}

Congratulations on guiding them through this learning journey!

Best regards,
ELEVARE Team
"""
                        
                        html_body = f"""
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                            <h2 style="color: #166534;">Study Completion Notification ✅</h2>
                            <p>Hello <strong>{study_to_close.teacher.name}</strong>,</p>
                            <p>We are pleased to inform you that <strong>{current_student.username}</strong> has successfully completed their study session.</p>
                            <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #166534; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Student:</strong> {current_student.username}</p>
                                <p style="margin: 5px 0;"><strong>Partner:</strong> {partner.username}</p>
                                <p style="margin: 5px 0;"><strong>Skills Exchanged:</strong> {my_skill.offer if my_skill else 'N/A'} ↔ {my_skill.want if my_skill else 'N/A'}</p>
                            </div>
                            <p>Congratulations on guiding them through this learning journey! 🎓</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #666; font-size: 0.9em;">Best regards,<br>ELEVARE Team</p>
                        </div>
                        """
                        
                        send_mail(
                            subject=subject,
                            message=text_body,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[study_to_close.teacher.email],
                            fail_silently=True,
                            html_message=html_body
                        )
                    except Exception as e:
                        print(f"Failed to send auto-completion email to teacher: {str(e)}")
                    
                    # Free up teacher
                    study_to_close.teacher.status = 0
                    study_to_close.teacher.save()
                    study_to_close.teacher = None
                    study_to_close.save(update_fields=["teacher"])

            # Re-fetch active study with the same permissive logic
            active = StudyConnection.objects.filter(
                Q(student1=student) | Q(student2=student),
                status__in=["Started", "Progress"],
            ).order_by("-study_id").first()

            if not active:
                active = StudyConnection.objects.filter(
                    (Q(student1=student) & Q(student1_skill__status=0)) |
                    (Q(student2=student) & Q(student2_skill__status=0))
                ).exclude(status="Cancelled").order_by("-study_id").first()


            active_data = None
            if active:
                print(f"DEBUG: Active study found: {active.study_id}")
                partner = (
                    active.student2.username
                    if active.student1 == student
                    else active.student1.username
                )

                my_skill = (
                    active.student1_skill
                    if active.student1 == student
                    else active.student2_skill
                )

                if not my_skill:
                    my_skill = (
                        StudentSkill.objects
                        .filter(student=student)
                        .order_by("-student_skill_id")
                        .first()
                    )

                active_data = {
                    "study_id": active.study_id,
                    "partner": partner,
                    "offer": my_skill.offer if my_skill else None,
                    "want": my_skill.want if my_skill else None,
                    "level": my_skill.level if my_skill else None,
                    "status": active.status,
                    "start_date": active.start_date,
                    "end_date": active.end_date,
                    "teacher_name": active.teacher.name if active.teacher else None,
                    "skills_assigned": bool(active.student1_skill and active.student2_skill)
                }
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"ERROR in DashboardView: {error_details}")
            return Response({
                "error": str(e),
                "details": error_details
            }, status=500)

        # ================= HISTORY =================
        history_qs = StudyConnection.objects.filter(
            Q(student1=student) | Q(student2=student),
            status__in=["Completed", "Cancelled"]
        ).order_by("-study_id")

        completed_count = history_qs.filter(status="Completed").count()
        cancelled_count = history_qs.filter(status="Cancelled").count()

        history_qs = history_qs[:5]

        history_data = []
        for s in history_qs:
            partner = s.student2 if s.student1 == student else s.student1

            skill = (
                s.student1_skill
                if s.student1 == student
                else s.student2_skill
            )

            # 🔥 fallback for history too
            if not skill:
                skill = (
                    StudentSkill.objects
                    .filter(student=student)
                    .order_by("-student_skill_id")
                    .first()
                )

            history_data.append({
                "study_id": s.study_id,
                "partner": partner.username,
                "offer_skill": skill.offer if skill else None,
                "want_skill": skill.want if skill else None,
                "status": s.status,
                "start_date": s.start_date,
                "end_date": s.end_date,
            })

        # ✅ Include Notification Counts for Badges
        # (Same logic as get_notification_counts)
        # 1. SkillShare
        skillshare_count = SkillPost.objects.filter(created_at__gt=student.last_viewed_skillshare).count()

        # 2. Assessment
        pending_assessments = 0
        completed_studies = StudyConnection.objects.filter(
            Q(student1=student) | Q(student2=student),
            status="Completed",
            updated_at__gt=student.last_viewed_assessment
        )
        for s_loop in completed_studies:
            if not Assessment.objects.filter(study=s_loop, student=student).exists():
                pending_assessments += 1

        # 3. Chat
        chat_count = 0
        active_chat = StudyConnection.objects.filter(
            Q(student1=student) | Q(student2=student),
            status__in=["Started", "Progress"]
        ).first()
        if not active_chat:
            active_chat = StudyConnection.objects.filter(
                (Q(student1=student) & Q(student1_skill__status=0)) |
                (Q(student2=student) & Q(student2_skill__status=0))
            ).first()
        if active_chat:
            from students.models import ChatMessage # Local import if needed
            chat_count = ChatMessage.objects.filter(study=active_chat, sent_at__gt=student.last_viewed_chat).exclude(sender=student).count()

        # 4. Resources
        resource_count = 0
        for s_loop in StudyConnection.objects.filter(Q(student1=student) | Q(student2=student)):
            partner = s_loop.student2 if s_loop.student1 == student else s_loop.student1
            resource_count += Resource.objects.filter(study=s_loop, uploaded_by=partner, uploaded_at__gt=student.last_viewed_resources).count()

        # 5. Certificates
        certificate_new_count = Certificate.objects.filter(student=student, status=0, issued_date__gt=student.last_viewed_certificates).count()

        # 6. Internships
        internship_new_count = InternshipCourse.objects.filter(posted_date__gt=student.last_viewed_internships).count()

        return Response({
            "username": student.username,
            "active_study": active_data,
            "history": history_data,
            "completed_skills": completed_count,
            "cancelled_studies": cancelled_count,
            "certificates": Certificate.objects.filter(student=student, status=0).count(),
            "notifications": {
                "skillshare": skillshare_count,
                "assessment": pending_assessments,
                "chat": chat_count,
                "resources": resource_count,
                "certificates": certificate_new_count,
                "internships_courses": internship_new_count
            },
            "profile_incomplete": {
                "about": not bool(student.about_me),
                "picture": not bool(student.picture),
                "skills": not StudentSkill.objects.filter(student=student).exists()
            }
        }, status=200)



# =========================
# ✅ NEW API: GET MY LEVEL + PARTNER LEVEL (Form.jsx needs this)
# GET /api/study/my-level/<study_id>/
# =========================
@api_view(["GET"])
def get_my_study_level(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "StudyConnection not found"}, status=404)

    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    if student == study.student1:
        my_skill = study.student1_skill
        partner_skill = study.student2_skill
        role = "student1"
    else:
        my_skill = study.student2_skill
        partner_skill = study.student1_skill
        role = "student2"

    my_level = my_skill.level if my_skill else "Basic"
    partner_level = partner_skill.level if partner_skill else "Basic"

    return Response({
        "study_id": study.study_id,
        "role": role,
        "my_level": my_level,
        "partner_level": partner_level,
    }, status=200)


# =========================
# UPDATE STUDY STATUS
# =========================
@api_view(["POST"])
def update_study_status(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    status_value = request.data.get("status")

    if status_value not in ["Completed", "Cancelled"]:
        return Response({"error": "Invalid status"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "StudyConnection not found"}, status=404)

    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    # =========================
    # GET STUDENT SKILLS FOR EMAIL
    # =========================
    my_skill = study.student1_skill if study.student1 == student else study.student2_skill
    partner = study.student2 if study.student1 == student else study.student1
    
    # =========================
    # GET TEACHER TO NOTIFY (Before potentially clearing it)
    # =========================
    teacher_to_notify = study.teacher

    # =========================
    # UPDATE STUDY STATUS
    # =========================
    study.status = status_value
    study.save()

    # =========================
    # FREE STUDENT SKILLS & CLEANUP (Only on Cancelled)
    # =========================
    if status_value == "Cancelled":
        # Delete associated assessment data
        Assessment.objects.filter(study=study).delete()

        # ✅ Update skills to 1 (Available) for both students
        if study.student1_skill:
            study.student1_skill.status = 1
            study.student1_skill.save()
        if study.student2_skill:
            study.student2_skill.status = 1
            study.student2_skill.save()

        if study.teacher:
            # We already captured teacher_to_notify above
            study.teacher.status = 0
            study.teacher.save()
            study.teacher = None
            study.save(update_fields=["teacher"])


    if teacher_to_notify:
        try:
            if status_value == "Completed":
                subject = "Student Study Completion Notification - ELEVARE"
                
                text_body = f"""Hello {teacher_to_notify.name},

We are pleased to inform you that {student.username} has successfully completed their study session.

Student: {student.username}
Partner: {partner.username}
Skills Exchanged: {my_skill.offer if my_skill else 'N/A'} ↔ {my_skill.want if my_skill else 'N/A'}

Congratulations on guiding them through this learning journey!

Best regards,
ELEVARE Team
"""
                
                html_body = f"""
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                    <h2 style="color: #166534;">Study Completion Notification ✅</h2>
                    <p>Hello <strong>{teacher_to_notify.name}</strong>,</p>
                    <p>We are pleased to inform you that <strong>{student.username}</strong> has successfully completed their study session.</p>
                    <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #166534; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Student:</strong> {student.username}</p>
                        <p style="margin: 5px 0;"><strong>Partner:</strong> {partner.username}</p>
                        <p style="margin: 5px 0;"><strong>Skills Exchanged:</strong> {my_skill.offer if my_skill else 'N/A'} ↔ {my_skill.want if my_skill else 'N/A'}</p>
                    </div>
                    <p>Congratulations on guiding them through this learning journey! 🎓</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #666; font-size: 0.9em;">Best regards,<br>ELEVARE Team</p>
                </div>
                """
            else:  # Cancelled
                subject = "Student Study Cancellation Notification - ELEVARE"
                
                text_body = f"""Hello {teacher_to_notify.name},

This is to inform you that {student.username} has cancelled their study session.

Student: {student.username}
Partner: {partner.username}
Skills: {my_skill.offer if my_skill else 'N/A'} ↔ {my_skill.want if my_skill else 'N/A'}

Thank you for your time and support.

Best regards,
ELEVARE Team
"""
                
                html_body = f"""
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                    <h2 style="color: #dc2626;">Study Cancellation Notification</h2>
                    <p>Hello <strong>{teacher_to_notify.name}</strong>,</p>
                    <p>This is to inform you that <strong>{student.username}</strong> has cancelled their study session.</p>
                    <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Student:</strong> {student.username}</p>
                        <p style="margin: 5px 0;"><strong>Partner:</strong> {partner.username}</p>
                        <p style="margin: 5px 0;"><strong>Skills:</strong> {my_skill.offer if my_skill else 'N/A'} ↔ {my_skill.want if my_skill else 'N/A'}</p>
                    </div>
                    <p>Thank you for your time and support.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #666; font-size: 0.9em;">Best regards,<br>ELEVARE Team</p>
                </div>
                """
            
            from django.core.mail import EmailMultiAlternatives
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[teacher_to_notify.email]
            )
            email.attach_alternative(html_body, "text/html")
            email.send(fail_silently=False)
        except Exception as e:
            print(f"Failed to send email to teacher: {str(e)}")

    return Response(
        {
            "message": f"Study marked as {status_value} ✅",
            "study_id": study.study_id
        },
        status=200
    )

# =========================
# PROFILE (GET / PUT / DELETE)
# =========================
@api_view(["GET", "PUT", "DELETE"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def my_student_profile(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    if request.method == "GET":
        serializer = StudentSerializer(student)
        data = serializer.data

        data["uploaded_certificates"] = [
            {"id": cert.id, "file": request.build_absolute_uri(cert.file.url)}
            for cert in student.uploaded_certificates.all()
        ]
        return Response(data)

    if request.method == "PUT":
        serializer = StudentSerializer(student, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        for file in request.FILES.getlist("uploaded_certificates"):
            StudentUploadedCertificate.objects.create(student=student, file=file)

        serializer = StudentSerializer(student)
        data = serializer.data
        data["uploaded_certificates"] = [
            {"id": cert.id, "file": request.build_absolute_uri(cert.file.url)}
            for cert in student.uploaded_certificates.all()
        ]
        return Response(data, status=200)

    if request.method == "DELETE":
        cert_id = request.data.get("certificate_id")
        if not cert_id:
            return Response({"error": "certificate_id required"}, status=400)

        try:
            cert = StudentUploadedCertificate.objects.get(id=cert_id, student=student)
            cert.delete()
            return Response({"message": "Certificate deleted ✅"}, status=200)
        except StudentUploadedCertificate.DoesNotExist:
            return Response({"error": "Certificate not found"}, status=404)


# =========================
# CHECK STUDENT ELIGIBILITY
# =========================
@api_view(["GET"])
def check_student_eligibility(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    study_ok = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student),
        status__in=["Completed", "Cancelled"]
    ).exists()

    assessment_ok = Assessment.objects.filter(
        student=student,
        status__in=["Completed", "Cancelled"]
    ).exists()

    return Response({"study_ok": study_ok, "assessment_ok": assessment_ok})


# =========================
# GET LATEST SKILL
# =========================
@api_view(["GET"])
def get_latest_skill(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    latest_skill = StudentSkill.objects.filter(student=student).order_by("-student_skill_id").first()

    if not latest_skill:
        return Response({"exists": False})

    return Response({
        "exists": True,
        "student_skill_id": latest_skill.student_skill_id,
        "offer": latest_skill.offer,
        "want": latest_skill.want,
        "level": latest_skill.level,
        "status": latest_skill.status,
    })


# =========================
# =========================
# STUDENT SKILL
# =========================
@api_view(["POST"])
@parser_classes([JSONParser])
def student_skill_create_list(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    study_id = request.data.get("study_id")

    def clean(v):
        return v.strip() if v and v.strip() else None

    offer = clean(request.data.get("offer"))
    want = clean(request.data.get("want"))
    description = clean(request.data.get("description"))
    level = request.data.get("level", "Basic")

    # =========================
    # CREATE / UPDATE PENDING SKILL (Robustly)
    # =========================
    try:
        # ✅ CREATE A NEW ROW (Requirement: "add a new row teh stdunetskill table")
        skill = StudentSkill.objects.create(
            student=student,
            status=0, # Mark as BUSY (Requirement: "status=0")
            offer=offer,
            want=want,
            description=description,
            level=level
        )

        # =========================
        # 🔥 SMART LINK SKILL TO STUDY & MARK BUSY
        # =========================
        if study_id:
            try:
                study = StudyConnection.objects.get(study_id=study_id)
                
                if study.student1_id == student.student_id:
                    study.student1_skill = skill
                elif study.student2_id == student.student_id:
                    study.student2_skill = skill
                
                # Mark study as Progress and skill as Busy (0)
                study.status = "Progress"
                skill.status = 0
                
                study.save()
                skill.save()
            except StudyConnection.DoesNotExist:
                pass

        return Response(
            {
                "message": "Skill saved & linked to study ✅",
                "offer": skill.offer,
                "want": skill.want,
            },
            status=200
        )

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"CRITICAL ERROR in student_skill_create_list: {error_details}")
        return Response({
            "error": str(e),
            "traceback": error_details
        }, status=500)






# =========================
# MATCHES
# =========================
@api_view(["POST"])
@parser_classes([JSONParser])
def student_skill_matches(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    offer = request.data.get("offer")
    want = request.data.get("want")

    if not offer or not want:
        return Response({"error": "offer and want required"}, status=400)

    matches = StudentSkill.objects.filter(
        offer__isnull=False,
        want__isnull=False,
        status=0,
        offer__iexact=want,
        want__iexact=offer,
    ).exclude(student=student)

    available = []
    for m in matches:
        busy = StudyConnection.objects.filter(
            Q(student1=m.student) | Q(student2=m.student),
            status__in=["Started", "Progress"]
        ).exists()

        if not busy:
            available.append(m)

    seen = set()
    data = []
    for m in available:
        if m.student_id in seen:
            continue
        seen.add(m.student_id)

        avg_rating = Rating.objects.filter(
            rated_to=m.student
        ).aggregate(avg=Avg("rating_value"))["avg"] or 0

        data.append({
            "student_id": m.student.student_id,
            "username": m.student.username,
            "picture": request.build_absolute_uri(m.student.picture.url)
            if m.student.picture else None,
            "offer": m.offer,
            "want": m.want,
            "level": m.level,
            "rating": round(avg_rating, 1),
        })

    return Response(sorted(data, key=lambda x: x["rating"], reverse=True), status=200)


# =========================
# STUDENT DETAIL
# =========================
@api_view(["GET"])
def get_student_detail(request, student_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        s = Student.objects.get(student_id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    # ✅ Student Uploaded Certificates
    uploaded = [
        {
            "id": f"U{cert.id}",
            "file": request.build_absolute_uri(cert.file.url),
            "uploaded_at": cert.uploaded_at,
            "type": "Uploaded"
        }
        for cert in s.uploaded_certificates.all()
    ]

    # ✅ Platform Generated Official Certificates
    official = []
    platform_certs = Certificate.objects.filter(student=s, status=0)
    for pc in platform_certs:
        official.append({
            "id": f"O{pc.certificate_id}",
            "file": None, # Dynamic render on frontend
            "uploaded_at": pc.issued_date,
            "type": "Official"
        })

    # ✅ Partner's Latest Skill Status
    latest_skill = StudentSkill.objects.filter(student=s).order_by("-student_skill_id").first()
    skill_status = latest_skill.status if latest_skill else None

    # ✅ Completed & Cancelled Counts
    completed_skills = StudyConnection.objects.filter(
        (Q(student1=s) | Q(student2=s)),
        status="Completed"
    ).count()

    cancelled_studies = StudyConnection.objects.filter(
        (Q(student1=s) | Q(student2=s)),
        status="Cancelled"
    ).count()

    data = {
        "student_id": s.student_id,
        "username": s.username,
        "department": s.department,
        "year": s.year,
        "about_me": s.about_me,
        "skills": s.skills,
        "picture": request.build_absolute_uri(s.picture.url) if s.picture else None,
        "certificates": uploaded + official,
        "latest_skill_status": skill_status,
        "completed_skills": completed_skills,
        "cancelled_studies": cancelled_studies,
    }

    return Response(data, status=200)


# =========================
# CREATE STUDY CONNECTION
# =========================
@api_view(["POST"])
@parser_classes([JSONParser])
def create_studyconnection(request):
    student1 = get_student_from_token(request)
    if not student1:
        return Response({"error": "Unauthorized"}, status=401)

    student2_id = request.data.get("student2_id")
    if not student2_id:
        return Response({"error": "student2_id is required"}, status=400)

    try:
        student2 = Student.objects.get(student_id=student2_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    # ❌ BLOCK if logged-in student has ACTIVE study
    active_me = StudyConnection.objects.filter(
        Q(student1=student1) | Q(student2=student1),
        status__in=["Started", "Progress"]
    ).exists()

    if active_me:
        return Response(
            {"error": "Complete your current study before connecting ❌"},
            status=400
        )

    # ❌ BLOCK if selected student has ACTIVE study
    active_other = StudyConnection.objects.filter(
        Q(student1=student2) | Q(student2=student2),
        status__in=["Started", "Progress"]
    ).exists()

    if active_other:
        return Response(
            {"error": "This student is already connected ❌"},
            status=400
        )

    # ✅ Initial check: ensure partner has an AVAILABLE skill (status=1)
    # But we DON'T link it yet. It will be linked when they submit the form.
    student2_skill_available = StudentSkill.objects.filter(
        student=student2,
        status=1
    ).exists()

    if not student2_skill_available:
        return Response(
            {"error": "This student does not have any available skills to connect with ❌"},
            status=400
        )

    start_date = timezone.now().date()
    end_date = start_date + timedelta(days=7)

    study = StudyConnection.objects.create(
        student1=student1,
        student2=student2,
        student1_skill=None,  # ✅ Start NULL
        student2_skill=None,  # ✅ Start NULL
        start_date=start_date,
        end_date=end_date,
        status="Started"
    )

    return Response(
        {
            "message": "Study connection created ✅",
            "study_id": study.study_id
        },
        status=201
    )



# =========================
# TEACHER LIST
# =========================
@api_view(["GET"])
def teacher_list(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    q = request.GET.get("q", "").strip()
    department = request.GET.get("department", "").strip()

    teachers = Teacher.objects.filter(status=0)

    if q:
        teachers = teachers.filter(name__icontains=q)

    if department:
        teachers = teachers.filter(department__iexact=department)

    teachers = teachers.order_by("name")

    data = []
    for t in teachers:
        data.append({
            "teacher_id": t.teacher_id,
            "name": t.name,
            "email": t.email,
            "department": t.department,
            "profile": request.build_absolute_uri(t.profile.url) if t.profile else None,
        })

    return Response(data, status=200)


# =========================
# SELECT TEACHER FOR STUDY
# =========================
# =========================
# SELECT / UPDATE TEACHER ✅ FIXED
# =========================
@api_view(["POST"])
@parser_classes([JSONParser])
def select_teacher_for_study(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    teacher_id = request.data.get("teacher_id")
    if not teacher_id:
        return Response({"error": "teacher_id is required"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "Study not found"}, status=404)

    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    # ✅ RESET OLD TEACHER
    if study.teacher:
        old_teacher = study.teacher
        old_teacher.status = 0
        old_teacher.save()

    try:
        new_teacher = Teacher.objects.get(teacher_id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

    # ✅ ASSIGN NEW TEACHER
    new_teacher.status = 1
    new_teacher.save()

    study.teacher = new_teacher
    study.save()

    # ✅ Identify Partner & Departments
    partner = study.student2 if study.student1 == student else study.student1
    partner_name = partner.username if partner else "Pending Partner"
    
    student_dept = student.department or "N/A"
    partner_dept = partner.department or "N/A" if partner else "N/A"

    # ✅ EMAIL
    text_body = f"""Hello {new_teacher.name},

We are delighted to inform you that you have been assigned as a mentor for a new study connection.

Student 1: {student.username} (Dept: {student_dept})
Student 2: {partner_name} (Dept: {partner_dept})

We appreciate your dedication to guiding students through their learning journey. Your expertise and support will be invaluable to their success.

Thank you for being an integral part of the ELEVARE community!

Best regards,
ELEVARE Team
"""
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <h2 style="color: #1E3A8A;">New Mentorship Assignment 🎓</h2>
        <p>Hello <strong>{new_teacher.name}</strong>,</p>
        <p>We are delighted to inform you that you have been assigned as a mentor for a new study connection.</p>
        <div style="background: #eff6ff; padding: 20px; border-left: 4px solid #1E3A8A; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Student 1:</strong> {student.username} <span style="color: #64748b; font-size: 0.9em;">({student_dept})</span></p>
            <p style="margin: 5px 0;"><strong>Student 2:</strong> {partner_name} <span style="color: #64748b; font-size: 0.9em;">({partner_dept})</span></p>
        </div>
        <p>We appreciate your dedication to guiding students through their learning journey. Your expertise and support will be invaluable to their success.</p>
        <p>Thank you for being an integral part of the ELEVARE community! 🌟</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #666; font-size: 0.9em;">Best regards,<br>ELEVARE Team</p>
    </div>
    """

    from django.core.mail import EmailMultiAlternatives
    email = EmailMultiAlternatives(
        subject="New Mentorship Assignment - ELEVARE",
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[new_teacher.email]
    )
    email.attach_alternative(html_body, "text/html")

    # ✅ Attach Validation Forms if they exist (Setup phase uploads)
    assessments = Assessment.objects.filter(study=study)
    for assess in assessments:
        if assess.validation_form_file:
            try:
                email.attach(
                    f"{assess.student.username}_ValidationForm_{assess.validation_form_file.name}",
                    assess.validation_form_file.read(),
                    assess.validation_form_file.file.content_type if hasattr(assess.validation_form_file.file, 'content_type') else 'application/octet-stream'
                )
            except Exception as attachment_err:
                print(f"DEBUG: Failed to attach form for {assess.student.username}: {str(attachment_err)}")

    email.send(fail_silently=False)

    return Response(
        {
            "message": "Teacher updated successfully ✅",
            "teacher_name": new_teacher.name
        },
        status=200
    )


# =========================
# GET SELECTED TEACHER
# =========================
@api_view(["GET"])
def get_selected_teacher(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "StudyConnection not found"}, status=404)

    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    if not study.teacher:
        return Response({"teacher": None}, status=200)

    t = study.teacher
    return Response({
        "teacher": {
            "teacher_id": t.teacher_id,
            "name": t.name,
            "email": t.email,
            "department": t.department,
            "profile": request.build_absolute_uri(t.profile.url) if t.profile else None,
        }
    }, status=200)


# =========================
# UPDATE END DATE
# =========================
@api_view(["POST"])
@parser_classes([JSONParser])
def update_study_enddate(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    end_date = request.data.get("end_date")
    if not end_date:
        return Response({"error": "end_date is required"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "StudyConnection not found"}, status=404)

    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    study.end_date = end_date
    study.save()

    return Response({"message": "End date updated ✅"}, status=200)


# =========================
# ✅ CREATE ASSESSMENT FOR BOTH (NO assessment_type/title)
# POST /api/assessment/create/
# =========================
@api_view(["POST"])
@parser_classes([JSONParser])
def create_assessment_for_both(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    study_id = request.data.get("study_id")
    if not study_id:
        return Response({"error": "study_id is required"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "Study not found"}, status=404)

    # ❌ Security check
    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    # ✅ Get correct skill for logged-in student
    skill = (
        study.student1_skill
        if study.student1_id == student.student_id
        else study.student2_skill
    )

    # ❌ NO OFFER + NO WANT → DO NOTHING
    if not skill or (not skill.offer and not skill.want):
        return Response(
            {"message": "No skills provided. Assessment not required."},
            status=200
        )

    # =========================
    # CREATE ASSESSMENTS (NO DUPLICATES)
    # =========================
    
    # Identifies both students and their skills
    s1, s1_skill = study.student1, study.student1_skill
    s2, s2_skill = study.student2, study.student2_skill

    # ✅ Create for Student 1 if they are LEARNING (want is NOT null/empty)
    if s1_skill and s1_skill.want and s1_skill.want.strip().lower() != "none":
        Assessment.objects.get_or_create(
            study=study,
            student=s1,
            defaults={"status": "Submitted"}
        )

    # ✅ Create for Student 2 if they are LEARNING (want is NOT null/empty)
    if s2_skill and s2_skill.want and s2_skill.want.strip().lower() != "none":
        Assessment.objects.get_or_create(
            study=study,
            student=s2,
            defaults={"status": "Submitted"}
        )

    # =========================
    # MOVE STUDY → PROGRESS (ONLY ONCE)
    # =========================
    if study.status != "Progress":
        study.status = "Progress"
        study.save(update_fields=["status"])

    return Response(
        {
            "message": "Assessment created ✅",
            "study_status": study.status
        },
        status=201
    )






@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_validation_form(request):
    """
    Initial upload of validation form during study setup.
    Stored ONLY in validation_form_file field.
    """
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    study_id = request.data.get("study_id")
    file = request.FILES.get("validation_form_file")

    if not study_id:
        return Response({"error": "study_id is required"}, status=400)

    if not file:
        return Response({"error": "validation_form_file is required"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "StudyConnection not found"}, status=404)

    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    assessment, _ = Assessment.objects.get_or_create(study=study, student=student)
    
    # ✅ Save ONLY Validation Form
    if file:
        assessment.validation_form_file = file
    
    assessment.status = "Submitted"
    assessment.save()

    return Response({"message": "Validation form uploaded ✅"}, status=200)


# =========================
# ✅ ASSESSMENT STATUS
# GET /api/assessment/status/
# =========================
@api_view(["GET"])
def assessment_status(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    # 🔥 1️⃣ Get FIRST pending assessment (Submitted)
    # Filter by study status: ONLY Completed studies
    pending = (
        Assessment.objects
        .filter(student=student, status="Submitted", study__status="Completed")
        .order_by("assessment_id")
        .first()
    )

    if not pending:
        # Check if they have ANY assessment that is not yet completed (for better message)
        has_pending = Assessment.objects.filter(student=student, status="Submitted").exists()
        if has_pending:
            return Response(
                {
                    "eligible": False,
                    "message": "Assessment will open only after your study status is marked as Completed. ⏳"
                },
                status=200
            )

        return Response(
            {
                "eligible": False,
                "message": "You have no pending assessments 🎉"
            },
            status=200
        )

    study = pending.study
    partner = study.student2 if study.student1 == student else study.student1

    # get correct skill
    my_skill = (
        study.student1_skill if study.student1 == student
        else study.student2_skill
    )

    return Response(
        {
            "eligible": True,
            "assessment_id": pending.assessment_id,
            "study_id": study.study_id,
            "my_level": my_skill.level if my_skill else "Basic",
            "partner_id": partner.student_id,
            "partner_name": partner.username,
            "teacher_name": study.teacher.name if study.teacher else None,
        },
        status=200
    )



# =========================
# ✅ SUBMIT ASSESSMENT (Upload ALL)
# POST /api/assessment/submit/
# =========================
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def submit_assessment(request):
    try:
        student = get_student_from_token(request)
        if not student:
            return Response({"error": "Unauthorized"}, status=401)

        study_id = request.data.get("study_id")
        if not study_id:
            return Response({"error": "study_id is required"}, status=400)

        try:
            study = StudyConnection.objects.get(study_id=study_id)
        except StudyConnection.DoesNotExist:
            return Response({"error": "StudyConnection not found"}, status=404)

        if student not in [study.student1, study.student2]:
            return Response({"error": "Forbidden"}, status=403)

        # =========================
        # SAVE / UPDATE ASSESSMENT
        # =========================
        assessment, _ = Assessment.objects.get_or_create(
            study=study,
            student=student
        )

        project_title = request.data.get("project_title")
        assessment_work = request.data.get("assessment_work")

        if project_title:
            assessment.project_title = project_title

        if assessment_work:
            assessment.assessment_work = assessment_work

        if "validation_form_file" in request.FILES:
            assessment.validation_form_file = request.FILES["validation_form_file"]

        if "assessment_file" in request.FILES:
            assessment.assessment_file = request.FILES["assessment_file"]

        assessment.status = "Completed"
        assessment.save()

        # =========================
        # GET TEACHER TO NOTIFY (Before potentially clearing it)
        # =========================
        teacher_to_notify = study.teacher

        # =========================
        # ✅ STAGGERED COMPLETION LOGIC
        # =========================
        partner = study.student2 if study.student1 == student else study.student1
        
        # Check if partner exists in assessment table with status="Submitted" (Pending)
        partner_pending = Assessment.objects.filter(study=study, student=partner, status="Submitted").exists()
        
        # 1. Update ONLY own skill (Set to 1 = Available/Completed)
        my_skill = study.student1_skill if study.student1 == student else study.student2_skill
        if my_skill:
            my_skill.status = 1
            my_skill.save(update_fields=["status"])

        # 2. Logic: If partner NOT present with status="Submitted", we can complete the study
        if not partner_pending:
            # Update partner skill too (safety check)
            partner_skill = study.student2_skill if study.student1 == student else study.student1_skill
            if partner_skill:
                partner_skill.status = 1
                partner_skill.save(update_fields=["status"])

            # 🔥 RESET TEACHER STATUS
            if study.teacher:
                study.teacher.status = 0
                study.teacher.save()
                study.teacher = None
                study.save(update_fields=["teacher"])

            # COMPLETE STUDY
            study.status = "Completed"
            study.save()
        else:
            # Study stays in Progress because partner is still active/pending
            print(f"DEBUG: Study {study_id} remains in Progress because partner {partner.username} is pending assessment")

        # =========================
        # ISSUE CERTIFICATE (NO DUPLICATION ✅)
        # =========================
        cert, created = Certificate.objects.get_or_create(
            student=student,
            study=study
        )
        if not created and cert.status == 1:
            cert.status = 0
            cert.save()

        # =========================
        # EMAIL TEACHER (OPTIONAL)
        # =========================
        if teacher_to_notify:
            text_body = f"""Hello {teacher_to_notify.name},

We are delighted to inform you that {student.username} has successfully completed their assessment!

Student: {student.username}
Project Title: {assessment.project_title or "Not specified"}
Assessment Work: {assessment.assessment_work or "Not specified"}

A certificate has been issued automatically to recognize their achievement.

Attached to this email, you will find the student's submission document (Validation Form).

Congratulations on successfully mentoring this student through their learning journey!

Best regards,
ELEVARE Team
"""

            html_body = f"""
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                <h2 style="color: #166534;">Assessment Completed Successfully ✅</h2>
                <p>Hello <strong>{teacher_to_notify.name}</strong>,</p>
                <p>We are delighted to inform you that <strong>{student.username}</strong> has successfully completed their assessment!</p>
                <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #166534; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Student:</strong> {student.username}</p>
                    <p style="margin: 5px 0;"><strong>Project Title:</strong> {assessment.project_title or "Not specified"}</p>
                    <p style="margin: 5px 0;"><strong>Assessment Work:</strong> {assessment.assessment_work or "Not specified"}</p>
                </div>
                <p><em>A certificate has been issued automatically to recognize their achievement.</em> 🎓</p>
                <p>Attached to this email, you will find the student's submission document (Validation Form).</p>
                <p>Congratulations on successfully mentoring this student through their learning journey!</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #666; font-size: 0.9em;">Best regards,<br>ELEVARE Team</p>
            </div>
            """

            from django.core.mail import EmailMultiAlternatives
            email = EmailMultiAlternatives(
                subject="Student Assessment Completed - ELEVARE",
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[teacher_to_notify.email]
            )
            email.attach_alternative(html_body, "text/html")

            # ✅ Attach Validation Form
            if assessment.validation_form_file:
                try:
                    email.attach(
                        assessment.validation_form_file.name,
                        assessment.validation_form_file.read(),
                        getattr(assessment.validation_form_file.file, 'content_type', 'application/octet-stream')
                    )
                except Exception as attachment_err:
                    print(f"Error attaching validation_form_file: {attachment_err}")

            email.send(fail_silently=False)

        return Response(
            {
                "message": "Assessment completed ✅ Certificate issued 🎓"
            },
            status=200
        )
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"CRITICAL ERROR in submit_assessment: {error_details}")
        return Response({
            "error": str(e),
            "traceback": error_details
        }, status=500)




# =========================
# ✅ SAVE RATING
# POST /api/rating/save/
# =========================
@api_view(["POST"])
@parser_classes([JSONParser])
def save_rating(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    study_id = request.data.get("study_id")
    rating_value = request.data.get("rating_value")

    if not study_id or not rating_value:
        return Response({"error": "study_id and rating_value required"}, status=400)

    try:
        rating_value = int(rating_value)
    except:
        return Response({"error": "rating_value must be number"}, status=400)

    if rating_value < 1 or rating_value > 5:
        return Response({"error": "rating_value must be 1-5"}, status=400)

    study = StudyConnection.objects.filter(study_id=study_id).first()
    if not study:
        return Response({"error": "Study not found"}, status=404)

    if student.student_id not in [study.student1_id, study.student2_id]:
        return Response({"error": "Forbidden"}, status=403)

    partner = study.student2 if study.student1 == student else study.student1

    Rating.objects.update_or_create(
        study=study,
        rated_by=student,
        rated_to=partner,
        defaults={"rating_value": rating_value},
    )

    return Response({"message": "Rating saved ✅"}, status=200)



# =========================
# CHAT MESSAGES
# =========================
@api_view(["GET"])
def get_chat_messages(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "Study not found"}, status=404)

    if student.student_id not in [study.student1_id, study.student2_id]:
        return Response({"error": "Forbidden"}, status=403)

    # 🔥 NEW CONDITION
    is_closed, reason = should_close_chat(study, student)
    if is_closed:

        return Response(
            {
                "message": reason,
                "study_status": study.status,
                "data": [],
            },
            status=200
        )

    msgs = ChatMessage.objects.filter(study=study).order_by("sent_at")

    data = [
        {
            "message_id": m.message_id,
            "sender_id": m.sender.student_id,
            "sender_name": m.sender.username,
            "message_text": m.message_text,
            "sent_at": m.sent_at,
        }
        for m in msgs
    ]

    return Response(
        {
            "study_status": study.status,
            "data": data
        },
        status=200
    )


@api_view(["POST"])
@parser_classes([JSONParser])
def send_chat_message(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    message_text = request.data.get("message_text", "").strip()
    if not message_text:
        return Response({"error": "message_text is required"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "Study not found"}, status=404)

    if student.student_id not in [study.student1_id, study.student2_id]:
        return Response({"error": "Forbidden"}, status=403)

    # 🔥 NEW CONDITION
    is_closed, reason = should_close_chat(study, student)
    if is_closed:
        return Response({"error": reason}, status=400)

    msg = ChatMessage.objects.create(
        study=study,
        sender=student,
        message_text=message_text
    )

    return Response(
        {
            "message": "Message sent ✅",
            "study_status": study.status,
            "data": {
                "message_id": msg.message_id,
                "sender_id": msg.sender.student_id,
                "sender_name": msg.sender.username,
                "message_text": msg.message_text,
                "sent_at": msg.sent_at,
            }
        },
        status=201
    )



@api_view(["GET"])
def get_my_certificates(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    certificates = (
        Certificate.objects
        .filter(student=student, status=0)
        .select_related("study")
        .order_by("-issued_date")[:20]
    )

    data = []
    for cert in certificates:
        study = cert.study

        # ✅ Identify correct StudentSkill
        if student == study.student1:
            skill_obj = study.student1_skill
        else:
            skill_obj = study.student2_skill

        data.append({
            "certificate_id": cert.certificate_id,
            "student_name": student.username,
            "department": student.department,
            "skill": skill_obj.want if skill_obj else "-",
            "level": skill_obj.level if skill_obj else "-",
            "issued_date": cert.issued_date.date(),
            "study_id": study.study_id,
        })

    return Response(data, status=200)
@api_view(["GET"])
def get_active_study_for_resource(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    # 1. Check latest skill status (Gatekeeper)
    latest_skill = StudentSkill.objects.filter(student=student).order_by("-student_skill_id").first()
    if not latest_skill or latest_skill.status != 0:
        return Response({"exists": False}, status=200)

    # 2. Find study linked to this active skill
    study = StudyConnection.objects.filter(
        Q(student1_skill=latest_skill) | Q(student2_skill=latest_skill)
    ).first()

    if not study:
        return Response({"exists": False}, status=200)

    return Response({
        "exists": True,
        "study_id": study.study_id
    }, status=200)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_resource(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    # 🔥 Check student skill status (must be 0 - Active)
    latest_skill = StudentSkill.objects.filter(student=student).order_by("-student_skill_id").first()
    if not latest_skill or latest_skill.status != 0:
        return Response({"error": "Resource upload restricted. You must have an active study status (0)."}, status=403)


    study_id = request.data.get("study_id")
    file = request.FILES.get("file")
    title = request.data.get("title", "")  # Optional title

    if not study_id or not file:
        return Response({"error": "study_id and file required"}, status=400)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "Study connection not found"}, status=404)

    # Ensure the student is part of this study
    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    Resource.objects.create(
        study=study,
        uploaded_by=student,
        file_name=file.name,
        file_type=file.content_type,
        file_path=file,
        title=title if title else None
    )

    return Response({"message": "Resource uploaded ✅"}, status=201)
@api_view(["GET"])
def get_partner_resources(request, study_id):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        study = StudyConnection.objects.get(study_id=study_id)
    except StudyConnection.DoesNotExist:
        return Response({"error": "Study not found"}, status=404)

    if student not in [study.student1, study.student2]:
        return Response({"error": "Forbidden"}, status=403)

    partner = study.student2 if study.student1 == student else study.student1

    resources = Resource.objects.filter(
        study=study,
        uploaded_by=partner
    ).order_by("-uploaded_at")

    data = {
        "partner_name": partner.username,
        "resources": [
            {
                "file_name": r.file_name,
                "file_type": r.file_type,
                "file_url": request.build_absolute_uri(r.file_path.url),
                "uploaded_at": r.uploaded_at,
            }
            for r in resources
        ]
    }

    return Response(data, status=200)
@api_view(["GET"])
def get_my_studies(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    studies = (
        StudyConnection.objects
        .filter(Q(student1=student) | Q(student2=student))
        .select_related("teacher", "student1_skill", "student2_skill")
        .order_by("-study_id")
    )

    data = []
    for s in studies:
        partner = s.student2 if s.student1 == student else s.student1

        # ✅ pick correct skill for THIS STUDY
        skill = s.student1_skill if s.student1 == student else s.student2_skill

        # 🔥 HARD FALLBACK: find skill created DURING this study
        if not skill:
            skill = (
                StudentSkill.objects
                .filter(student=student)
                .order_by("-student_skill_id")
                .first()
            )

        data.append({
            "study_id": s.study_id,
            "partner_name": partner.username,
            "offer": skill.offer if skill else None,
            "want": skill.want if skill else None,
            "description": skill.description if skill else None,
            "level": skill.level if skill else None,
            "start_date": s.start_date,
            "end_date": s.end_date,
            "status": s.status,
            "teacher_name": s.teacher.name if s.teacher else "Not Assigned",
        })

    return Response(data, status=200)

# =========================
# ✅ ALL RESOURCES GROUPED BY PARTNER (HISTORY + ACTIVE)
# GET /api/resources/all/
# =========================
@api_view(["GET"])
def get_all_resources_grouped(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    studies = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student)
    ).select_related("student1", "student2")

    partner_map = {}

    for study in studies:
        partner = study.student2 if study.student1 == student else study.student1

        resources = Resource.objects.filter(
            study=study,
            uploaded_by=partner
        ).order_by("-uploaded_at")

        if not resources.exists():
            continue

        if partner.username not in partner_map:
            partner_map[partner.username] = []

        for r in resources:
            partner_map[partner.username].append({
                "title": r.title or r.file_name,
                "file_name": r.file_name,
                "file_type": r.file_type,
                "file_url": request.build_absolute_uri(r.file_path.url),
                "uploaded_at": r.uploaded_at,
            })

    return Response(
        {
            "partners": [
                {
                    "partner_name": name,
                    "resources": files
                }
                for name, files in partner_map.items()
            ]
        },
        status=200
    )

# =========================
# SHARE SKILL (COLLEGE GROUP FEED)
# =========================
from datetime import timedelta
from django.utils import timezone
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response

from .models import SkillPost


@api_view(["GET"])
def get_skill_posts(request):
    """
    College-style group feed
    Shows username + profile + message + time
    Auto-cleans posts older than 30 days
    """
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    # 🔥 Auto delete posts older than 30 days
    expiry = timezone.now() - timedelta(days=30)
    SkillPost.objects.filter(created_at__lt=expiry).delete()

    posts = (
        SkillPost.objects
        .select_related("student")
        .order_by("-created_at")
    )

    data = []
    for p in posts:
        # Get latest skill status for this student
        latest_skill = StudentSkill.objects.filter(student=p.student).order_by("-student_skill_id").first()
        skill_status = latest_skill.status if latest_skill else None

        data.append({
            "post_id": p.post_id,
            "message": p.message,
            "created_at": p.created_at,
            "student": {
                "student_id": p.student.student_id,
                "username": p.student.username,
                "latest_skill_status": skill_status,
                "profile": (
                    request.build_absolute_uri(p.student.picture.url)
                    if p.student.picture else None
                )
            }
        })

    return Response(data, status=200)


@api_view(["POST"])
@parser_classes([JSONParser])
def create_skill_post(request):
    """
    Create a new share-skill post
    """
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    message = request.data.get("message", "").strip()
    if not message:
        return Response({"error": "Message is required"}, status=400)

    SkillPost.objects.create(
        student=student,
        message=message
    )

    # =========================
    # SEND EMAIL TO ALL STUDENTS
    # =========================
    try:
        # Get all students (exclude self) who have an email
        student_emails = list(Student.objects.exclude(student_id=student.student_id).exclude(email='').values_list('email', flat=True))

        if student_emails:
            subject = f"New ShareSkill Post by {student.username} - ELEVARE"
            
            body = f"""Hello Students,

A new update has been posted in the ShareSkill section!

User: {student.username}
Message:
"{message}"

Login now to connect and help each other grow!

Best regards,
ELEVARE Team
"""

            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.DEFAULT_FROM_EMAIL], # Send to admin/self
                bcc=student_emails                # BCC everyone else
            )
            email.send(fail_silently=True)
            print(f"DEBUG: Sent ShareSkill email to {len(student_emails)} students.")

    except Exception as e:
        print(f"ERROR sending ShareSkill email: {str(e)}")

    return Response({"message": "Post created ✅"}, status=201)
@api_view(["GET"])
def get_all_students_for_connect(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    students = Student.objects.exclude(student_id=student.student_id)

    data = []
    for s in students:
        avg_rating = (
            Rating.objects.filter(rated_to=s)
            .aggregate(avg=Avg("rating_value"))["avg"] or 0
        )

        data.append({
            "student_id": s.student_id,
            "username": s.username,
            "department": s.department,
            "picture": request.build_absolute_uri(s.picture.url)
            if s.picture else None,
            "rating": round(avg_rating, 1),
        })

    return Response(data, status=200)




def should_close_chat(study, student):
    """
    Returns (is_closed, reason)
    """
    msg = "No Active Study ❌ You can chat only after connecting with a student"

    # 1. ALLOW if study is purely in setup phase or active progress
    if study.status in ["Started", "Progress"]:
        return False, ""

    # 2. Check if the CURRENT student's skill is still active (status=0)
    # This allows chat even if study is Completed but the student part isn't fully synced
    is_s1 = (study.student1_id == student.student_id)
    my_skill = study.student1_skill if is_s1 else study.student2_skill
    if my_skill and my_skill.status == 0:
        return False, ""
    
    # 3. Otherwise (Cancelled or Missing Status)
    if study.status == "Cancelled":
        ChatMessage.objects.filter(study=study).delete()
    
    return True, msg








@api_view(["GET"])
def check_need_form(request):
    """
    Checks if the logged-in student needs to fill the study setup form.
    """
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    # Scan ALL active studies for pending actions
    active_studies = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student),
        status__in=["Started", "Progress"]
    ).order_by("-study_id")

    for study in active_studies:
        # Rule 1: Always redirect if status is "Started"
        if study.status == "Started":
            return Response({"need_form": True, "study_id": study.study_id})

        # Rule 2: If "Progress", only redirect if YOUR specific skill slot is NULL
        if study.status == "Progress":
            # If I am Student 1, check my slot
            if study.student1_id == student.student_id and study.student1_skill_id is None:
                return Response({"need_form": True, "study_id": study.study_id})
            
            # If I am Student 2, check my slot
            if study.student2_id == student.student_id and study.student2_skill_id is None:
                return Response({"need_form": True, "study_id": study.study_id})

    # Rule 3: Else, no setup needed
    return Response({"need_form": False})


@api_view(["GET"])
def get_started_study(request):
    """
    Helper for frontend redirection logic (aliased to /active-started/).
    """
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    active_studies = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student),
        status__in=["Started", "Progress"]
    ).order_by("-study_id")

    for study in active_studies:
        # Rule 1: Started
        if study.status == "Started":
            return Response({"exists": True, "study_id": study.study_id})
            
        # Rule 2: Progress + NULL skill check
        if study.status == "Progress":
            if study.student1_id == student.student_id and study.student1_skill_id is None:
                return Response({"exists": True, "study_id": study.study_id})
            if study.student2_id == student.student_id and study.student2_skill_id is None:
                return Response({"exists": True, "study_id": study.study_id})

    return Response({"exists": False})
@api_view(["GET"])
def get_my_active_study_teacher(request):
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    study = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student),
        status__in=["Started", "Progress"]
    ).select_related("teacher").order_by("-study_id").first()

    if not study:
        return Response({"exists": False}, status=200)

    if not study.teacher:
        return Response({
            "exists": True,
            "study_id": study.study_id,
            "teacher": None
        })

    return Response({
        "exists": True,
        "study_id": study.study_id,
        "teacher": {
            "teacher_id": study.teacher.teacher_id,
            "name": study.teacher.name
        }
    })

# Duplicate opportunities moved to views_v3.py

# =========================
# NOTIFICATION COUNTS (STUDENT SIDEBAR)
# =========================
@api_view(["POST"])
def mark_notification_viewed(request):
    """
    Marks a specific section as viewed by updating the timestamp.
    """
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    section = request.data.get("section")
    now = timezone.now()

    if section == "skillshare":
        student.last_viewed_skillshare = now
    elif section == "resources":
        student.last_viewed_resources = now
    elif section == "chat":
        student.last_viewed_chat = now
    elif section == "assessment":
        student.last_viewed_assessment = now
    elif section == "certificates":
        student.last_viewed_certificates = now
    elif section == "internships_courses":
        student.last_viewed_internships = now
    else:
        return Response({"error": "Invalid section"}, status=400)

    student.save()
    return Response({"message": f"{section} marked as viewed"}, status=200)


@api_view(["GET"])
def get_notification_counts(request):
    """
    Returns notification counts for student sidebar badges
    Only counts items created AFTER the last_viewed timestamp.
    """
    student = get_student_from_token(request)
    if not student:
        return Response({"error": "Unauthorized"}, status=401)

    # 1. SkillShare - posts created after last view
    skillshare_count = SkillPost.objects.filter(
        created_at__gt=student.last_viewed_skillshare
    ).count()

    # 2. Assessment - studies completed after last view (using updated_at)
    # Logic: Study marked Completed is "new" if updated_at > last_viewed
    # AND assessment is not yet submitted.
    pending_assessments = 0
    completed_studies = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student),
        status="Completed",
        updated_at__gt=student.last_viewed_assessment
    )

    for study in completed_studies:
        # Check if already submitted
        if not Assessment.objects.filter(study=study, student=student).exists():
            pending_assessments += 1

    # 3. Chat - messages in active study after last view
    chat_count = 0
    active_study = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student),
        status__in=["Started", "Progress"]
    ).first()

    # Fallback to study where student has status=0 skill (even if study is 'Completed')
    if not active_study:
        active_study = StudyConnection.objects.filter(
            (Q(student1=student) & Q(student1_skill__status=0)) |
            (Q(student2=student) & Q(student2_skill__status=0))
        ).exclude(status="Cancelled").first()

    if active_study:

        chat_count = ChatMessage.objects.filter(
            study=active_study,
            sent_at__gt=student.last_viewed_chat
        ).exclude(sender=student).count() # Don't count own messages

    # 4. Resources - files uploaded by partner after last view
    resource_count = 0
    studies = StudyConnection.objects.filter(
        Q(student1=student) | Q(student2=student)
    )
    for study in studies:
        partner = study.student2 if study.student1 == student else study.student1
        resource_count += Resource.objects.filter(
            study=study,
            uploaded_by=partner,
            uploaded_at__gt=student.last_viewed_resources
        ).count()

    # 5. Certificates - created after last view
    # Note: verify if Certificate has created_at or issued_date
    certificate_count = Certificate.objects.filter(
        student=student,
        status=0,
        issued_date__gt=student.last_viewed_certificates
    ).count()

    # 6. Internships & Courses - posted after last view
    internship_course_count = InternshipCourse.objects.filter(
        posted_date__gt=student.last_viewed_internships
    ).count()

    return Response({
        "skillshare": skillshare_count,
        "assessment": pending_assessments,
        "chat": chat_count,
        "resources": resource_count,
        "certificates": certificate_count,
        "internships_courses": internship_course_count
    }, status=200)

