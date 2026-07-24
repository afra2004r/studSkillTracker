from django.urls import path
from reports.views import ReportListView

urlpatterns = [
    path('', ReportListView.as_view(), name='report_list'),
]
