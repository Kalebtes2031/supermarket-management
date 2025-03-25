from django.contrib import admin
from .models import CustomUser
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin

admin.site.unregister(Group)

@admin.register(CustomUser)
# class CustomUserAdmin(UserAdmin):
#     fieldsets = UserAdmin.fieldsets + (
#         (None, {'fields': ('phone_number',)}),
#     )
#     add_fieldsets = UserAdmin.add_fieldsets + (
#         (None, {'fields': ('phone_number', 'first_name', 'last_name')}),
#     )
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_superuser','is_active','date_joined','role')  # Adjust the fields as needed
    search_fields = ('username', 'email')
    list_filter = ['role']
    
# @admin.register(CustomUser)
# class CustomUserAdmin(admin.ModelAdmin):
#     list_display = ('email', 'username', 'first_name', 'last_name', 'phone_number', 'is_active')   