from django.db import models
from django.conf import settings

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        ALERT = 'ALERT', 'Alert'
        RECOMMENDATION = 'RECOMMENDATION', 'Recommendation'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True, help_text="Optional: For region-specific alerts.")

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class WeatherCondition(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='weather_conditions')
    temperature = models.DecimalField(max_digits=5, decimal_places=2, help_text="Temperature in Celsius")
    humidity = models.DecimalField(max_digits=5, decimal_places=2, help_text="Humidity in percentage")
    rainfall = models.DecimalField(max_digits=5, decimal_places=2, help_text="Rainfall in mm")
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2, help_text="Wind speed in km/h")
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Weather in {self.region.name} at {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-recorded_at']
        get_latest_by = 'recorded_at'