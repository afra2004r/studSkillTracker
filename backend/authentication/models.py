from django.db import models
from django.contrib.auth.models import AbstractUser

class AdminRole(models.TextChoices):
    PLACEMENT_OFFICER = 'PLACEMENT_OFFICER', 'Placement Officer'
    PLACEMENT_COORDINATOR = 'PLACEMENT_COORDINATOR', 'Placement Coordinator'

class AdminUser(AbstractUser):
    role = models.CharField(
        max_length=30,
        choices=AdminRole.choices,
        default=AdminRole.PLACEMENT_OFFICER
    )
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class AdminLog(models.Model):
    admin = models.ForeignKey(AdminUser, on_delete=models.SET_NULL, null=True, blank=True)
    admin_name = models.CharField(max_length=150, default='System')
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.admin_name} - {self.action} @ {self.timestamp}"
