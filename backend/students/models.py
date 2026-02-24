from django.db import models
from django.utils import timezone


# =======================
# STUDENT
# =======================
class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=10, unique=True)
    department = models.CharField(max_length=50)
    # Year: 1 to 5
    year = models.IntegerField(default=1)
    about_me = models.TextField(blank=True, null=True)
    picture = models.ImageField(upload_to="students/", blank=True, null=True)
    skills = models.TextField(blank=True, null=True)

    certificate_file = models.FileField(upload_to="certificates1/", blank=True, null=True)

    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    api_token = models.CharField(max_length=64, blank=True, null=True, unique=True)
    reset_otp = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)

    # ✅ Notification Last Viewed Timestamps
    last_viewed_skillshare = models.DateTimeField(default=timezone.now)
    last_viewed_resources = models.DateTimeField(default=timezone.now)
    last_viewed_chat = models.DateTimeField(default=timezone.now)
    last_viewed_assessment = models.DateTimeField(default=timezone.now)
    last_viewed_certificates = models.DateTimeField(default=timezone.now)
    last_viewed_internships = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.username


# =======================
# TEACHER ✅ NEW TABLE
# =======================
class Teacher(models.Model):
    teacher_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=50)
    profile = models.ImageField(upload_to="teachers/", blank=True, null=True)
    phone_number = models.CharField(max_length=10, blank=True, null=True)
    teacher_otp = models.CharField(max_length=6, blank=True, null=True)
    teacher_otp_expiry = models.DateTimeField(blank=True, null=True)

    # ✅ 0 = available/free , 1 = assigned/busy
    status = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# =======================
# STUDENT SKILL
# =======================
class StudentSkill(models.Model):
    LEVEL_CHOICES = [
        ("Basic", "Basic"),
        ("Medium", "Medium"),
        ("Hard", "Hard"),
    ]

    student_skill_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    offer = models.CharField(max_length=100, null=True, blank=True)
    want = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    level = models.CharField(
        max_length=10,
        choices=LEVEL_CHOICES,
        default="Basic"
    )

    # 0 = pending, 1 = completed
    status = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.student.username} - {self.offer or 'No Offer'} ({self.level})"



# =======================
# STUDY CONNECTION
# =======================
class StudyConnection(models.Model):
    STATUS_CHOICES = [
        ("Started", "Started"),
        ("Progress", "Progress"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

   
    study_id = models.AutoField(primary_key=True)

    student1 = models.ForeignKey(Student, related_name="study_owner", on_delete=models.CASCADE)
    student2 = models.ForeignKey(Student, related_name="study_partner", on_delete=models.CASCADE)

    student1_skill = models.ForeignKey(
        StudentSkill,
        related_name="study_as_student1",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    student2_skill = models.ForeignKey(
        StudentSkill,
        related_name="study_as_student2",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    # ✅ Mentor Teacher
    teacher = models.ForeignKey(
        Teacher,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    # ✅ Mentor Approve/Reject
    

    start_date = models.DateField()
    end_date = models.DateField()

    start_date = models.DateField()
    end_date = models.DateField()

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="Started")
    updated_at = models.DateTimeField(auto_now=True)  # ✅ Track status changes for assessment notifications

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Study {self.study_id} ({self.status})"


# =======================
# CHAT MESSAGE
# =======================
class ChatMessage(models.Model):
    message_id = models.AutoField(primary_key=True)
    study = models.ForeignKey(StudyConnection, on_delete=models.CASCADE)
    sender = models.ForeignKey(Student, on_delete=models.CASCADE)
    message_text = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.message_id}"


# =======================
# ASSESSMENT
# =======================
class Assessment(models.Model):
    STATUS_CHOICES = [
        ("Submitted", "Submitted"),
        ("Completed", "Completed"),
    ]

    assessment_id = models.AutoField(primary_key=True)
    study = models.ForeignKey(StudyConnection, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    project_title = models.CharField(max_length=255, null=True, blank=True)
    assessment_work = models.CharField(max_length=255, null=True, blank=True)

    assessment_file = models.FileField(upload_to="assessments/", blank=True, null=True)
    validation_form_file = models.FileField(upload_to="validation_forms/", blank=True, null=True)

    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Submitted")

    def __str__(self):
        return f"Assessment {self.assessment_id}"


# =======================
# CERTIFICATE
# =======================
class Certificate(models.Model):
    certificate_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    study = models.ForeignKey(StudyConnection, on_delete=models.CASCADE)
    
    # 0 = Valid, 1 = Cancelled
    status = models.IntegerField(default=0)
    issued_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Certificate {self.certificate_id}"



# =======================
# UPLOADED CERTIFICATES
# =======================
class StudentUploadedCertificate(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="uploaded_certificates")
    file = models.FileField(upload_to="student_certificates/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.file.name}"


# =======================
# INTERNSHIP / COURSE
# =======================
class InternshipCourse(models.Model):
    post_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    description = models.TextField()
    link = models.URLField()
    posted_date = models.DateTimeField(auto_now_add=True)
    
    # New fields for V3
    posted_by_student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    is_admin_post = models.BooleanField(default=False)

    def __str__(self):
        return self.title


# =======================
# RESOURCE
# =======================
class Resource(models.Model):
    study = models.ForeignKey(StudyConnection, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(Student, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_path = models.FileField(upload_to="resources/")
    title = models.CharField(max_length=255, blank=True, null=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name


# =======================
# RATING
# =======================
class Rating(models.Model):
    rating_id = models.AutoField(primary_key=True)
    study = models.ForeignKey(StudyConnection, on_delete=models.CASCADE)
    rated_by = models.ForeignKey(Student, related_name="ratings_given", on_delete=models.CASCADE)
    rated_to = models.ForeignKey(Student, related_name="ratings_received", on_delete=models.CASCADE)
    rating_value = models.IntegerField()
    feedback = models.TextField(blank=True)
    rated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating {self.rating_value}"

# =======================
class SkillPost(models.Model):
    post_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.created_at.date()}"


# =======================
# HELP SUPPORT
# =======================
class HelpSupport(models.Model):
    issue_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True)
    issue = models.TextField()
    reply = models.TextField(blank=True, null=True)
    # 0 = Pending, 1 = Replied
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Issue {self.issue_id} - {self.student.username}"


# =======================
# WEBSITE REVIEW
# =======================
class WebsiteReview(models.Model):
    review_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    review = models.TextField()
    rating = models.IntegerField()
    # 0 = Pending, 1 = Approved
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.review_id} - {self.student.username}"
