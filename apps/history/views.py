from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth
from django.core.paginator import Paginator
from apps.diagnosis.models import Diagnosis
import json

@login_required
def history_list_view(request):
    # Base queryset for the current user
    diagnoses_qs = Diagnosis.objects.filter(user=request.user)

    # --- Filtering ---
    search_term = request.GET.get('search', '')
    filter_severity = request.GET.get('severity', 'all')

    if search_term:
        diagnoses_qs = diagnoses_qs.filter(disease_name__icontains=search_term)
    
    if filter_severity != 'all':
        diagnoses_qs = diagnoses_qs.filter(severity=filter_severity)

    all_diagnoses = diagnoses_qs.order_by('-created_at')

    # --- Analytics Calculations ---
    total_diagnoses = all_diagnoses.count()
    disease_frequency = all_diagnoses.values('disease_name').annotate(count=Count('disease_name')).order_by('-count')
    severity_distribution = all_diagnoses.values('severity').annotate(count=Count('severity')).order_by('severity')
    avg_confidence = all_diagnoses.aggregate(avg=Avg('confidence'))['avg'] or 0

    # Monthly trend data
    monthly_trend = (
        diagnoses_qs
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    
    # Format data for Chart.js
    monthly_labels = [m['month'].strftime('%b') for m in monthly_trend]
    monthly_data = [m['count'] for m in monthly_trend]
    
    severity_labels = [s['severity'] for s in severity_distribution]
    severity_data = [s['count'] for s in severity_distribution]

    # --- Pagination ---
    paginator = Paginator(all_diagnoses, 5) # 5 per page for the new detailed view
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'diagnoses_page': page_obj,
        'total_diagnoses': total_diagnoses,
        'disease_frequency': disease_frequency,
        'avg_confidence': avg_confidence,
        'search_term': search_term,
        'filter_severity': filter_severity,
        # Data for charts, converted to JSON strings
        'monthly_labels': json.dumps(monthly_labels),
        'monthly_data': json.dumps(monthly_data),
        'severity_labels': json.dumps(severity_labels),
        'severity_data': json.dumps(severity_data),
    }
    title = "Diagnosis History - Agricure"

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        # For AJAX filtering, we could return just the list part, but for now we reload the whole partial
        html = render_to_string('history/_history_list_partial.html', context, request=request)
        return JsonResponse({'html': html, 'title': title})

    context['title'] = title
    return render(request, 'history/history_list.html', context)