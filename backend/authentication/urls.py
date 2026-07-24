from django.urls import path
from authentication.views import LoginView, ProfileView, ChangePasswordView, AdminLogListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('logs/', AdminLogListView.as_view(), name='auth_logs'),
]
