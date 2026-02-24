from django.urls import path
from . import views
from . import views_support
from . import views_v3
from admins.views_v3 import check_unique_teacher

urlpatterns = [
    # =========================
    # AUTH
    # =========================
    path("signup/", views.signup, name="signup"),
    path("check-unique/", views.check_unique, name="check-unique"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout, name="logout"),
    path("forgot-password/request/", views.forgot_password_request, name="forgot-password-request"),
    path("forgot-password/reset/", views.forgot_password_reset, name="forgot-password-reset"),

    # =========================
    # DASHBOARD
    # =========================
    path("student-dashboard/", views.StudentDashboardView.as_view(), name="student-dashboard"),

    # =========================
    # PROFILE
    # =========================
    path("student-profile/", views.my_student_profile, name="student-profile"),

    # =========================
    # STUDY STATUS UPDATE
    # =========================
    path("update-study-status/<int:study_id>/", views.update_study_status, name="update-study-status"),

    # =========================
    # SKILLS
    # =========================
    path("student-skill/", views.student_skill_create_list, name="student-skill"),
    path("student-skill/matches/", views.student_skill_matches, name="student-skill-matches"),
    path("student-skill/latest-pending/", views.get_latest_skill, name="latest-pending-skill"),
    path("student-skill/latest/", views.get_latest_skill, name="latest-skill"),

    # =========================
    # STUDENT DETAILS
    # =========================
    path("student-eligibility/", views.check_student_eligibility, name="student-eligibility"),
    path("student/<int:student_id>/", views.get_student_detail, name="student-detail"),

    # =========================
    # STUDY CONNECTION
    # =========================
    path("studyconnection/create/", views.create_studyconnection, name="create-studyconnection"),

    # ✅ NEW: my level + partner level API (for Form.jsx)
    path("study/my-level/<int:study_id>/", views.get_my_study_level, name="my-study-level"),

    # =========================
    # TEACHER
    # =========================
    path("teachers/list/", views.teacher_list, name="teacher-list"),
    path("study/select-teacher/<int:study_id>/", views.select_teacher_for_study, name="select-teacher"),
    path("study/get-selected-teacher/<int:study_id>/", views.get_selected_teacher, name="get-selected-teacher"),
    path("study/update-enddate/<int:study_id>/", views.update_study_enddate, name="update-enddate"),

    # =========================
    # ASSESSMENT ✅ FIXED (removed extra api/)
    # =========================
    path("assessment/create-for-both/", views.create_assessment_for_both, name="create-assessment-for-both"),
    path("assessment/upload-validation-form/", views.upload_validation_form, name="upload-validation-form"),

    # =========================
    # CHAT
    # =========================
    path("chat/<int:study_id>/messages/", views.get_chat_messages, name="chat-messages"),
    path("chat/<int:study_id>/send/", views.send_chat_message, name="chat-send"),
    path("rating/save/", views.save_rating), 
    path("assessment/submit/", views.submit_assessment),
    path("assessment/status/", views.assessment_status),
    path("certificates/my/", views.get_my_certificates),
    path("resources/active-study/", views.get_active_study_for_resource),
path("resources/upload/", views.upload_resource),
path("resources/partner/<int:study_id>/", views.get_partner_resources),
path("study/my-studies/", views.get_my_studies),
path("resources/all/", views.get_all_resources_grouped),
path("share-skill/posts/", views.get_skill_posts),
path("share-skill/post/", views.create_skill_post),
path("connect/students/", views.get_all_students_for_connect),
path("study/check-form/", views.check_need_form),
path("study/active-started/", views.get_started_study),
path("study/my-teacher/", views.get_my_active_study_teacher),
path("notifications/counts/", views.get_notification_counts),
    path("notifications/mark-viewed/", views.mark_notification_viewed),









   

    # =========================
    # SUPPORT & REVIEW
    # =========================
    path("support/create/", views_support.create_issue, name="create-issue"),
    path("support/find-mentor/", views_support.find_mentor_by_email, name="find-mentor"),
    path("support/send-teacher-otp/", views_support.send_teacher_otp, name="send-teacher-otp"),
    path("support/verify-teacher-otp/", views_support.verify_teacher_otp, name="verify-teacher-otp"),
    path("support/my-issues/<int:student_id>/", views_support.get_my_issues, name="my-issues"),
    path("review/post/", views_support.post_review, name="post-review"),
    path("review/public/", views_support.get_public_reviews, name="public-reviews"),

    # =========================
    # V3: OPPORTUNITIES
    # =========================
    # =========================
    # V3: OPPORTUNITIES
    # =========================
    path("opportunities/create/", views_v3.create_opportunity),
    path("opportunities/list/", views_v3.get_opportunities),
    
    # Validation Check (Moved/Aliased from Admins)
    path("check-unique-teacher/", check_unique_teacher, name="check-unique-teacher"),
]
