from rest_framework import serializers
from authentication.models import AdminUser, AdminLog, AdminRole

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        read_only_fields = ['id']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class AdminLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminLog
        fields = '__all__'
