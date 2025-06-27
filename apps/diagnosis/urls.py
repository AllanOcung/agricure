from django.urls import path
from django.shortcuts import redirect
from . import views

app_name = 'diagnosis'

urlpatterns = [
    path('', lambda request: redirect('users:login'), name='home'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('history/', views.diagnosis_history_view, name='history'),
]