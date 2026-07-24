from django.urls import path
from assessments.views import (
    AssessmentListView, AssessmentDetailView,
    AssessmentScoresListView, ScoreUploadView
)

urlpatterns = [
    path('', AssessmentListView.as_view(), name='assessment_list'),
    path('<int:pk>/', AssessmentDetailView.as_view(), name='assessment_detail'),
    path('<int:pk>/scores/', AssessmentScoresListView.as_view(), name='assessment_scores'),
    path('scores/upload/', ScoreUploadView.as_view(), name='score_upload'),
]
