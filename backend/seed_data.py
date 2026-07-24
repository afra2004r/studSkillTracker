import os
import sys
import random
import django
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.models import AdminUser, AdminRole, AdminLog
from students.models import Student, Department, StudentPlacementStatus
from assessments.models import Assessment, AssessmentScore, AssessmentType
from company_eligibility.models import Company, CompanyCriteria, EligibilityResult
from reports.models import Report, ReportType

FIRST_NAMES = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Karthik', 'Siddharth', 'Meera', 'Aditya', 'Sneha', 'Vikram', 'Divya', 'Rahul', 'Nisha', 'Arjun', 'Kavya', 'Suresh', 'Deepika', 'Manish', 'Pooja', 'Varun', 'Swati', 'Harish', 'Keerthi', 'Gautam', 'Bhavana', 'Nikhil', 'Rithika', 'Surya', 'Lavanya', 'Tarun']
LAST_NAMES = ['Sharma', 'Verma', 'Nair', 'Iyer', 'Reddy', 'Patel', 'Rao', 'Chowdhury', 'Gupta', 'Kumar', 'Singh', 'Joshi', 'Menon', 'Pillai', 'Deshmukh', 'Subramanian', 'Murthy', 'Kulkarni', 'Bhat', 'Shetty']

DEPARTMENTS = [
    ('MSc SS', 'M.Sc. Software Systems'),
    ('MCA', 'Master of Computer Applications'),
    ('MSc CS', 'M.Sc. Computer Science'),
    ('MSc IT', 'M.Sc. Information Technology'),
    ('MCM', 'Master of Computer Management'),
]

ASSESSMENTS_DATA = [
    ('Aptitude Test 1', AssessmentType.APTITUDE, date(2026, 8, 20), 100, 90, 15),
    ('Coding Round 1', AssessmentType.CODING, date(2026, 8, 28), 100, 120, 20),
    ('Technical MCQ 1', AssessmentType.TECHNICAL_MCQ, date(2026, 9, 5), 100, 60, 10),
    ('SQL Challenge', AssessmentType.SQL, date(2026, 9, 12), 100, 90, 15),
    ('Communication Round', AssessmentType.COMMUNICATION, date(2026, 9, 20), 100, 45, 10),
    ('Mock Interview 1', AssessmentType.MOCK_INTERVIEW, date(2026, 9, 27), 100, 30, 15),
    ('Aptitude Test 2', AssessmentType.APTITUDE, date(2026, 10, 5), 100, 90, 15),
    ('Coding Round 2', AssessmentType.CODING, date(2026, 10, 15), 100, 120, 20),
    ('Group Discussion', AssessmentType.GROUP_DISCUSSION, date(2026, 10, 22), 100, 45, 10),
    ('Resume Review', AssessmentType.RESUME_REVIEW, date(2026, 10, 29), 100, 30, 5),
    ('SQL Advanced', AssessmentType.SQL, date(2026, 11, 8), 100, 90, 15),
    ('Aptitude Final', AssessmentType.APTITUDE, date(2026, 11, 18), 100, 90, 15),
]

COMPANIES_DATA = [
    {
        'name': 'TCS (Ninja / Digital)',
        'target_roles': 'Software Engineer / System Engineer',
        'visiting_date': date(2026, 12, 1),
        'min_cgpa': 7.5,
        'max_arrears': 0,
        'min_coding_score': 60.0,
        'min_aptitude_score': 70.0,
        'allowed_departments': 'ALL'
    },
    {
        'name': 'Infosys (SE / DSE)',
        'target_roles': 'Specialist Programmer / Systems Engineer',
        'visiting_date': date(2026, 12, 5),
        'min_cgpa': 7.0,
        'max_arrears': 0,
        'min_coding_score': 55.0,
        'min_aptitude_score': 65.0,
        'allowed_departments': 'ALL'
    },
    {
        'name': 'Zoho Corporation',
        'target_roles': 'Member Technical Staff',
        'visiting_date': date(2026, 12, 10),
        'min_cgpa': 6.5,
        'max_arrears': 1,
        'min_coding_score': 80.0,
        'min_aptitude_score': 60.0,
        'allowed_departments': 'MSc SS,MCA,MSc CS'
    },
    {
        'name': 'Accenture',
        'target_roles': 'Advanced Application Engineering Associate',
        'visiting_date': date(2026, 12, 15),
        'min_cgpa': 7.0,
        'max_arrears': 0,
        'min_coding_score': 50.0,
        'min_aptitude_score': 65.0,
        'allowed_departments': 'ALL'
    },
    {
        'name': 'Amazon',
        'target_roles': 'Software Development Engineer (SDE-1)',
        'visiting_date': date(2026, 12, 20),
        'min_cgpa': 8.2,
        'max_arrears': 0,
        'min_coding_score': 88.0,
        'min_aptitude_score': 80.0,
        'allowed_departments': 'MSc SS,MCA,MSc IT'
    },
]

def seed():
    print("--- Starting Placement Analytics Database Seed ---")

    # 1. Create Admins
    officer, _ = AdminUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'officer@college.edu',
            'first_name': 'Admin',
            'last_name': '',
            'role': AdminRole.PLACEMENT_OFFICER,
            'is_staff': True,
            'is_superuser': True
        }
    )
    officer.set_password('admin123')
    officer.save()

    coordinator, _ = AdminUser.objects.get_or_create(
        username='coordinator',
        defaults={
            'email': 'coordinator@college.edu',
            'first_name': 'Priya',
            'last_name': 'Raman',
            'role': AdminRole.PLACEMENT_COORDINATOR,
            'is_staff': True
        }
    )
    coordinator.set_password('coord123')
    coordinator.save()

    print("Created Admin & Coordinator accounts.")

    # 2. Create Departments
    dept_objs = {}
    for code, name in DEPARTMENTS:
        d, _ = Department.objects.get_or_create(code=code, defaults={'name': name})
        dept_objs[code] = d

    print(f"Created {len(dept_objs)} Departments.")

    # 3. Create 218 Students
    random.seed(42)  # Consistent realistic seed
    students = []
    statuses = [StudentPlacementStatus.UNPLACED] * 120 + [StudentPlacementStatus.PLACED] * 70 + [StudentPlacementStatus.IN_PROCESS] * 28

    for i in range(1, 219):
        roll = f"22{1000 + i}"
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        dept_code = random.choices(['MSc SS', 'MCA', 'MSc CS', 'MSc IT', 'MCM'], weights=[30, 25, 20, 15, 10])[0]
        dept = dept_objs[dept_code]

        cgpa = round(random.uniform(6.1, 9.8), 2)
        arrears = 0 if cgpa >= 7.5 else random.choice([0, 0, 1, 2])
        status_val = random.choice(statuses)

        student, _ = Student.objects.get_or_create(
            roll_number=roll,
            defaults={
                'name': f"{fn} {ln}",
                'department': dept,
                'section': random.choice(['A', 'B', 'C']),
                'year': 4,
                'cgpa': cgpa,
                'email': f"{fn.lower()}.{ln.lower()}{roll[-3:]}@college.edu",
                'phone': f"+91 9840{random.randint(10005, 99999)}",
                'placement_status': status_val,
                'arrears_count': arrears,
                'resume_link': f"https://drive.google.com/resumes/{roll}.pdf",
                'github_link': f"https://github.com/{fn.lower()}{ln.lower()}",
                'linkedin_link': f"https://linkedin.com/in/{fn.lower()}-{ln.lower()}-{roll}",
            }
        )
        students.append(student)

    print(f"Created {len(students)} Students.")

    # 4. Create 12 Assessments
    assessment_objs = []
    for name, atype, dt, max_m, dur, wt in ASSESSMENTS_DATA:
        asm, _ = Assessment.objects.get_or_create(
            name=name,
            defaults={
                'type': atype,
                'date': dt,
                'max_marks': max_m,
                'duration_minutes': dur,
                'weightage_percent': wt,
                'created_by': officer
            }
        )
        assessment_objs.append(asm)

    print(f"Created {len(assessment_objs)} Assessments.")

    # 5. Populate Assessment Scores
    # Target: Overall Average ~74.2, Highest 98, Lowest 21
    scores_to_create = []
    
    # Ensure explicit extremes
    fixed_extremes = {
        1: 98,  # Roll 221001 gets 98 in top assessment
        218: 21  # Roll 221218 gets 21
    }

    for idx, student in enumerate(students, 1):
        # Base ability derived from CGPA
        base_ability = (student.cgpa / 10.0) * 80.0  # e.g. 8.0 CGPA -> 64 base

        for asm in assessment_objs:
            if idx in fixed_extremes and asm == assessment_objs[0]:
                score_val = fixed_extremes[idx]
                is_abs = False
            else:
                # Skill boost for coding/aptitude based on dept
                dept_boost = 6 if student.department.code in ['MSc SS', 'MCA', 'MSc CS'] and asm.type in [AssessmentType.CODING, AssessmentType.SQL] else 0
                noise = random.gauss(10, 8)
                raw_score = base_ability + dept_boost + noise
                score_val = round(max(25.0, min(97.0, raw_score)), 1)
                is_abs = random.random() < 0.03  # 3% absent rate

            remarks = 'Good Problem Solving' if score_val >= 80 else ('Average' if score_val >= 60 else 'Needs Practice')
            
            AssessmentScore.objects.update_or_create(
                student=student,
                assessment=asm,
                defaults={
                    'score': score_val,
                    'remarks': remarks,
                    'is_absent': is_abs
                }
            )

    print("Populated all Assessment Scores.")

    # 6. Create Companies & Criteria
    for cdata in COMPANIES_DATA:
        comp, _ = Company.objects.get_or_create(
            name=cdata['name'],
            defaults={
                'target_roles': cdata['target_roles'],
                'visiting_date': cdata['visiting_date'],
                'description': f"Off-campus & Campus placement drive for {cdata['name']}"
            }
        )
        CompanyCriteria.objects.update_or_create(
            company=comp,
            defaults={
                'min_cgpa': cdata['min_cgpa'],
                'max_arrears': cdata['max_arrears'],
                'min_coding_score': cdata['min_coding_score'],
                'min_aptitude_score': cdata['min_aptitude_score'],
                'allowed_departments': cdata['allowed_departments']
            }
        )

    print("Created Companies & Criteria.")

    # 7. Seed Admin Logs & Reports
    AdminLog.objects.create(
        admin=officer,
        admin_name=officer.username,
        action='System Initialized',
        details='Seeded 218 students, 12 assessments, and company eligibility rules.'
    )
    Report.objects.create(
        title='Top 20 Performers Report',
        report_type=ReportType.TOP_20,
        file_format='PDF',
        generated_by=officer
    )

    print("=== Database Seeding Complete! ===")

if __name__ == '__main__':
    seed()
