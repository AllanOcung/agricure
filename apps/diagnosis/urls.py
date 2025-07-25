from django.urls import path
from . import views

app_name = 'diagnosis'

urlpatterns = [
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('upload/', views.upload_view, name='upload'),
    path('history/', views.diagnosis_history_view, name='history'),
]