from django.urls import path
from students.views import (
    StudentListView, StudentDetailView, StudentBulkImportView,
    StudentExportView, DepartmentListView
)

urlpatterns = [
    path('departments/', DepartmentListView.as_view(), name='department_list'),
    path('', StudentListView.as_view(), name='student_list'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student_detail'),
    path('import/', StudentBulkImportView.as_view(), name='student_import'),
    path('export/', StudentExportView.as_view(), name='student_export'),
]
