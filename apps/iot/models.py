from django.db import models
from django.conf import settings
from django.utils import timezone

class IoTDevice(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    device_id = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.location}"

class IoTData(models.Model):
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE, related_name='readings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    temperature = models.FloatField()  # in Celsius
    humidity = models.FloatField()  # in percentage
    soil_moisture = models.FloatField()  # in percentage
    light_intensity = models.FloatField()  # in lux
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.device.name} - {self.timestamp}"
    
    def get_temperature_status(self):
        if self.temperature < 15 or self.temperature > 35:
            return 'critical'
        elif self.temperature < 20 or self.temperature > 30:
            return 'warning'
        return 'optimal'
    
    def get_humidity_status(self):
        if self.humidity < 30 or self.humidity > 80:
            return 'critical'
        elif self.humidity < 40 or self.humidity > 70:
            return 'warning'
        return 'optimal'
    
    def get_soil_moisture_status(self):
        if self.soil_moisture < 20 or self.soil_moisture > 80:
            return 'critical'
        elif self.soil_moisture < 30 or self.soil_moisture > 70:
            return 'warning'
        return 'optimal'
    
    def get_temperature_recommendation(self):
        if self.temperature > 35:
            return 'Consider shade or cooling measures'
        elif self.temperature < 15:
            return 'Protect crops from cold'
        return 'Optimal temperature range'
    
    def get_humidity_recommendation(self):
        if self.humidity > 80:
            return 'Risk of fungal diseases - improve ventilation'
        elif self.humidity < 30:
            return 'Consider irrigation or misting'
        return 'Good humidity levels'
    
    def get_soil_moisture_recommendation(self):
        if self.soil_moisture < 20:
            return 'Immediate irrigation needed'
        elif self.soil_moisture > 80:
            return 'Reduce watering - risk of root rot'
        return 'Adequate soil moisture'
    
    def get_light_intensity_recommendation(self):
        if self.light_intensity > 1000:
            return 'Excellent growing conditions'
        elif self.light_intensity > 500:
            return 'Adequate light levels'
        return 'Consider supplemental lighting'

class Alert(models.Model):
    ALERT_TYPES = [
        ('temperature_high', 'High Temperature'),
        ('temperature_low', 'Low Temperature'),
        ('humidity_high', 'High Humidity'),
        ('humidity_low', 'Low Humidity'),
        ('soil_moisture_low', 'Low Soil Moisture'),
        ('soil_moisture_high', 'High Soil Moisture'),
        ('device_offline', 'Device Offline'),
        ('optimal_conditions', 'Optimal Conditions'),
    ]
    
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.TextField()
    value = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.device.name}"
