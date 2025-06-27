from django.contrib import admin
from .models import Region, Notification, WeatherCondition

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'region', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'region', 'created_at')
    search_fields = ('title', 'message', 'user__username')
    autocomplete_fields = ['user', 'region']

@admin.register(WeatherCondition)
class WeatherConditionAdmin(admin.ModelAdmin):
    list_display = ('region', 'temperature', 'humidity', 'rainfall', 'wind_speed', 'recorded_at')
    list_filter = ('region', 'recorded_at')
    search_fields = ('region__name',)