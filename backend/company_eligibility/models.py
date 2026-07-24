from django.db import models
from students.models import Student

class Company(models.Model):
    name = models.CharField(max_length=150, unique=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    target_roles = models.CharField(max_length=255, default='Software Engineer')
    visiting_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name

class CompanyCriteria(models.Model):
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='criteria')
    min_cgpa = models.FloatField(default=7.0)
    max_arrears = models.IntegerField(default=0)
    min_coding_score = models.FloatField(default=60.0)
    min_aptitude_score = models.FloatField(default=60.0)
    min_communication_score = models.FloatField(default=50.0)
    min_overall_avg = models.FloatField(default=65.0)
    allowed_departments = models.TextField(default='ALL', help_text="Comma separated dept codes or ALL")

    def __str__(self):
        return f"Criteria for {self.company.name}"

class EligibilityResult(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='eligibility_results')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='company_eligibilities')
    is_eligible = models.BooleanField(default=False)
    details = models.JSONField(default=dict)
    evaluated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['company', 'student']

    def __str__(self):
        return f"{self.student.roll_number} -> {self.company.name}: {'Eligible' if self.is_eligible else 'Not Eligible'}"
