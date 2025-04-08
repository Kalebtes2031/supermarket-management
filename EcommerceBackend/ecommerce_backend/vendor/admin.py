# vendor/admin.py
from django.contrib import admin
from django.urls import path, reverse
from django.template.response import TemplateResponse
from django.shortcuts import redirect
from shop.models import Product, Category, ProductVariation

class VendorAdminSite(admin.AdminSite):
    site_header = "Vendor Administration"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('pending-orders/', self.admin_view(self.pending_orders_view), name='pending-orders'),
            path('on-delivery-orders/', self.admin_view(self.on_delivery_orders_view), name='on-delivery-orders'),
        ]
        return custom_urls + urls

    def index(self, request, extra_context=None):
        if not request.user.groups.filter(name='Vendor').exists():
            return redirect('admin:login')

        from django.urls import reverse  # Required here too for namespaced URLs

        custom_context = {
            'custom_vendor_pages': [
                {'name': 'Pending Orders', 'url': reverse('vendor_admin:pending-orders')},
                {'name': 'On Delivery Orders', 'url': reverse('vendor_admin:on-delivery-orders')},
            ]
        }
        if extra_context:
            custom_context.update(extra_context)
        return TemplateResponse(request, "admin/vendor_index.html", custom_context)

    def pending_orders_view(self, request):
        if not request.user.groups.filter(name='Vendor').exists():
            return redirect('admin:login')

        from orders.models import Order
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        orders = Order.objects.filter(status='Pending', prepared=False, scheduled_delivery__range=(start, end))

        context = dict(
            self.each_context(request),
            orders=orders,
            title="Pending Orders",
        )
        return TemplateResponse(request, "admin/pending_orders.html", context)

    def on_delivery_orders_view(self, request):
        if not request.user.groups.filter(name='Vendor').exists():
            return redirect('admin:login')

        from orders.models import Order
        orders = Order.objects.filter(payment_status='On Delivery')
        context = dict(
            self.each_context(request),
            orders=orders,
            title="On Delivery Orders",
        )
        return TemplateResponse(request, "admin/on_delivery_orders.html", context)

# ✅ Define the instance AFTER the class definition
vendor_admin_site = VendorAdminSite(name='vendor_admin')

# ✅ Register models after vendor_admin_site is defined
vendor_admin_site.register(Product)
vendor_admin_site.register(Category)
vendor_admin_site.register(ProductVariation)
