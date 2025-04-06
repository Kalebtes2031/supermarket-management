from django.apps import AppConfig


class VendorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vendor'
    
    def ready(self):
        # Import the signals so they are registered
        import vendor.signals
