# delivery/serializers.py
from djoser.serializers import UserCreateSerializer
from accounts.models import CustomUser
from rest_framework import serializers
from django.contrib.auth.models import Group

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
        user = super().create(validated_data)
        user.is_staff = True  # Grant access to the Django admin
        user.save()
         # Add user to the vendor group (which should already exist thanks to the post_migrate signal)
        vendor_group, created = Group.objects.get_or_create(name='Vendor')
        user.groups.add(vendor_group)
        return user
