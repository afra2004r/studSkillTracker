from django.urls import path
from analytics.views import (
    DashboardOverviewView, RankingsView, AnalyticsDetailView,
    AIPredictionView, AIInsightsView, AIChatView
)

urlpatterns = [
    path('dashboard/', DashboardOverviewView.as_view(), name='analytics_dashboard'),
    path('rankings/', RankingsView.as_view(), name='analytics_rankings'),
    path('details/', AnalyticsDetailView.as_view(), name='analytics_details'),
    path('predictions/', AIPredictionView.as_view(), name='analytics_predictions'),
    path('insights/', AIInsightsView.as_view(), name='analytics_insights'),
    path('chat/', AIChatView.as_view(), name='analytics_chat'),
]
