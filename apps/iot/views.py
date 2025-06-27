import json
import random
from datetime import datetime, timedelta
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils import timezone
from django.db.models import Avg, Max, Min
from .models import IoTDevice, IoTData, Alert

def generate_mock_data():
    """Generate mock IoT data for demonstration"""
    return {
        'temperature': 25 + random.random() * 10,  # 25-35°C
        'humidity': 60 + random.random() * 30,  # 60-90%
        'soil_moisture': 40 + random.random() * 40,  # 40-80%
        'light_intensity': 800 + random.random() * 400,  # 800-1200 lux
    }

def generate_historical_data(time_range='24h'):
    """Generate historical data based on time range"""
    data = []
    now = timezone.now()
    
    if time_range == '24h':
        intervals = 24
        time_step = timedelta(hours=1)
        time_format = lambda dt: dt.strftime('%H:%M')
    elif time_range == '7d':
        intervals = 7
        time_step = timedelta(days=1)
        time_format = lambda dt: dt.strftime('%b %d')
    else:  # 30d
        intervals = 30
        time_step = timedelta(days=1)
        time_format = lambda dt: dt.strftime('%b %d')
    
    for i in range(intervals, -1, -1):
        timestamp = now - (i * time_step)
        base_temp = 25 + random.random() * 10
        base_humidity = 60 + random.random() * 30
        base_soil = 40 + random.random() * 40
        base_light = 800 + random.random() * 400
        
        data.append({
            'time': time_format(timestamp),
            'temperature': round(base_temp + random.random() * 5 - 2.5, 1),
            'humidity': round(base_humidity + random.random() * 10 - 5, 1),
            'soil_moisture': round(base_soil + random.random() * 10 - 5, 1),
            'light_intensity': round(base_light + random.random() * 200 - 100),
        })
    
    return data

@login_required
def iot_dashboard(request):
    # Get or create default device
    device, created = IoTDevice.objects.get_or_create(
        device_id='field_sensor_1',
        defaults={
            'name': 'Field Sensor #1',
            'location': 'Main Field',
            'is_active': True
        }
    )
    
    # Generate current mock data
    current_data = generate_mock_data()
    
    # Create IoT data record
    iot_data = IoTData.objects.create(
        device=device,
        user=request.user,
        temperature=current_data['temperature'],
        humidity=current_data['humidity'],
        soil_moisture=current_data['soil_moisture'],
        light_intensity=current_data['light_intensity']
    )
    
    # Get time range from request
    time_range = request.GET.get('range', '24h')
    
    # Generate historical data
    historical_data = generate_historical_data(time_range)
    
    # Generate alerts based on current data
    alerts = []
    
    if iot_data.temperature > 35:
        alerts.append({
            'type': 'critical',
            'icon': 'thermometer',
            'title': 'High Temperature Alert',
            'message': f'Temperature is {iot_data.temperature:.1f}°C. Consider implementing cooling measures.',
            'color': 'red'
        })
    
    if iot_data.humidity > 80:
        alerts.append({
            'type': 'warning',
            'icon': 'droplets',
            'title': 'High Humidity Warning',
            'message': f'Humidity is {iot_data.humidity:.1f}%. Monitor for fungal disease development.',
            'color': 'yellow'
        })
    
    if iot_data.soil_moisture < 20:
        alerts.append({
            'type': 'warning',
            'icon': 'activity',
            'title': 'Low Soil Moisture Alert',
            'message': f'Soil moisture is {iot_data.soil_moisture:.1f}%. Irrigation recommended.',
            'color': 'orange'
        })
    
    if (20 <= iot_data.temperature <= 30 and 
        40 <= iot_data.humidity <= 70 and 
        30 <= iot_data.soil_moisture <= 70):
        alerts.append({
            'type': 'success',
            'icon': 'calendar',
            'title': 'Optimal Growing Conditions',
            'message': 'All environmental parameters are within optimal ranges for crop growth.',
            'color': 'green'
        })
    
    # Simulate connection status
    is_online = random.random() > 0.1  # 90% uptime
    
    if not is_online:
        alerts.append({
            'type': 'critical',
            'icon': 'wifi-off',
            'title': 'Sensor Offline',
            'message': 'Connection to field sensor lost. Check device connectivity and power supply.',
            'color': 'red'
        })
    
    context = {
        'device': device,
        'current_data': iot_data,
        'historical_data': json.dumps(historical_data),
        'alerts': alerts,
        'is_online': is_online,
        'time_range': time_range,
    }
    
    title = "IoT Dashboard - Agricure"
    
    # Handle AJAX requests for page navigation
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string('iot/_dashboard_partial.html', context, request=request)
        return JsonResponse({'html': html, 'title': title})
    
    context['title'] = title
    return render(request, 'iot/dashboard.html', context)

@login_required
def get_current_data(request):
    """API endpoint for real-time data updates"""
    device = IoTDevice.objects.filter(device_id='field_sensor_1').first()
    if not device:
        return JsonResponse({'error': 'Device not found'}, status=404)
    
    # Generate new mock data
    current_data = generate_mock_data()
    
    # Create new IoT data record
    iot_data = IoTData.objects.create(
        device=device,
        user=request.user,
        temperature=current_data['temperature'],
        humidity=current_data['humidity'],
        soil_moisture=current_data['soil_moisture'],
        light_intensity=current_data['light_intensity']
    )
    
    return JsonResponse({
        'temperature': iot_data.temperature,
        'humidity': iot_data.humidity,
        'soil_moisture': iot_data.soil_moisture,
        'light_intensity': iot_data.light_intensity,
        'timestamp': iot_data.timestamp.isoformat(),
        'temperature_status': iot_data.get_temperature_status(),
        'humidity_status': iot_data.get_humidity_status(),
        'soil_moisture_status': iot_data.get_soil_moisture_status(),
        'temperature_recommendation': iot_data.get_temperature_recommendation(),
        'humidity_recommendation': iot_data.get_humidity_recommendation(),
        'soil_moisture_recommendation': iot_data.get_soil_moisture_recommendation(),
        'light_intensity_recommendation': iot_data.get_light_intensity_recommendation(),
    })

@login_required
def get_historical_data(request):
    """API endpoint for historical data"""
    time_range = request.GET.get('range', '24h')
    historical_data = generate_historical_data(time_range)
    return JsonResponse({'data': historical_data})
