# accounts/permissions.py
from rest_framework.permissions import BasePermission
from rest_framework import permissions

class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'customer'

class IsDeliveryPerson(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'delivery'

class IsVendorPerson(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'vendor'

class IsAdminOrSuperUser(permissions.BasePermission):
    """
    Allows access only to admin or superuser accounts.
    """
    def has_permission(self, request, view):
        # Ensure that the user is authenticated and is either staff or a superuser.
        return request.user and (request.user.is_staff or request.user.is_superuser)
class IsVendorOrAdminOrSuperUser(permissions.BasePermission):
    """
    Custom permission to allow access if the user is a vendor, admin, or superuser.
    """
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        return (user.role == 'vendor') or user.is_staff or user.is_superuser
    