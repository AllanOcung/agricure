from django.contrib import admin
from .models import Diagnosis

@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('user', 'disease_name', 'severity', 'created_at', 'image')
    list_filter = ('severity', 'affected_plant_part', 'created_at')
    search_fields = ('user__username', 'disease_name')