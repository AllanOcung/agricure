from django.db import models
from django.conf import settings

class Diagnosis(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='diagnoses/')
    disease_name = models.CharField(max_length=255)
    severity = models.CharField(max_length=100)
    affected_plant_part = models.CharField(max_length=100)
    confidence = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diagnosis for {self.user.username} on {self.created_at.strftime('%Y-%m-%d')}"