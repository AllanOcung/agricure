from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Landing page
    path('', include('apps.users.urls')),
    # Other app urls
    path('diagnosis/', include('apps.diagnosis.urls')),
    path('notifications/', include('apps.recommendations.urls')),
    path('history/', include('apps.history.urls')),
    path('iot/', include('apps.iot.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    
    
    
    
    
    