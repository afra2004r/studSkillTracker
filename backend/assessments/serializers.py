from rest_framework import serializers
from assessments.models import Assessment, AssessmentScore, AssessmentType
from students.models import Student

class AssessmentSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    submitted_scores_count = serializers.IntegerField(source='scores.count', read_only=True)
    average_score = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            'id', 'name', 'type', 'type_display', 'date', 'max_marks',
            'duration_minutes', 'weightage_percent', 'created_by_name',
            'submitted_scores_count', 'average_score', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_average_score(self, obj):
        scores = obj.scores.filter(is_absent=False).values_list('score', flat=True)
        if not scores:
            return 0.0
        return round(float(sum(scores) / len(scores)), 1)

class AssessmentScoreSerializer(serializers.ModelSerializer):
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    department_code = serializers.CharField(source='student.department.code', read_only=True)
    assessment_name = serializers.CharField(source='assessment.name', read_only=True)

    class Meta:
        model = AssessmentScore
        fields = [
            'id', 'student', 'student_roll', 'student_name', 'department_code',
            'assessment', 'assessment_name', 'score', 'remarks', 'is_absent', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']
