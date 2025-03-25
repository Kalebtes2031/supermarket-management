# delivery/models.py
# from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class AvailableDelivery(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='delivery_profile',
        limit_choices_to={'role': 'delivery'}  # This filters the user choices to those with role "delivery"
    )
    # Using PostGIS PointField for geospatial data
    # location = gis_models.PointField(null=True, blank=True)  
    is_available = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    # Additional fields can be added as needed (vehicle info, rating, etc.)

    def clean(self):
        # Ensure that only users with role 'delivery' have a DeliveryProfile.
        if self.user.role != 'delivery':
            raise ValidationError("This profile can only be assigned to a delivery user.")
    
    def save(self, *args, **kwargs):
        self.clean()  # Validate before saving
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Delivery Profile for {self.user.username}"