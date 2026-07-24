import os
import pandas as pd
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from students.models import Student
from assessments.models import Assessment, AssessmentScore
from company_eligibility.models import Company, EligibilityResult

def generate_report_file(title, report_type, file_format, filters=None):
    """
    Generates a PDF, Excel, or CSV report file and returns relative file path.
    """
    filters = filters or {}
    os.makedirs(settings.MEDIA_ROOT / 'reports', exist_ok=True)
    filename = f"{report_type.lower()}_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.{file_format.lower()}"
    file_path = settings.MEDIA_ROOT / 'reports' / filename

    # Build report dataframe
    df = build_report_dataframe(report_type, filters)

    if file_format.lower() == 'csv':
        df.to_csv(file_path, index=False)
    elif file_format.lower() == 'excel':
        df.to_excel(file_path, index=False)
    else:  # PDF
        create_pdf_report(file_path, title, df)

    return f"/media/reports/{filename}"

def build_report_dataframe(report_type, filters):
    rows = []
    
    if report_type == 'STUDENTS_ABOVE_80':
        students = Student.objects.select_related('department').all()
        for s in students:
            scores = list(s.scores.filter(is_absent=False).values_list('score', flat=True))
            avg = sum(scores)/len(scores) if scores else 0
            if avg >= 80.0:
                rows.append({
                    'Roll No': s.roll_number,
                    'Name': s.name,
                    'Department': s.department.code,
                    'CGPA': s.cgpa,
                    'Avg Score': round(avg, 1),
                    'Placement Status': s.placement_status
                })

    elif report_type == 'STUDENTS_BELOW_40':
        students = Student.objects.select_related('department').all()
        for s in students:
            scores = list(s.scores.filter(is_absent=False).values_list('score', flat=True))
            avg = sum(scores)/len(scores) if scores else 0
            if avg < 40.0:
                rows.append({
                    'Roll No': s.roll_number,
                    'Name': s.name,
                    'Department': s.department.code,
                    'CGPA': s.cgpa,
                    'Avg Score': round(avg, 1),
                    'Arrears': s.arrears_count
                })

    elif report_type == 'INTERVIEW_ELIGIBLE':
        students = Student.objects.select_related('department').filter(cgpa__gte=7.5, arrears_count=0)
        for s in students:
            scores = list(s.scores.filter(is_absent=False).values_list('score', flat=True))
            avg = sum(scores)/len(scores) if scores else 0
            if avg >= 70.0:
                rows.append({
                    'Roll No': s.roll_number,
                    'Name': s.name,
                    'Department': s.department.code,
                    'CGPA': s.cgpa,
                    'Avg Score': round(avg, 1),
                    'Readiness': 'Very High' if avg >= 85 else 'High'
                })

    elif report_type == 'TOP_20':
        students = Student.objects.select_related('department').all()
        s_list = []
        for s in students:
            scores = list(s.scores.filter(is_absent=False).values_list('score', flat=True))
            avg = sum(scores)/len(scores) if scores else 0
            s_list.append((s, avg))
        s_list.sort(key=lambda x: x[1], reverse=True)

        for rank, (s, avg) in enumerate(s_list[:20], 1):
            rows.append({
                'Rank': rank,
                'Roll No': s.roll_number,
                'Name': s.name,
                'Department': s.department.code,
                'CGPA': s.cgpa,
                'Avg Score': round(avg, 1)
            })

    else:  # General / Assessment / Department default
        students = Student.objects.select_related('department').all()[:50]
        for s in students:
            scores = list(s.scores.filter(is_absent=False).values_list('score', flat=True))
            avg = sum(scores)/len(scores) if scores else 0
            rows.append({
                'Roll No': s.roll_number,
                'Name': s.name,
                'Department': s.department.code,
                'CGPA': s.cgpa,
                'Avg Score': round(avg, 1),
                'Placement Status': s.placement_status
            })

    return pd.DataFrame(rows)

def create_pdf_report(file_path, title, df):
    doc = SimpleDocTemplate(str(file_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#1e293b'))
    subtitle_style = ParagraphStyle('SubStyle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#64748b'))

    story.append(Paragraph(f"<b>{title}</b>", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Placement Analytics & Institutional Assessment Report | Generated: {pd.Timestamp.now().strftime('%d %B %Y')}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=5, spaceAfter=15))

    if df.empty:
        story.append(Paragraph("No records found matching report criteria.", styles['Normal']))
    else:
        columns = list(df.columns)
        table_data = [columns]
        for _, row in df.iterrows():
            table_data.append([str(val) for val in row.values])

        t = Table(table_data, hAlign='LEFT')
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ]))
        story.append(t)

    doc.build(story)
