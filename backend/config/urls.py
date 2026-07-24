from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        'title': 'SkillTrack Placement Analytics & Student Assessment API',
        'status': 'online',
        'frontend_url': 'http://localhost:3000',
        'message': 'Backend REST API is running. Access the user interface at http://localhost:3000',
        'available_endpoints': {
            'admin_panel': '/admin/',
            'auth': '/api/auth/',
            'students': '/api/students/',
            'assessments': '/api/assessments/',
            'analytics': '/api/analytics/',
            'company_eligibility': '/api/company-eligibility/',
            'reports': '/api/reports/',
        }
    })

urlpatterns = [
    path('', api_root_view, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/students/', include('students.urls')),
    path('api/assessments/', include('assessments.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/company-eligibility/', include('company_eligibility.urls')),
    path('api/reports/', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
