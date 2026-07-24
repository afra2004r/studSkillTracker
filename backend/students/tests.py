from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import AdminUser, AdminRole
from students.models import Student, Department

class PlacementSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = AdminUser.objects.create_user(
            username='testadmin',
            password='password123',
            role=AdminRole.PLACEMENT_OFFICER
        )
        self.client.force_authenticate(user=self.admin)
        self.dept = Department.objects.create(code='CSE', name='Computer Science')
        self.student = Student.objects.create(
            roll_number='22001',
            name='Test Student',
            department=self.dept,
            cgpa=8.5,
            email='test@college.edu'
        )

    def test_student_list_api(self):
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['roll_number'], '22001')

    def test_dashboard_api(self):
        response = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('kpis', response.data)
        self.assertEqual(response.data['kpis']['total_students'], 1)
