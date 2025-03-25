# delivery/serializers.py
from djoser.serializers import UserCreateSerializer
from accounts.models import CustomUser
from rest_framework import serializers

class VendorUserCreateSerializer(UserCreateSerializer):
    phone_number = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    image= serializers.ImageField(required=False)

    class Meta(UserCreateSerializer.Meta):
        model = CustomUser
        # Ensure we include first_name and last_name along with phone_number
        fields = UserCreateSerializer.Meta.fields + ('first_name', 'last_name', 'phone_number', 'image')

    def create(self, validated_data):
        validated_data['role'] = 'vendor'  # Set the role for delivery personnel
        return super().create(validated_data)
