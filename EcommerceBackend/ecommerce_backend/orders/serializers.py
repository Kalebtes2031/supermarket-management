# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, Payment
from shop.serializers import ProductSerializer, ProductVariantSerializer
from django.utils import timezone
from delivery.serializers import AvailableDeliverySerializer


class ScheduleDeliverySerializer(serializers.Serializer):
    scheduled_delivery = serializers.DateTimeField()

    def validate_scheduled_delivery(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Scheduled delivery time must be in the future.")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(source="variations", read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'variant', 'quantity', 'price', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    delivery_person = AvailableDeliverySerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'payment_status', 'created_at', 'items', 'total', 'total_payment', 'prepared', 'delivery_person', 'scheduled_delivery','phone_number','first_name','last_name','email', 'need_delivery', 'customer_latitude', 'customer_longitude']

    def get_user(self, obj):
        if obj.user:
            return {
                'username': obj.user.username,
                'email': obj.user.email,
                'phone_number': obj.user.phone_number,     # Ensure this field exists on your User model
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'image': obj.user.image.url if obj.user.image else None
            }
        return None
    
class PaymentSerializer(serializers.ModelSerializer):
    # user = serializers.SerializerMethodField()  # Add user field
    order = serializers.PrimaryKeyRelatedField(read_only=True)  # Display order ID
    items = OrderItemSerializer(source='order.items',many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'order','items','user', 'transaction_id', 'amount', 'status', 'created_at']
    
    # def get_user(self, obj):
    #     # Return the user's username (or any field you prefer)
    #     return obj.user.username if obj.user else None 