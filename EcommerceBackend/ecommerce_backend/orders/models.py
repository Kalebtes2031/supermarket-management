# orders/models.py
from django.db import models
from django.conf import settings
from shop.models import ProductVariation  # Assuming the Product model is in the 'shop' app
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from accounts.models import CustomUser
from decimal import Decimal
from django.core.exceptions import ValidationError
import os
from delivery.models import AvailableDelivery 
    
ORDER_STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Waiting', 'Waiting'),
    ('Fully Paid', 'Fully Paid'),
    ('Cancelled', 'Cancelled'),
    ('Assigned', 'Assigned'),
    ('In Transit', 'In Transit'),
    ('Delivered', 'Delivered'),
]
class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='Pending')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Fully Paid', 'Fully Paid'), ('Failed', 'Failed')], default='Pending')
    delivery_person = models.ForeignKey(
        'delivery.AvailableDelivery', null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_orders'
    )
    prepared = models.BooleanField(default=False)
    scheduled_delivery = models.DateTimeField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    first_name = models.CharField(max_length=20, blank=True, null=True)
    last_name = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(unique=False, blank=True, null=True)
    
    def calculate_total(self):
        self.total = sum(item.get_total_price() for item in self.items.all())

    def save(self, *args, **kwargs):
        if self.pk:  
            self.calculate_total()
        super(Order, self).save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    variations = models.ForeignKey(ProductVariation, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at the time of purchase

    def get_total_price(self):
        return self.quantity * self.price

    def __str__(self):
        return f"{self.quantity} x {self.variations.variations.item_name} in Order #{self.order.id}"

def validate_file_extension(value):
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    ext = os.path.splitext(value.name)[1]
    if ext.lower() not in valid_extensions:
        raise ValidationError(f"Unsupported file extension. Allowed types: {', '.join(valid_extensions)}")

def validate_file_size(value):
    max_file_size = 5 * 1024 * 1024
    if value.size > max_file_size:
        raise ValidationError("File size should not exceed 5MB.")

class Payment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    # payment_type = models.CharField(max_length=20, choices=[('Advance', 'Advance'), ('Remaining', 'Remaining')])
    transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('Success', 'Success'), ('Failed', 'Failed')])
    # payment_method = models.CharField(max_length=50, choices=[('Chapa', 'Chapa'), ('Credit Card', 'Credit Card'), ('PayPal', 'PayPal')], default='Chapa')
    created_at = models.DateTimeField(auto_now_add=True)
    bank_name = models.CharField(max_length = 255, null=True, blank=True)
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True, validators=[validate_file_extension, validate_file_size])

    def __str__(self):
        return f"{self.user.username} payment for Order #{self.order.id} - {self.transaction_id}"
    
@receiver(post_save, sender=Order)
def update_product_popularity(sender, instance, created, **kwargs):
    """
    Updates product popularity whenever an order is created.
    """
    if instance.payment_status == 'Fully Paid':  # Ensure that we only update popularity for delivered orders
        for item in instance.items.all():
            product = item.variations.variations
            product.popularity += item.quantity  # Increment popularity by ordered quantity
            product.save()
            

@receiver(post_save, sender=Payment)
def update_order_payment_status(sender, instance, created, **kwargs):
    """
    Update the order payment status and advance payment after successful payment.
    """
    if created and instance.status == 'Success':
        order = instance.order
        order.payment_status = 'Paid' 
        order.save()