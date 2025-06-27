from django.urls import path
from . import views

app_name = 'recommendations'

urlpatterns = [
    path('', views.notification_list, name='list'),
    path('partial/', views.notification_partial, name='partial'), # New URL for AJAX
    path('<int:pk>/', views.notification_detail, name='detail'),
    path('partial/<int:pk>/', views.notification_detail_partial, name='detail_partial'),
    path('mark-as-read/<int:pk>/', views.mark_as_read, name='mark_as_read'),
]