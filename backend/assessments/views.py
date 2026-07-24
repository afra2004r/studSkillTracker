import pandas as pd
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from assessments.models import Assessment, AssessmentScore
from assessments.serializers import AssessmentSerializer, AssessmentScoreSerializer
from students.models import Student
from authentication.models import AdminLog

class AssessmentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        assessments = Assessment.objects.all()
        return Response(AssessmentSerializer(assessments, many=True).data)

    def post(self, request):
        serializer = AssessmentSerializer(data=request.data)
        if serializer.is_valid():
            assessment = serializer.save(created_by=request.user)
            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Create Assessment',
                details=f'Created assessment {assessment.name} ({assessment.get_type_display()})'
            )
            return Response(AssessmentSerializer(assessment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssessmentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            assessment = Assessment.objects.get(pk=pk)
            return Response(AssessmentSerializer(assessment).data)
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            assessment = Assessment.objects.get(pk=pk)
            name = assessment.name
            assessment.delete()
            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Delete Assessment',
                details=f'Deleted assessment {name}'
            )
            return Response({'message': f'Assessment {name} deleted successfully'})
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

class AssessmentScoresListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        scores = AssessmentScore.objects.filter(assessment_id=pk).select_related('student', 'student__department')
        return Response(AssessmentScoreSerializer(scores, many=True).data)

class ScoreUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        assessment_id = request.data.get('assessment_id')
        if not assessment_id:
            return Response({'error': 'Assessment ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            assessment = Assessment.objects.get(pk=assessment_id)
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Check for manual single entry
        roll_number = request.data.get('roll_number')
        if roll_number:
            roll_str = str(roll_number).strip()
            student = Student.objects.filter(roll_number__iexact=roll_str).first() or Student.objects.filter(name__icontains=roll_str).first()
            if not student:
                return Response({'error': f'Student with Roll No or Name "{roll_number}" not found'}, status=status.HTTP_404_NOT_FOUND)

            score_val = float(request.data.get('score', 0.0))
            remarks = request.data.get('remarks', '')
            is_absent = str(request.data.get('is_absent', 'false')).lower() == 'true'

            score_obj, created = AssessmentScore.objects.update_or_create(
                student=student,
                assessment=assessment,
                defaults={
                    'score': score_val,
                    'remarks': remarks,
                    'is_absent': is_absent
                }
            )

            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Manual Score Entry',
                details=f'Entered score {score_val} for {student.roll_number} in {assessment.name}'
            )

            return Response({
                'message': f'Score updated for {student.roll_number}',
                'score': AssessmentScoreSerializer(score_obj).data
            })

        # 2. File Upload Batch Processing
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'Either roll_number/score or a file must be provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            else:
                df = pd.read_excel(file_obj)

            count = 0
            missing_students = []

            for _, row in df.iterrows():
                r_num = str(row.get('Roll No', row.get('Roll Number', ''))).strip()
                if not r_num:
                    continue

                try:
                    s_obj = Student.objects.get(roll_number=r_num)
                    score_v = float(row.get('Score', row.get('Marks', 0)))
                    rem = str(row.get('Remarks', '')).strip()
                    absent = str(row.get('Status', '')).lower() == 'absent'

                    AssessmentScore.objects.update_or_create(
                        student=s_obj,
                        assessment=assessment,
                        defaults={
                            'score': score_v,
                            'remarks': rem,
                            'is_absent': absent
                        }
                    )
                    count += 1
                except Student.DoesNotExist:
                    missing_students.append(r_num)

            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Bulk Score Upload',
                details=f'Uploaded {count} scores for {assessment.name} via {file_obj.name}'
            )

            return Response({
                'message': f'Successfully uploaded {count} scores for {assessment.name}',
                'uploaded_count': count,
                'missing_students': missing_students
            })
        except Exception as e:
            return Response({'error': f'Failed to process file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
