from django.db import models
from authentication.models import AdminUser
from students.models import Student

class AssessmentType(models.TextChoices):
    APTITUDE = 'APTITUDE', 'Aptitude'
    CODING = 'CODING', 'Coding'
    TECHNICAL_MCQ = 'TECHNICAL_MCQ', 'Technical MCQ'
    SQL = 'SQL', 'SQL'
    COMMUNICATION = 'COMMUNICATION', 'Communication'
    MOCK_INTERVIEW = 'MOCK_INTERVIEW', 'Mock Interview'
    GROUP_DISCUSSION = 'GROUP_DISCUSSION', 'Group Discussion'
    RESUME_REVIEW = 'RESUME_REVIEW', 'Resume Review'

class Assessment(models.Model):
    name = models.CharField(max_length=150)
    type = models.CharField(
        max_length=30,
        choices=AssessmentType.choices,
        default=AssessmentType.APTITUDE
    )
    date = models.DateField()
    max_marks = models.FloatField(default=100.0)
    duration_minutes = models.IntegerField(default=90)
    weightage_percent = models.FloatField(default=15.0)
    created_by = models.ForeignKey(AdminUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class AssessmentScore(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='scores')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='scores')
    score = models.FloatField(default=0.0)
    remarks = models.TextField(blank=True, null=True)
    is_absent = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'assessment']
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.student.roll_number} - {self.assessment.name}: {self.score}"
