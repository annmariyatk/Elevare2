from django.db import models

class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    api_token = models.CharField(max_length=64, blank=True, null=True, unique=True)
    
    # ✅ Notification Last Viewed
    from django.utils import timezone
    last_viewed_help_center = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.email
