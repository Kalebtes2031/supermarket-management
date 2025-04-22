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
        
        # create the user first
        user = super().create(validated_data)
        # now create their profile
        AvailableDelivery.objects.create(
            user=user,
            phone_number=user.phone_number or ""   # optional
        )
        return user


class DeliveryPersonUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id','first_name', 'last_name', 'phone_number', 'image']

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


class NewAvailableDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableDelivery
        fields = ['is_available', 'phone_number']

class DeliveryUserSerializer(serializers.ModelSerializer):
    delivery_profile = NewAvailableDeliverySerializer(read_only=True)

    class Meta:
        model  = CustomUser
        fields = [
          'id','username','first_name','last_name',
          'email','phone_number','role',
          'delivery_profile'
        ]
# delivery/serializers.py
class AdminAvailableDeliverySerializer(serializers.ModelSerializer):
    user = DeliveryUserSerializer(read_only=True)
    class Meta:
        model  = AvailableDelivery
        fields = ['id', 'user', 'is_available', 'phone_number']
