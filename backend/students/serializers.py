from rest_framework import serializers
from students.models import Student, Department

class DepartmentSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(source='students.count', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'code', 'name', 'student_count']

class StudentSerializer(serializers.ModelSerializer):
    department_code = serializers.CharField(source='department.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_id = serializers.IntegerField(write_only=True, required=False)
    department = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Student
        fields = [
            'id', 'roll_number', 'name', 'department', 'department_id', 'department_code', 'department_name',
            'section', 'year', 'cgpa', 'email', 'phone', 'placement_status', 'arrears_count',
            'resume_link', 'github_link', 'linkedin_link', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        dept_val = validated_data.pop('department', None)
        dept_id_val = validated_data.pop('department_id', None)

        dept = None
        if dept_id_val:
            dept = Department.objects.filter(id=dept_id_val).first()
        if not dept and dept_val:
            if isinstance(dept_val, int) or (isinstance(dept_val, str) and dept_val.isdigit()):
                dept = Department.objects.filter(id=int(dept_val)).first()
            else:
                dept = Department.objects.filter(code__iexact=str(dept_val)).first()

        if not dept:
            dept = Department.objects.first()

        validated_data['department'] = dept
        return super().create(validated_data)

    def update(self, instance, validated_data):
        dept_val = validated_data.pop('department', None)
        dept_id_val = validated_data.pop('department_id', None)

        dept = None
        if dept_id_val:
            dept = Department.objects.filter(id=dept_id_val).first()
        if not dept and dept_val:
            if isinstance(dept_val, int) or (isinstance(dept_val, str) and dept_val.isdigit()):
                dept = Department.objects.filter(id=int(dept_val)).first()
            else:
                dept = Department.objects.filter(code__iexact=str(dept_val)).first()

        if dept:
            validated_data['department'] = dept
        return super().update(instance, validated_data)
