from django.urls import path
from . import views

app_name = 'iot'

urlpatterns = [
    path('', views.iot_dashboard, name='dashboard'),
    path('api/current/', views.get_current_data, name='current_data'),
    path('api/historical/', views.get_historical_data, name='historical_data'),
]
