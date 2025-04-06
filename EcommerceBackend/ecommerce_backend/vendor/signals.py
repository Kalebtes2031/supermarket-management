# vendor/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from django.apps import apps

@receiver(post_migrate)
def create_vendor_group(sender, **kwargs):
    # Only run for your vendor app, or remove this check to run for all apps
    if sender.name == 'vendor':  # adjust the app name if needed
        vendor_group, created = Group.objects.get_or_create(name='Vendor')
        # Set up permissions for models in the shop app
        product_permissions = Permission.objects.filter(
            content_type__app_label='shop', 
            content_type__model='product'
        )
        variation_permissions = Permission.objects.filter(
            content_type__app_label='shop', 
            content_type__model='productvariation'
        )
        category_permissions = Permission.objects.filter(
            content_type__app_label='shop', 
            content_type__model='category'
        )
        # Combine all permissions and set them on the group
        all_permissions = list(product_permissions) + list(variation_permissions) + list(category_permissions)
        vendor_group.permissions.set(all_permissions)
        if created:
            print("Vendor group created and permissions assigned.")
