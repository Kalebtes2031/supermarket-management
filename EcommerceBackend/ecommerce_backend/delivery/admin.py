from django.contrib import admin
from .models import AvailableDelivery

admin.site.register(AvailableDelivery)

# class UserAdmin(admin.ModelAdmin):
#     list_display = ('username', 'email', 'is_superuser','is_available')  # Adjust the fields as needed
#     search_fields = ('username', 'email')
# Register your models here.
