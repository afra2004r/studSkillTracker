from django.db import models

class Department(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.code} - {self.name}"

class StudentPlacementStatus(models.TextChoices):
    PLACED = 'PLACED', 'Placed'
    UNPLACED = 'UNPLACED', 'Unplaced'
    IN_PROCESS = 'IN_PROCESS', 'In Process'
    NOT_INTERESTED = 'NOT_INTERESTED', 'Not Interested'

class Student(models.Model):
    roll_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='students')
    section = models.CharField(max_length=5, default='A')
    year = models.IntegerField(default=4)
    cgpa = models.FloatField(default=0.0)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    placement_status = models.CharField(
        max_length=20,
        choices=StudentPlacementStatus.choices,
        default=StudentPlacementStatus.UNPLACED
    )
    arrears_count = models.IntegerField(default=0)
    resume_link = models.URLField(max_length=500, blank=True, null=True)
    github_link = models.URLField(max_length=500, blank=True, null=True)
    linkedin_link = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['roll_number']

    def __str__(self):
        return f"{self.roll_number} - {self.name} ({self.department.code})"
