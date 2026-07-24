from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from reports.models import Report, ReportType
from reports.generator import generate_report_file
from authentication.models import AdminLog

class ReportListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reports = Report.objects.all()[:30]
        data = []
        for r in reports:
            data.append({
                'id': r.id,
                'title': r.title,
                'report_type': r.report_type,
                'file_format': r.file_format,
                'file_path': r.file_path,
                'created_at': r.created_at,
            })
        return Response(data)

    def post(self, request):
        title = request.data.get('title', 'Placement Report')
        report_type = request.data.get('report_type', ReportType.TOP_20)
        file_format = request.data.get('file_format', 'PDF').upper()
        filters = request.data.get('filters', {})

        try:
            file_url = generate_report_file(title, report_type, file_format, filters)
            report = Report.objects.create(
                title=title,
                report_type=report_type,
                file_format=file_format,
                filters=filters,
                file_path=file_url,
                generated_by=request.user
            )

            AdminLog.objects.create(
                admin=request.user,
                admin_name=request.user.username,
                action='Generate Report',
                details=f'Generated {file_format} report: {title}'
            )

            return Response({
                'id': report.id,
                'title': report.title,
                'report_type': report.report_type,
                'file_format': report.file_format,
                'file_url': file_url,
                'created_at': report.created_at,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to generate report: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
