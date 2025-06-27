import random
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from .forms import DiagnosisForm
from .models import Diagnosis
from datetime import datetime, timedelta
from django.utils import timezone

def get_mock_diagnosis():
    """
    Mock AI function with more detailed results.
    """
    diseases = ["Leaf Blight", "Rust", "Powdery Mildew"]
    severities = ["Low", "Medium", "High"]
    parts = ["Leaves", "Stem"]
    descriptions = {
        "Leaf Blight": "A common fungal disease causing spots on leaves, which can lead to defoliation if severe.",
        "Rust": "Fungal infection that produces reddish-orange pustules on leaves and stems.",
        "Powdery Mildew": "A fungal disease that appears as white powdery spots on leaves and stems."
    }
    recommendations = {
        "Leaf Blight": ["Apply a fungicide containing copper or chlorothalonil.", "Ensure proper plant spacing for air circulation.", "Remove and destroy infected leaves."],
        "Rust": ["Use sulfur-based fungicides.", "Avoid overhead watering.", "Plant rust-resistant varieties."],
        "Powdery Mildew": ["Spray with potassium bicarbonate or neem oil.", "Increase air circulation around plants.", "Remove infected plant parts immediately."]
    }
    
    chosen_disease = random.choice(diseases)
    
    return {
        "disease_name": chosen_disease,
        "severity": random.choice(severities),
        "affected_plant_part": random.choice(parts),
        "confidence": random.randint(85, 99),
        "description": descriptions[chosen_disease],
        "recommendations_list": recommendations[chosen_disease]
    }

@login_required
def dashboard_view(request):
    # Handle AJAX POST requests for diagnosis
    if request.method == 'POST':
        form = DiagnosisForm(request.POST, request.FILES)
        if form.is_valid():
            diagnosis = form.save(commit=False)
            diagnosis.user = request.user
            
            mock_results = get_mock_diagnosis()
            
            diagnosis.disease_name = mock_results['disease_name']
            diagnosis.severity = mock_results['severity']
            diagnosis.affected_plant_part = mock_results['affected_plant_part']
            diagnosis.confidence = mock_results['confidence']
            diagnosis.description = mock_results['description']
            diagnosis.recommendations = "\n".join(mock_results['recommendations_list'])
            
            diagnosis.save()
            
             # --- START: Recalculate stats after saving ---
            user_diagnoses = Diagnosis.objects.filter(user=request.user)
            last_30_days = timezone.now() - timedelta(days=30)
            updated_stats = {
                'diagnoses_this_month': user_diagnoses.filter(created_at__gte=last_30_days).count(),
                'accuracy_rate': 95, # This can remain static for now
                'diseases_detected': user_diagnoses.values('disease_name').distinct().count()
            }
            # --- END: Recalculate stats after saving ---


            # Prepare data to be sent back as JSON
            diagnosis_data = {
                'disease_name': diagnosis.disease_name,
                'severity': diagnosis.severity,
                'affected_plant_part': diagnosis.affected_plant_part,
                'confidence': diagnosis.confidence,
                'description': diagnosis.description,
                'recommendations_list': diagnosis.recommendations.splitlines(),
            }
            
            # Combine diagnosis and stats into a single response
            response_data = {
                'diagnosis': diagnosis_data,
                'stats': updated_stats
            }
            
            return JsonResponse(response_data)
        else:
            # Return form errors as JSON with a 400 status
            return JsonResponse({'errors': form.errors}, status=400)

    # Handle standard GET requests (initial page load)
    user_diagnoses = Diagnosis.objects.filter(user=request.user)
    last_30_days = timezone.now() - timedelta(days=30)
    
    stats = {
        'diagnoses_this_month': user_diagnoses.filter(created_at__gte=last_30_days).count(),
        'accuracy_rate': 95,
        'diseases_detected': user_diagnoses.values('disease_name').distinct().count()
    }

    context = {
        'form': DiagnosisForm(), # Always provide an empty form for the initial page
        'stats': stats,
        'diagnosis': None # The initial page has no diagnosis result
    }
    
    title = "Dashboard - Agricure"
    
    # Handle AJAX requests for page navigation
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string('diagnosis/_dashboard_partial.html', context, request=request)
        return JsonResponse({'html': html, 'title': title})
    
    context['title'] = title
    return render(request, 'diagnosis/dashboard.html', context)


@login_required
def diagnosis_history_view(request):
    diagnoses = Diagnosis.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'diagnosis/diagnosis_history.html', {'diagnoses': diagnoses})