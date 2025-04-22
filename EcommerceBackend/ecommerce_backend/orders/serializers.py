# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, Payment
from shop.serializers import ProductSerializer, ProductVariantSerializer
from django.utils import timezone
from delivery.serializers import AvailableDeliverySerializer

from django.contrib.auth import get_user_model

User = get_user_model()

class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id','username','email']    # whatever you need

class PaymentAdminSerializer(serializers.ModelSerializer):
    user        = UserBriefSerializer(read_only=True)
    receipt_url = serializers.SerializerMethodField()   # <-- this

    def get_receipt_url(self, obj):                     # <-- must live here
        request = self.context.get('request')
        if obj.receipt:
            return request.build_absolute_uri(obj.receipt.url)
        return None

    class Meta:
        model  = Payment
        fields = [
            'id', 'user','order','transaction_id',
            'amount','status','bank_name','receipt_url',
            'created_at'
        ]
        read_only_fields = fields

# class ScheduleDeliverySerializer(serializers.Serializer):
#     scheduled_delivery = serializers.DateTimeField()

#     def validate_scheduled_delivery(self, value):
#         if value <= timezone.now():
#             raise serializers.ValidationError("Scheduled delivery time must be in the future.")
#         return value
class ScheduleDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'scheduled_delivery',
            'customer_latitude',
            'customer_longitude',
        ]

    def validate_scheduled_delivery(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Scheduled delivery time must be in the future.")
        return value

    def validate_customer_latitude(self, value):
        # Optional: enforce valid latitude range
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_customer_longitude(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
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
    payment = serializers.SerializerMethodField()
     
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'payment_status', 'created_at', 'items', 'total', 'total_payment', 'prepared', 'delivery_person', 'scheduled_delivery','phone_number','first_name','last_name','email', 'need_delivery', 'customer_latitude', 'customer_longitude', 'payment']

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
    def get_payment(self, obj):
        # picks the latest payment; change the ordering/filtering as needed
        payment = obj.payments.order_by('-created_at').first()
        if not payment:
            return None
        # we pass the current request into the context so that
        # your get_receipt_url() method can build an absolute URI
        return PaymentAdminSerializer(payment, context=self.context).data
    
class PaymentSerializer(serializers.ModelSerializer):
    # user = serializers.SerializerMethodField()  # Add user field
    order = serializers.PrimaryKeyRelatedField(read_only=True)  # Display order ID
    items = OrderItemSerializer(source='order.items',many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'order','items','user', 'transaction_id', 'amount', 'status', 'created_at']
    
# class PaymentAdminSerializer(serializers.ModelSerializer):
#     receipt_url = serializers.SerializerMethodField()

#     class Meta:
#         model = Payment
#         fields = [
#             'id','user','order','transaction_id',
#             'amount','status','bank_name','receipt_url',
#             'created_at'
#         ]
#         read_only_fields = ['id','user','order','transaction_id',
#                             'amount','bank_name','receipt_url','created_at']
#         # only `status` is writeable

#     def get_receipt_url(self, obj):
#         request = self.context.get('request')
#         if obj.receipt and request:
#             return request.build_absolute_uri(obj.receipt.url)
#         return None
    # def get_user(self, obj):
    #     # Return the user's username (or any field you prefer)
    #     return obj.user.username if obj.user else None 