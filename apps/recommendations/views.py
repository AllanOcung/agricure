from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.template.loader import render_to_string
from .models import Notification, WeatherCondition

@login_required
def notification_list(request):
    # Default to the 'alerts' tab if not specified
    active_tab = request.GET.get('tab', 'alerts')
    
    notifications = []
    if active_tab == 'alerts':
        notifications = Notification.objects.filter(user=request.user, type='ALERT')
    elif active_tab == 'recommendations':
        notifications = Notification.objects.filter(user=request.user, type='RECOMMENDATION')
    
    # For simplicity, we'll get the latest weather condition for any region.
    # In a real app, this would be tied to the user's region.
    latest_weather = WeatherCondition.objects.first()

    context = {
        'notifications': notifications,
        'latest_weather': latest_weather,
        'active_tab': active_tab
    }
    title = "Recommendations & Alerts - Agricure"

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string('recommendations/_notification_list_partial.html', context, request=request)
        return JsonResponse({'html': html, 'title': title})

    context['title'] = title
    return render(request, 'recommendations/notification_list.html', context)


@login_required
def notification_detail(request, pk):
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    
    # Mark as read when viewed
    if not notification.is_read:
        notification.is_read = True
        notification.save()
        
    return render(request, 'recommendations/notification_detail.html', {'notification': notification})

# New view for AJAX requests
@login_required
def notification_partial(request):
    active_tab = request.GET.get('tab', 'alerts')
    context = {'active_tab': active_tab}

    if active_tab == 'weather':
        context['latest_weather'] = WeatherCondition.objects.first()
        template_name = 'recommendations/_weather_partial.html'
    else:
        notification_type = 'ALERT' if active_tab == 'alerts' else 'RECOMMENDATION'
        context['notifications'] = Notification.objects.filter(user=request.user, type=notification_type)
        template_name = 'recommendations/_notifications_partial.html'
        
    return render(request, template_name, context)


# New view for the details modal
@login_required
def notification_detail_partial(request, pk):
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    
    # Mark as read when viewed
    if not notification.is_read:
        notification.is_read = True
        notification.save()
        
    return render(request, 'recommendations/_notification_detail_partial.html', {'notification': notification})


@require_POST
@login_required
def mark_as_read(request, pk):
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    notification.is_read = True
    notification.save()
    return JsonResponse({'success': True})