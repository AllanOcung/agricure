from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Include your users app urls. Using 'accounts/' is a common convention.
    path('accounts/', include('apps.users.urls')),
    path('notifications/', include('apps.recommendations.urls')),
    path('history/', include('apps.history.urls')),
    path('iot/', include('apps.iot.urls')),
    
    path('', include('apps.diagnosis.urls')),
]

# Serve media and static files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Django automatically serves static files from STATICFILES_DIRS in DEBUG mode
    
    
    
    
    
    
    