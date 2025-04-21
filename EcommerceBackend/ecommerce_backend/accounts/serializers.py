from rest_framework import serializers
from .models import CustomUser
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer, UserSerializer as BaseUserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from datetime import datetime
from django.contrib.auth.password_validation import validate_password

# class CustomUserSerializer(serializers.ModelSerializer):
#     phone_number = serializers.CharField(required=True)
    
#     class Meta:
#         model = CustomUser
#         fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone_number', 'is_active', 'date_joined']
    
#     def create(self, validated_data):
#         validated_data['role'] = 'customer'  # Set default role
#         return super().create(validated_data)
    

user = get_user_model()

# creating new users
# accounts/serializers.py
from rest_framework import serializers
from accounts.models import CustomUser
from djoser.serializers import UserCreateSerializer

class CustomUserCreateSerializer(UserCreateSerializer):
    phone_number = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    image = serializers.ImageField(required=False)

    class Meta(UserCreateSerializer.Meta):
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone_number','image')

    def create(self, validated_data):
        # Ensure user is saved and returned with proper ID
        user = CustomUser.objects.create_user(**validated_data)
        user.save()  # Explicit save to ensure the instance is saved
        return user  # Ensure the saved instance is returned
    
    
class CustomerSerializer(serializers.ModelSerializer):
    total_orders = serializers.SerializerMethodField()
    total_order_amount = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        # Include the fields you need; note that you can include additional fields if necessary.
        fields = [
            'id', 
            'username', 
            'email', 
            'phone_number', 
            'image', 
            'total_orders', 
            'total_order_amount'
        ]

    def get_total_orders(self, obj):
        # `orders` is the reverse relation defined in your Order model (related_name='orders')
        return obj.orders.count() if obj.orders.exists() else 0

    def get_total_order_amount(self, obj):
        # Sum the total amount from each order in the user's orders queryset
        # Note: This assumes that the Order model's `total` field is up-to-date.
        return sum(order.total for order in obj.orders.all()) 
    
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'image']

class UserSerializer(BaseUserSerializer):
    Date_Joined = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(write_only=True, default=datetime.now)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=True)
    
    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['id', 'first_name',
                  'last_name', 'email',
                  'username',
                  'phone_number',
                  'image',
                  'is_active',
                  'is_deactivated',
                  'date_joined', 'Date_Joined',
                  'role',
                  ]

    def get_Date_Joined(self, obj):
        return obj.date_joined.strftime('%Y-%m-%d')
    
    # this is where we send a request to slash me/ or auth/users
    def validate(self, attrs):
        validated_attr = super().validate(attrs)
        username = validated_attr.get('username')

        user = user.objects.get(username=username)

        if user.is_deactivated:
            raise ValidationError(
                'Account deactivated')

        if not user.is_active:
            raise ValidationError(
                'Account not activated')

        return validated_attr


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims (optional)
        token['first_name'] = user.first_name
        token['role'] = user.role  # Assuming a 'role' field exists on your User model
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if user.is_deactivated:
            raise ValidationError('Account deactivated.')
        if not user.is_active:
            raise ValidationError('Account not activated.')

        # Include user details in the response
        data.update({
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'role': user.role,
            }
        })
        return data
    
    
# class CustomUserUpdateSerializer(serializers.ModelSerializer):
#     first_name = serializers.CharField(required=True)
#     last_name = serializers.CharField(required=True)
#     phone_number = serializers.CharField(required=True)
#     email = serializers.EmailField(required=True)
#     username = serializers.CharField(required=True)

#     class Meta:
#         model = CustomUser
#         fields = ('first_name', 'last_name', 'phone_number', 'email', 'username','image')

#     def validate_email(self, value):
#         # Check if the email is unique (not already taken by another user)
#         if CustomUser.objects.filter(email=value).exclude(id=self.instance.id).exists():
#             raise ValidationError("Email is already in use by another user.")
#         return value

#     def validate_username(self, value):
#         # Check if the username is unique (not already taken by another user)
#         if CustomUser.objects.filter(username=value).exclude(id=self.instance.id).exists():
#             raise ValidationError("Username is already in use by another user.")
#         return value

# class CustomUserUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = ('first_name', 'last_name', 'phone_number', 'email', 'username', 'image')
#         extra_kwargs = {
#             'first_name': {'required': False},
#             'last_name': {'required': False},
#             'phone_number': {'required': False},
#             'email': {'required': False},
#             'username': {'required': False},
#             'image': {'required': False},
#         }

#     def validate_email(self, value):
#         if CustomUser.objects.filter(email=value).exclude(id=self.instance.id).exists():
#             raise serializers.ValidationError("Email is already in use by another user.")
#         return value

#     def validate_username(self, value):
#         if CustomUser.objects.filter(username=value).exclude(id=self.instance.id).exists():
#             raise serializers.ValidationError("Username is already in use by another user.")
#         return value
class CustomUserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'phone_number', 'email', 'username', 'image', 'password')
        extra_kwargs = {field: {'required': False} for field in fields}

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Email is already in use by another user.")
        return value

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Username is already in use by another user.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class OTPSendSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField()
    channel = serializers.ChoiceField(choices=['sms', 'email'])

class OTPVerifySerializer(serializers.Serializer):
    code = serializers.CharField(min_length=6, max_length=6)
    email_or_phone = serializers.CharField()