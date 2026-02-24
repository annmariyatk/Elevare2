from rest_framework.decorators import api_view
from rest_framework.response import Response
from students.models import HelpSupport, WebsiteReview
from django.core.mail import send_mail
from django.conf import settings

# =======================
# HELP CENTER
# =======================

@api_view(['GET'])
def get_all_issues(request):
    """Get all support issues for admin"""
    issues = HelpSupport.objects.all().order_by('-created_at')
    data = []
    for i in issues:
        student_name = i.student.username if i.student else None
        student_profile = i.student.picture.url if i.student and i.student.picture else None
        
        teacher_name = i.teacher.name if i.teacher else None
        teacher_profile = i.teacher.profile.url if i.teacher and i.teacher.profile else None

        data.append({
            "issue_id": i.issue_id,
            "student_name": student_name,
            "student_profile": student_profile,
            "teacher_name": teacher_name,
            "teacher_profile": teacher_profile,
            "type": "Student" if i.student else "Teacher",
            "issue": i.issue,
            "reply": i.reply,
            "status": i.status,
            "created_at": i.created_at
        })
    return Response(data)

@api_view(['POST'])
def reply_issue(request, issue_id):
    """Admin replies to an issue"""
    reply_text = request.data.get('reply')
    try:
        issue = HelpSupport.objects.get(issue_id=issue_id)
        issue.reply = reply_text
        issue.status = 1 # Replied
        issue.save()

        # ✅ Send Email
        recipient_email = None
        recipient_name = "User"

        if issue.student:
            recipient_email = issue.student.email
            recipient_name = issue.student.username
        elif issue.teacher:
            recipient_email = issue.teacher.email
            recipient_name = issue.teacher.name

        if recipient_email:
            send_mail(
                subject="Admin Reply to your Issue - ELAVRE",
                message=f"""
Hello {recipient_name},

Admin has replied to your issue:

Your Issue:
{issue.issue}

Admin Reply:
{reply_text}

Thank you,
ELAVRE Team
""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=True,
            )
        return Response({"message": "Reply sent successfully"})
    except HelpSupport.DoesNotExist:
        return Response({"error": "Issue not found"}, status=404)

# =======================
# TESTIMONIALS
# =======================

@api_view(['GET'])
def get_reviews(request):
    """Get reviews (can filter by status=0 for pending)"""
    status = request.GET.get('status') # Optional filter
    if status is not None:
        reviews = WebsiteReview.objects.filter(status=status).order_by('-created_at')
    else:
        reviews = WebsiteReview.objects.all().order_by('-created_at')
        
    data = []
    for r in reviews:
        data.append({
            "review_id": r.review_id,
            "student_name": r.student.username,
            "student_profile": r.student.picture.url if r.student.picture else None,
            "review": r.review,
            "rating": r.rating,
            "status": r.status,
            "created_at": r.created_at
        })
    return Response(data)

@api_view(['POST'])
def approve_review(request, review_id):
    """Approve a review"""
    try:
        review = WebsiteReview.objects.get(review_id=review_id)
        review.status = 1 # Approved
        review.save()
        return Response({"message": "Review approved"})
    except WebsiteReview.DoesNotExist:
        return Response({"error": "Review not found"}, status=404)

@api_view(['DELETE'])
def delete_review(request, review_id):
    """Delete a review"""
    try:
        review = WebsiteReview.objects.get(review_id=review_id)
        review.delete()
        return Response({"message": "Review deleted"})
    except WebsiteReview.DoesNotExist:
        return Response({"error": "Review not found"}, status=404)

# =======================
# ADMIN NOTIFICATION COUNTS
# =======================
@api_view(['POST'])
def mark_admin_notification_viewed(request):
    """
    Marks admin section as viewed
    """
    # Assuming authenticated admin
    # In a real app we'd get the admin from token/session
    # For now, let's update the first admin or passed ID
    # Since auth logic for admin is custom, we'll try to find by token or just update the first one for simplicity/demo
    # OR better: pass admin_id or rely on header
    
    auth = request.headers.get("Authorization")
    if not auth:
        return Response({"error": "Unauthorized"}, status=401)
    
    # Try to find admin
    try:
        from admins.models import Admin
        token = auth.replace("Bearer ", "").strip()
        admin = Admin.objects.filter(api_token=token).first()
        
        if not admin:
             # Fallback: if no token auth implemented for admin yet in this file context, 
             # maybe we just return error or handle differently.
             # Based on previous code, admin login generates a token.
             return Response({"error": "Invalid admin token"}, status=401)

        section = request.data.get("section")
        from django.utils import timezone
        now = timezone.now()

        if section == "help_center":
            admin.last_viewed_help_center = now
            admin.save()
            return Response({"message": "Help center marked as viewed"})
        
        return Response({"error": "Invalid section"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def get_admin_notification_counts(request):
    """Returns notification counts for admin sidebar (NEW items only)"""
    
    # Authenticate Admin
    auth = request.headers.get("Authorization")
    if not auth:
        return Response({"error": "Unauthorized"}, status=401)

    try:
        from admins.models import Admin
        token = auth.replace("Bearer ", "").strip()
        admin = Admin.objects.filter(api_token=token).first()
        if not admin:
            return Response({"error": "Invalid token"}, status=401)
            
        # Help Center - ALL pending requests (status 0)
        help_center_count = HelpSupport.objects.filter(status=0).count()
        
        # Testimonials - ALL pending approval (status 0)
        review_count = WebsiteReview.objects.filter(status=0).count()
        
        return Response({
            "help_center": help_center_count,
            "testimonials": review_count
        }, status=200)

    except Exception as e:
        print(f"Error in admin counts: {e}")
        return Response({"error": "Internal Error"}, status=500)

