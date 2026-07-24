import pandas as pd
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from students.models import Student, Department
from students.serializers import StudentSerializer, DepartmentSerializer
from analytics.engine import calculate_student_analytics, get_global_rankings
from authentication.models import AdminLog

from django.db.models import Q

class DepartmentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        depts = Department.objects.all()
        return Response(DepartmentSerializer(depts, many=True).data)

class StudentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Student.objects.select_related('department').all().order_by('-created_at', 'id')

        # Multi-criteria filtering
        search = request.query_params.get('search')
        dept = request.query_params.get('department')
        year = request.query_params.get('year')
        min_cgpa = request.query_params.get('min_cgpa')
        placement_status = request.query_params.get('placement_status')

        if search:
            search_str = search.strip()
            queryset = queryset.filter(
                Q(roll_number__icontains=search_str) |
                Q(name__icontains=search_str) |
                Q(email__icontains=search_str)
            )
        if dept:
            queryset = queryset.filter(department__code__iexact=dept)
        if year:
            queryset = queryset.filter(year=int(year))
        if min_cgpa:
            queryset = queryset.filter(cgpa__gte=float(min_cgpa))
        if placement_status:
            queryset = queryset.filter(placement_status__iexact=placement_status)

        serializer = StudentSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save()
            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Add Student',
                details=f'Created student {student.roll_number} - {student.name}'
            )
            return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            student = Student.objects.select_related('department').get(pk=pk)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        student_data = StudentSerializer(student).data
        analytics = calculate_student_analytics(student)

        # Retrieve ranks from global ranking engine
        rankings = get_global_rankings()['rankings']
        student_rank_item = next((r for r in rankings if r['id'] == student.id), None)

        overall_rank = student_rank_item['overall_rank'] if student_rank_item else 'N/A'
        dept_rank = student_rank_item['dept_rank'] if student_rank_item else 'N/A'

        # Assessment History
        history = []
        for score_obj in student.scores.select_related('assessment').all():
            history.append({
                'assessment_id': score_obj.assessment.id,
                'assessment_name': score_obj.assessment.name,
                'type': score_obj.assessment.type,
                'date': str(score_obj.assessment.date),
                'score': score_obj.score,
                'max_marks': score_obj.assessment.max_marks,
                'percentage': round((score_obj.score / score_obj.assessment.max_marks) * 100, 1),
                'is_absent': score_obj.is_absent,
                'remarks': score_obj.remarks,
            })

        return Response({
            'student': student_data,
            'analytics': analytics,
            'overall_rank': overall_rank,
            'dept_rank': dept_rank,
            'assessment_history': history,
        })

    def put(self, request, pk):
        try:
            student = Student.objects.get(pk=pk)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            student = serializer.save()
            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Update Student',
                details=f'Updated details for {student.roll_number}'
            )
            return Response(StudentSerializer(student).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            student = Student.objects.get(pk=pk)
            roll = student.roll_number
            student.delete()
            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Delete Student',
                details=f'Deleted student {roll}'
            )
            return Response({'message': f'Student {roll} deleted successfully'})
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

class StudentBulkImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            else:
                df = pd.read_excel(file_obj)

            created_count = 0
            updated_count = 0

            for _, row in df.iterrows():
                dept_code = str(row.get('Department', 'CSE')).strip().upper()
                dept, _ = Department.objects.get_or_create(
                    code=dept_code,
                    defaults={'name': f'{dept_code} Department'}
                )

                roll = str(row.get('Roll Number', row.get('Roll No', ''))).strip()
                if not roll:
                    continue

                student_data = {
                    'name': str(row.get('Name', '')).strip(),
                    'department': dept,
                    'section': str(row.get('Section', 'A')).strip(),
                    'year': int(row.get('Year', 4)),
                    'cgpa': float(row.get('CGPA', 0.0)),
                    'email': str(row.get('Email', f"{roll.lower()}@college.edu")).strip(),
                    'phone': str(row.get('Phone', '')).strip(),
                    'placement_status': str(row.get('Placement Status', 'UNPLACED')).strip().upper(),
                    'arrears_count': int(row.get('Arrears', 0)),
                    'resume_link': str(row.get('Resume Link', '')).strip(),
                    'github_link': str(row.get('GitHub', '')).strip(),
                    'linkedin_link': str(row.get('LinkedIn', '')).strip(),
                }

                student, created = Student.objects.update_or_create(
                    roll_number=roll,
                    defaults=student_data
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Bulk Student Import',
                details=f'Imported file {file_obj.name}: Created {created_count}, Updated {updated_count}'
            )

            return Response({
                'message': 'Bulk import completed successfully',
                'created': created_count,
                'updated': updated_count
            })
        except Exception as e:
            return Response({'error': f'Failed to process file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class StudentExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        export_format = request.query_params.get('format', 'csv').lower()
        students = Student.objects.select_related('department').all()

        data = []
        for s in students:
            data.append({
                'Roll Number': s.roll_number,
                'Name': s.name,
                'Department': s.department.code,
                'Section': s.section,
                'Year': s.year,
                'CGPA': s.cgpa,
                'Email': s.email,
                'Phone': s.phone,
                'Placement Status': s.placement_status,
                'Arrears': s.arrears_count,
                'Resume Link': s.resume_link or '',
                'GitHub': s.github_link or '',
                'LinkedIn': s.linkedin_link or '',
            })

        df = pd.DataFrame(data)

        if export_format == 'excel':
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="students_list.xlsx"'
            df.to_excel(response, index=False)
            return response
        else:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="students_list.csv"'
            df.to_csv(response, index=False)
            return response
