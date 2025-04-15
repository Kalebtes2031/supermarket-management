from rest_framework.generics import ListAPIView, UpdateAPIView
from .models import OTP, CustomUser
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, OTPSendSerializer, OTPVerifySerializer, CustomerSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import status, generics, serializers
from django.shortcuts import render, get_object_or_404, redirect
from rest_framework_simplejwt.views import TokenObtainPairView
from decouple import config
import requests
from djoser.views import UserViewSet
from rest_framework.views import APIView
from django.conf import settings
from accounts.serializers import CustomUserCreateSerializer, CustomUserUpdateSerializer, CustomUserSerializer
import random
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.contrib.auth import get_user_model
#for sending email
from django.core.mail import send_mail
from rest_framework.exceptions import ValidationError
import africastalking
from .permissions import IsAdminOrSuperUser
from rest_framework import viewsets
import logging
logger = logging.getLogger(__name__)

# For sending SMS via Twilio
from twilio.rest import Client

User = get_user_model()

def generate_password_reset_token(user):
    """
    Generate a JWT token to be used for password reset.
    Here we use the access token from simplejwt.
    """
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

print("USERNAME:", settings.AFRICASTALKING_USERNAME)
print("API_KEY:", settings.AFRICASTALKING_API_KEY)

class AdminCustomerViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset to manage customers (users with role 'customer').
    This endpoint allows admin/superuser to list, retrieve, and delete customer users.
    """
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminOrSuperUser]

    def get_queryset(self):
        # Fetch only users that have a customer role
        return User.objects.filter(role='customer', is_staff=False, is_superuser=False)

# africastalking.initialize(
#     username=settings.AFRICASTALKING_USERNAME,
#     api_key=settings.AFRICASTALKING_API_KEY
# )
# sms = africastalking.SMS

# sms.send("Your OTP is 1234", ["+251970949140"])


class SendOTPView(APIView):
    throttle_scope = 'otp'
    permission_classes = [AllowAny]  # Allow unauthenticated users

    def post(self, request):
        logger.debug("Request data: %s", request.data)
        serializer = OTPSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email_or_phone = serializer.validated_data['email_or_phone']
        channel = serializer.validated_data['channel']
        
        # Generate a random 6-digit code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = timezone.now() + timedelta(minutes=15)
        
        # (Optional) Find the user if they exist
        user = None
        if channel == 'sms':
            try:
                user = User.objects.get(phone_number=email_or_phone)
            except User.DoesNotExist:
                return Response({'error': 'User with this phone number not found'}, status=status.HTTP_400_BAD_REQUEST)
        elif channel == 'email':
            try:
                user = User.objects.get(email=email_or_phone)
            except User.DoesNotExist:
                return Response({'error': 'User with this email not found'}, status=status.HTTP_400_BAD_REQUEST)

        
        # Save the OTP in the database
        OTP.objects.create(
            user=user,
            email_or_phone=email_or_phone,
            code=code,
            expires_at=expires_at,
            channel=channel
        )
        
        # Send OTP via SMS or Email
        if channel == 'sms':
            self._send_sms(code, email_or_phone)
        else:
            self._send_email(code, email_or_phone)
            
        return Response({'status': 'OTP sent'}, status=status.HTTP_200_OK)

   
    # def _send_sms(self, code, phone_number):
    #     try:
    #         client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    #         message = f"Your OTP is {code}. It expires in 15 minutes."
    #         client.messages.create(
    #             body=message,
    #             from_=settings.TWILIO_PHONE_NUMBER,
    #             to=phone_number
    #         )
    #     except Exception as e:
    #         raise ValidationError({'sms_error': str(e)})
    def _send_sms(self, code, phone_number):
         # Initialize Africa's Talking
        africastalking.initialize(
            username=settings.AFRICASTALKING_USERNAME,
            api_key=settings.AFRICASTALKING_API_KEY
        )
        sms = africastalking.SMS

        try:
            message = f"Your OTP is {code}. It expires in 15 minutes."
            response = sms.send(message, [phone_number], from_='AFRICASTKNG')  # Send to a list of numbers
            print("Africa's Talking response:", response)
        except Exception as e:
            raise ValidationError({'sms_error': str(e)})
        
    def _send_email(self, code, email):
        subject = "Your Password Reset OTP"
        message = f"Your OTP is {code}. It expires in 15 minutes."
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )


class VerifyOTPView(APIView):
    permission_classes = []  # Allow unauthenticated users

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email_or_phone = serializer.validated_data['email_or_phone']
        code = serializer.validated_data['code']
        
        try:
            otp = OTP.objects.get(
                code=code,
                email_or_phone=email_or_phone,
                is_used=False,
                expires_at__gt=timezone.now()
            )
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp.is_used = True
        otp.save()
        
        # Lookup user based on channel
        if '@' in email_or_phone:
            try:
                user = User.objects.get(email=email_or_phone)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                user = User.objects.get(phone_number=email_or_phone)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        reset_token = generate_password_reset_token(user)
        return Response({
            'reset_token': reset_token,
            'expires_in': 900  # 15 minutes in seconds
        }, status=status.HTTP_200_OK)


class ResetPasswordSerializer(serializers.Serializer):
    reset_token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class ResetPasswordView(APIView):
    permission_classes = []  # Allow unauthenticated access via valid token

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']
        
        # Verify the token and get the user
        try:
            access_token = AccessToken(reset_token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
        except Exception as e:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the user's password
        user.set_password(new_password)
        user.save()
        
        return Response({'status': 'Password updated successfully'}, status=status.HTTP_200_OK)


class LoggedInUserView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Return the user associated with the request (from the access token)
        return self.request.user

class CustomUserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserCreateSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # Print validation errors to the console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class UpdateUserProfileView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # The user to update is the currently authenticated user
        return self.request.user

    def update(self, request, *args, **kwargs):
        # Get the user object and serializer
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)

        # Validate and save the updated user data
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
# class CustomUserRegistrationView(UserViewSet):
#     def create(self, request, *args, **kwargs):
#         serializer = UserCreateSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.save()
        
#         # Customize response to include all fields
#         response_data = {
#             "id": user.id,
#             "username": user.username,
#             "email": user.email,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#             "phone_number": user.phone_number,
#         }
#         return Response(response_data, status=status.HTTP_201_CREATED)



class UserListAPIView(ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class AdminEmployeeViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset to manage vendor (users with role 'vendor').
    This endpoint allows admin/superuser to list, retrieve, and delete vendor users.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrSuperUser]

    def get_queryset(self):
        # Fetch only users that have a vendor role
        return User.objects.filter(role='vendor')

class UpdateCustomerProfile(UpdateAPIView):
    queryset= CustomUser.objects.all()
    serializer_class= UserSerializer
    permission_classes= [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def check_username_exists(request):
    if not request.data.get('username'):
        return Response({'error': 'Bad_request'}, status=status.HTTP_400_BAD_REQUEST)

    username = request.data.get('username')
    try:
        CustomUser.objects.get(username=username)
        return Response({'username_exists': True}, status=status.HTTP_200_OK)

    except CustomUser.DoesNotExist:
        return Response({'username_exists': False}, status=status.HTTP_404_NOT_FOUND)
    
    
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            user = CustomUser.objects.get(username=request.data.get('username'))
            if not user.is_active:
                return Response({'detail': 'Account not activated'}, status=status.HTTP_401_UNAUTHORIZED)
            if user.is_deactivated:
                return Response({'detail': 'Account deactivated'}, status=status.HTTP_401_UNAUTHORIZED)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)

        return super().post(request, *args, **kwargs)
    
        
        
@api_view(['GET'])
@permission_classes([AllowAny])
def CustomUserActivate(request, uid, token):
    """
    Intermediate view to activate a user's email.
    """
    post_url = f"{config('SITE_URL')}/auth/users/activate/"
    post_data = {"uid": uid, "token": token}
    result = requests.post(post_url, data=post_data)

    return Response('Thank you for activating your account you can now go back to the main site')


