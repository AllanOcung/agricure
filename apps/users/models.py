from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        FARMER = "FARMER", "Farmer"
        AGRONOMIST = "AGRONOMIST", "Agronomist"

    # You can remove first_name and last_name if you only want to use full_name
    first_name = None
    last_name = None
    
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.FARMER)

    def save(self, *args, **kwargs):
        if not self.pk and self.role == self.Role.ADMIN:
            self.is_staff = True
            self.is_superuser = True
        super().save(*args, **kwargs)