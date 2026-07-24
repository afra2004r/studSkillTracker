from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from authentication.models import AdminUser, AdminLog, AdminRole
from authentication.serializers import AdminUserSerializer, ChangePasswordSerializer, AdminLogSerializer

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        
        AdminLog.objects.create(
            admin=user,
            admin_name=user.username,
            action='Admin Login',
            details=f'Logged in successfully as {user.get_role_display()}'
        )

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': AdminUserSerializer(user).data
        })

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(AdminUserSerializer(request.user).data)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            AdminLog.objects.create(
                admin=user,
                admin_name=user.username,
                action='Password Change',
                details='Password updated successfully'
            )

            return Response({'message': 'Password updated successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminLogListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logs = AdminLog.objects.all()[:100]
        return Response(AdminLogSerializer(logs, many=True).data)
