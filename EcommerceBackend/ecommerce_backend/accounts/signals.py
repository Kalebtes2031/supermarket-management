# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser
from delivery.models import AvailableDelivery

@receiver(post_save, sender=CustomUser)
def create_delivery_profile(sender, instance, created, **kwargs):
    # Only create a AvailableDelivery if the user was just created and has role "delivery"
    if created and instance.role == 'delivery':
        AvailableDelivery.objects.create(user=instance, phone_number=instance.phone_number)
