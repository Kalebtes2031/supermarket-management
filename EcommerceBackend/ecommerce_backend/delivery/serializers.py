# delivery/serializers.py
from djoser.serializers import UserCreateSerializer
from accounts.models import CustomUser
from .models import AvailableDelivery
from rest_framework import serializers

class DeliveryUserCreateSerializer(UserCreateSerializer):
    phone_number = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    image= serializers.ImageField(required=False)

    class Meta(UserCreateSerializer.Meta):
        model = CustomUser
        # Ensure we include first_name and last_name along with phone_number
        fields = UserCreateSerializer.Meta.fields + ('first_name', 'last_name', 'phone_number', 'image')

    def create(self, validated_data):
        validated_data['role'] = 'delivery'  # Set the role for delivery personnel
        return super().create(validated_data)


class DeliveryPersonUserSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'phone_number', 'image']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class AvailableDeliverySerializer(serializers.ModelSerializer):
    user = DeliveryPersonUserSerializer()  # Nested user serializer

    class Meta:
        model = AvailableDelivery
        fields = ['user', 'is_available']
