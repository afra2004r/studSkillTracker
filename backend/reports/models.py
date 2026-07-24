from django.db import models
from authentication.models import AdminUser

class ReportType(models.TextChoices):
    STUDENTS_ABOVE_80 = 'STUDENTS_ABOVE_80', 'Students Scoring >80%'
    STUDENTS_BELOW_40 = 'STUDENTS_BELOW_40', 'Students Scoring <40%'
    INTERVIEW_ELIGIBLE = 'INTERVIEW_ELIGIBLE', 'Interview Eligible Students'
    ABSENT_STUDENTS = 'ABSENT_STUDENTS', 'Absent Students Report'
    DEPARTMENT_WISE = 'DEPARTMENT_WISE', 'Department-wise Report'
    ASSESSMENT_WISE = 'ASSESSMENT_WISE', 'Assessment-wise Report'
    TOP_20 = 'TOP_20', 'Top 20 Performers Report'
    COMPANY_ELIGIBILITY = 'COMPANY_ELIGIBILITY', 'Company Eligibility Report'

class Report(models.Model):
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=50, choices=ReportType.choices)
    filters = models.JSONField(default=dict, blank=True)
    file_format = models.CharField(max_length=10, default='PDF')
    file_path = models.CharField(max_length=500, blank=True, null=True)
    generated_by = models.ForeignKey(AdminUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.file_format})"
