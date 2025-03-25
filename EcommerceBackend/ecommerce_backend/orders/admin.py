from django.contrib import admin
from .models import Order, Payment

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'payment_status', 'total','total_payment','advance_payment','remaining_payment', 'created_at']
    search_fields = ['user__username', 'payment_status']
    list_filter = ['payment_status', 'created_at']
    
    def has_add_permission(self, request):
        """Disable the 'Add Order' button."""
        return False
       
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'order', 'amount', 'status','created_at']
    search_fields = ['user__username', 'order__id', 'status']
    list_filter = ['status']

# Register the models with the admin site
admin.site.register(Order, OrderAdmin)
admin.site.register(Payment, PaymentAdmin)