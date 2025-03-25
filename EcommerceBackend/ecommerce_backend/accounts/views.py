from rest_framework.generics import ListAPIView, UpdateAPIView
from .models import CustomUser
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import status, generics
from django.shortcuts import render, get_object_or_404, redirect
from rest_framework_simplejwt.views import TokenObtainPairView
from decouple import config
import requests
from djoser.views import UserViewSet
from accounts.serializers import CustomUserCreateSerializer, CustomUserUpdateSerializer


class CustomUserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserCreateSerializer
    permission_classes = [AllowAny]


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


