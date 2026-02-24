from django.urls import path
from .views import (
    admin_check_email,
    generate_admin_password,
    confirm_admin_signup,
    create_admin_auto_password,
    # New views
    get_dashboard_stats,
    get_all_students,
    get_student_details,
    delete_student,
    update_study_status,
    add_teacher,
    get_teachers,
    delete_teacher,
    # Dynamic Filters
    get_student_departments,
    get_teacher_departments,
    cancel_assessment
)
from . import views_support
from . import views_v3

urlpatterns = [
    # Auth
    path("admin/check-email/", admin_check_email),
    path("admin/generate-password/", generate_admin_password),
    path("admin/confirm-signup/", confirm_admin_signup),
    path("admin/create-auto/", create_admin_auto_password),
    
    # Dashboard & Management
    path("admin/dashboard-stats/", get_dashboard_stats),
    path("admin/students/", get_all_students),
    path("admin/student/<int:student_id>/", get_student_details),
    path("admin/student/delete/<int:student_id>/", delete_student),
    path("admin/study/update-status/<int:study_id>/", update_study_status),
    
    # Teacher Management
    path("admin/add-teacher/", add_teacher),
    path("admin/teachers/", get_teachers),
    path("admin/teacher/delete/<int:teacher_id>/", delete_teacher),
    
    # Help & Testimonials
    path("admin/help/issues/", views_support.get_all_issues),
    path("admin/help/reply/<int:issue_id>/", views_support.reply_issue),
    path("admin/reviews/", views_support.get_reviews),
    path("admin/review/approve/<int:review_id>/", views_support.approve_review),
    path("admin/review/delete/<int:review_id>/", views_support.delete_review),
    
    # V3 Checks
    path("check-unique-admin/", views_v3.check_unique_admin),
    path("check-unique-teacher/", views_v3.check_unique_teacher),

    # Dynamic Filters
    path("admin/student-departments/", get_student_departments),
    path("admin/teacher-departments/", get_teacher_departments),
    path("admin/assessment/cancel/<int:assessment_id>/", cancel_assessment),
    # Notifications
    path("admin/notifications/counts/", views_support.get_admin_notification_counts),
    path("admin/notifications/mark-viewed/", views_support.mark_admin_notification_viewed),
]
