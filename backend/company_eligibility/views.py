import numpy as np
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from company_eligibility.models import Company, CompanyCriteria, EligibilityResult
from company_eligibility.serializers import CompanySerializer, CompanyCriteriaSerializer, EligibilityResultSerializer
from students.models import Student
from assessments.models import AssessmentScore, AssessmentType
from authentication.models import AdminLog

class CompanyListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        companies = Company.objects.all().select_related('criteria')
        return Response(CompanySerializer(companies, many=True).data)

    def post(self, request):
        criteria_data = request.data.pop('criteria', None)
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save()
            if criteria_data:
                CompanyCriteria.objects.update_or_create(company=company, defaults=criteria_data)
            else:
                CompanyCriteria.objects.get_or_create(company=company)

            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Add Company',
                details=f'Added company recruitment drive: {company.name}'
            )

            return Response(CompanySerializer(company).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            company = Company.objects.select_related('criteria').get(pk=pk)
            return Response(CompanySerializer(company).data)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

        criteria_data = request.data.pop('criteria', None)
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            company = serializer.save()
            if criteria_data:
                CompanyCriteria.objects.update_or_create(company=company, defaults=criteria_data)

            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Update Company Criteria',
                details=f'Updated criteria for {company.name}'
            )

            return Response(CompanySerializer(company).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
            name = company.name
            company.delete()
            return Response({'message': f'Company {name} deleted successfully'})
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

class GenerateEligibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, company_id):
        try:
            company = Company.objects.select_related('criteria').get(pk=company_id)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

        criteria, _ = CompanyCriteria.objects.get_or_create(company=company)
        students = Student.objects.all().select_related('department')

        eligible_results = []
        ineligible_results = []

        for student in students:
            reasons = []
            
            # 1. CGPA Check
            if student.cgpa < criteria.min_cgpa:
                reasons.append(f'CGPA ({student.cgpa}) < Min {criteria.min_cgpa}')

            # 2. Arrears Check
            if student.arrears_count > criteria.max_arrears:
                reasons.append(f'Arrears ({student.arrears_count}) > Max {criteria.max_arrears}')

            # 3. Department Filter
            if criteria.allowed_departments != 'ALL':
                allowed = [d.strip().upper() for d in criteria.allowed_departments.split(',')]
                if student.department.code.upper() not in allowed:
                    reasons.append(f'Department ({student.department.code}) not in {criteria.allowed_departments}')

            # Scores check
            scores_qs = AssessmentScore.objects.filter(student=student, is_absent=False)
            all_scores = list(scores_qs.values_list('score', flat=True))
            avg_score = round(float(np.mean(all_scores)), 1) if all_scores else 0.0

            coding_scores = list(scores_qs.filter(assessment__type=AssessmentType.CODING).values_list('score', flat=True))
            coding_avg = round(float(np.mean(coding_scores)), 1) if coding_scores else avg_score

            apt_scores = list(scores_qs.filter(assessment__type=AssessmentType.APTITUDE).values_list('score', flat=True))
            apt_avg = round(float(np.mean(apt_scores)), 1) if apt_scores else avg_score

            if avg_score < criteria.min_overall_avg:
                reasons.append(f'Overall Avg Score ({avg_score}) < Min {criteria.min_overall_avg}')
            if coding_avg < criteria.min_coding_score:
                reasons.append(f'Coding Score ({coding_avg}) < Min {criteria.min_coding_score}')
            if apt_avg < criteria.min_aptitude_score:
                reasons.append(f'Aptitude Score ({apt_avg}) < Min {criteria.min_aptitude_score}')

            is_eligible = (len(reasons) == 0)
            details = {
                'cgpa': student.cgpa,
                'arrears': student.arrears_count,
                'avg_score': avg_score,
                'coding_avg': coding_avg,
                'aptitude_avg': apt_avg,
                'reasons': reasons
            }

            res, _ = EligibilityResult.objects.update_or_create(
                company=company,
                student=student,
                defaults={'is_eligible': is_eligible, 'details': details}
            )

            res_data = EligibilityResultSerializer(res).data
            if is_eligible:
                eligible_results.append(res_data)
            else:
                ineligible_results.append(res_data)

        AdminLog.objects.create(
            admin=request.user,
            admin_name=request.user.username,
            action='Company Eligibility Generated',
            details=f'Evaluated {len(students)} students for {company.name}: {len(eligible_results)} Eligible'
        )

        return Response({
            'company': company.name,
            'total_evaluated': len(students),
            'eligible_count': len(eligible_results),
            'ineligible_count': len(ineligible_results),
            'eligible_students': eligible_results,
            'ineligible_students': ineligible_results,
        })
