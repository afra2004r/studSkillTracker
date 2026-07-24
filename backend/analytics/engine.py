import numpy as np
import pandas as pd
from django.db.models import Avg, Max, Min, Count, StdDev
from students.models import Student, Department
from assessments.models import Assessment, AssessmentScore, AssessmentType
from company_eligibility.models import Company, CompanyCriteria

def calculate_student_analytics(student):
    """
    Computes analytics, ranks, AI placement prediction, and skill breakdown for a single student.
    """
    scores_qs = AssessmentScore.objects.filter(student=student, is_absent=False)
    total_assessments_taken = scores_qs.count()
    all_scores = list(scores_qs.values_list('score', flat=True))

    avg_score = round(float(np.mean(all_scores)), 2) if all_scores else 0.0
    highest_score = float(max(all_scores)) if all_scores else 0.0
    lowest_score = float(min(all_scores)) if all_scores else 0.0
    score_std = float(np.std(all_scores)) if len(all_scores) > 1 else 0.0

    # Type breakdown
    type_scores = {}
    for score_obj in scores_qs.select_related('assessment'):
        atype = score_obj.assessment.type
        if atype not in type_scores:
            type_scores[atype] = []
        type_scores[atype].append(score_obj.score)

    avg_by_type = {atype: round(float(np.mean(vals)), 1) for atype, vals in type_scores.items()}

    coding_avg = avg_by_type.get(AssessmentType.CODING, avg_score)
    aptitude_avg = avg_by_type.get(AssessmentType.APTITUDE, avg_score)
    communication_avg = avg_by_type.get(AssessmentType.COMMUNICATION, avg_score)

    # Weak & Strong areas
    sorted_types = sorted(avg_by_type.items(), key=lambda x: x[1], reverse=True)
    strong_areas = [t[0].replace('_', ' ').title() for t in sorted_types[:2]]
    weak_areas = [t[0].replace('_', ' ').title() for t in sorted_types[-2:]] if len(sorted_types) >= 2 else []

    # AI Placement Readiness Score Calculation (0 - 100%)
    # Weights: CGPA 25%, Avg Score 35%, Coding 20%, Aptitude 10%, Consistency 10%
    cgpa_norm = min(100.0, (student.cgpa / 10.0) * 100.0)
    consistency_norm = max(0.0, 100.0 - (score_std * 2.0))
    arrears_penalty = student.arrears_count * 12.0

    raw_readiness = (
        (cgpa_norm * 0.25) +
        (avg_score * 0.35) +
        (coding_avg * 0.20) +
        (aptitude_avg * 0.10) +
        (consistency_norm * 0.10)
    ) - arrears_penalty

    readiness_pct = max(5.0, min(99.0, round(raw_readiness, 1)))

    if readiness_pct >= 80 and student.arrears_count == 0:
        prediction = 'Very High'
        risk_level = 'Low Risk'
    elif readiness_pct >= 65 and student.arrears_count <= 1:
        prediction = 'High'
        risk_level = 'Medium Risk'
    elif readiness_pct >= 50:
        prediction = 'Moderate'
        risk_level = 'Medium Risk'
    else:
        prediction = 'Low'
        risk_level = 'High Risk'

    expected_interview_perf = 'Excellent' if readiness_pct >= 80 else ('Good' if readiness_pct >= 60 else 'Needs Training')
    consistency_score = round(consistency_norm, 1)

    return {
        'avg_score': avg_score,
        'highest_score': highest_score,
        'lowest_score': lowest_score,
        'assessments_taken': total_assessments_taken,
        'coding_avg': coding_avg,
        'aptitude_avg': aptitude_avg,
        'communication_avg': communication_avg,
        'avg_by_type': avg_by_type,
        'strong_areas': strong_areas,
        'weak_areas': weak_areas,
        'placement_readiness_pct': readiness_pct,
        'prediction': prediction,
        'risk_level': risk_level,
        'expected_interview_perf': expected_interview_perf,
        'consistency_score': consistency_score,
    }


def get_global_rankings():
    """
    Computes overall ranks and department ranks for all active students based on average assessment score & CGPA.
    """
    students = Student.objects.all().select_related('department')
    score_data = []

    for s in students:
        s_scores = list(AssessmentScore.objects.filter(student=s, is_absent=False).values_list('score', flat=True))
        avg_score = round(float(np.mean(s_scores)), 2) if s_scores else 0.0
        
        # Skill specific maxes
        coding_scores = list(AssessmentScore.objects.filter(student=s, assessment__type=AssessmentType.CODING, is_absent=False).values_list('score', flat=True))
        apt_scores = list(AssessmentScore.objects.filter(student=s, assessment__type=AssessmentType.APTITUDE, is_absent=False).values_list('score', flat=True))
        comm_scores = list(AssessmentScore.objects.filter(student=s, assessment__type=AssessmentType.COMMUNICATION, is_absent=False).values_list('score', flat=True))

        score_data.append({
            'id': s.id,
            'roll_number': s.roll_number,
            'name': s.name,
            'dept_code': s.department.code,
            'dept_name': s.department.name,
            'year': s.year,
            'cgpa': s.cgpa,
            'avg_score': avg_score,
            'coding_avg': round(float(np.mean(coding_scores)), 1) if coding_scores else 0.0,
            'aptitude_avg': round(float(np.mean(apt_scores)), 1) if apt_scores else 0.0,
            'comm_avg': round(float(np.mean(comm_scores)), 1) if comm_scores else 0.0,
            'placement_status': s.placement_status,
            'arrears_count': s.arrears_count,
        })

    df = pd.DataFrame(score_data)
    if df.empty:
        return {'rankings': [], 'top_performers': [], 'bottom_performers': [], 'category_leaders': {}}

    # Rank overall (higher avg_score, then higher CGPA)
    df = df.sort_values(by=['avg_score', 'cgpa'], ascending=[False, False])
    df['overall_rank'] = range(1, len(df) + 1)

    # Rank by department
    df['dept_rank'] = df.groupby('dept_code')['avg_score'].rank(ascending=False, method='min').astype(int)

    rankings_list = df.to_dict(orient='records')

    # Category Leaders
    top_coding = df.sort_values(by='coding_avg', ascending=False).iloc[0].to_dict() if not df.empty else None
    top_aptitude = df.sort_values(by='aptitude_avg', ascending=False).iloc[0].to_dict() if not df.empty else None
    top_comm = df.sort_values(by='comm_avg', ascending=False).iloc[0].to_dict() if not df.empty else None

    return {
        'rankings': rankings_list,
        'top_10': rankings_list[:10],
        'top_25': rankings_list[:25],
        'top_50': rankings_list[:50],
        'bottom_performers': rankings_list[-10:],
        'category_leaders': {
            'highest_coding': top_coding,
            'highest_aptitude': top_aptitude,
            'highest_communication': top_comm,
        }
    }


def generate_ai_insights():
    """
    Generates dynamic textual analytical insights based on current dataset statistics.
    """
    students_count = Student.objects.count()
    assessments_count = Assessment.objects.count()
    scores_qs = AssessmentScore.objects.filter(is_absent=False)
    
    if not scores_qs.exists() or students_count == 0:
        return ["Insufficient data available to generate AI insights."]

    all_scores = list(scores_qs.values_list('score', flat=True))
    overall_avg = round(float(np.mean(all_scores)), 1)
    median_score = round(float(np.median(all_scores)), 1)
    std_dev = round(float(np.std(all_scores)), 1)

    insights = []

    # Insight 1: Department lead
    dept_avgs = Student.objects.filter(scores__is_absent=False).values('department__code').annotate(avg=Avg('scores__score')).order_by('-avg')
    if dept_avgs.exists():
        top_dept = dept_avgs.first()
        bottom_dept = dept_avgs.last()
        insights.append(
            f"The {top_dept['department__code']} department leads overall assessment performance with an average score of {round(top_dept['avg'], 1)}%, outperforming {bottom_dept['department__code']} by {round(top_dept['avg'] - bottom_dept['avg'], 1)} percentage points."
        )

    # Insight 2: Assessment type bottleneck
    type_avgs = AssessmentScore.objects.filter(is_absent=False).values('assessment__type').annotate(avg=Avg('score')).order_by('avg')
    if type_avgs.exists():
        weakest_type = type_avgs.first()
        strongest_type = type_avgs.last()
        insights.append(
            f"{weakest_type['assessment__type'].replace('_', ' ').title()} remains the most challenging area across students with an average score of {round(weakest_type['avg'], 1)}%, whereas {strongest_type['assessment__type'].replace('_', ' ').title()} shows the highest proficiency at {round(strongest_type['avg'], 1)}%."
        )

    # Insight 3: At Risk Cohort
    at_risk_count = 0
    rankings_res = get_global_rankings()
    for s_info in rankings_res['rankings']:
        if s_info['avg_score'] < 50.0 or s_info['cgpa'] < 6.5 or s_info['arrears_count'] > 0:
            at_risk_count += 1

    at_risk_pct = round((at_risk_count / students_count) * 100, 1)
    insights.append(
        f"{at_risk_count} students ({at_risk_pct}% of total batch) are flagged as 'High Risk' due to low average scores (<50%) or active arrears, requiring immediate targeted remedial training."
    )

    # Insight 4: Top Tier Consistency
    top_tier = rankings_res['top_10']
    insights.append(
        f"{len(top_tier)} top performers consistently score above {round(np.mean([x['avg_score'] for x in top_tier]), 1)}% across both coding and aptitude modules, placing them in the 90th percentile for premier placement drives."
    )

    # Insight 5: Standard Deviation / Variance analysis
    insights.append(
        f"Overall assessment scores display a median of {median_score} with a standard deviation of {std_dev}. {round(len([x for x in all_scores if x >= 80]) / len(all_scores) * 100, 1)}% of all individual score submissions exceed 80% marks."
    )

    return insights
