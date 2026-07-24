from django.urls import path
from company_eligibility.views import CompanyListView, CompanyDetailView, GenerateEligibilityView

urlpatterns = [
    path('', CompanyListView.as_view(), name='company_list'),
    path('<int:pk>/', CompanyDetailView.as_view(), name='company_detail'),
    path('<int:company_id>/generate/', GenerateEligibilityView.as_view(), name='company_generate'),
]
