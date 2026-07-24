from rest_framework import serializers
from company_eligibility.models import Company, CompanyCriteria, EligibilityResult

class CompanyCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyCriteria
        fields = [
            'id', 'min_cgpa', 'max_arrears', 'min_coding_score',
            'min_aptitude_score', 'min_communication_score',
            'min_overall_avg', 'allowed_departments'
        ]

class CompanySerializer(serializers.ModelSerializer):
    criteria = CompanyCriteriaSerializer(required=False)
    eligible_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'name', 'logo_url', 'description', 'target_roles', 'visiting_date', 'criteria', 'eligible_count', 'created_at']

    def get_eligible_count(self, obj):
        return obj.eligibility_results.filter(is_eligible=True).count()

class EligibilityResultSerializer(serializers.ModelSerializer):
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    department_code = serializers.CharField(source='student.department.code', read_only=True)
    cgpa = serializers.FloatField(source='student.cgpa', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = EligibilityResult
        fields = [
            'id', 'company', 'company_name', 'student', 'student_roll', 'student_name',
            'department_code', 'cgpa', 'is_eligible', 'details', 'evaluated_at'
        ]
