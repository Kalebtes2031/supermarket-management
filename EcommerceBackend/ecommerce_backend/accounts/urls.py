from django.urls import path
from .views import UserListAPIView, UpdateCustomerProfile, CustomUserCreateView, UpdateUserProfileView, LoggedInUserView, SendOTPView, VerifyOTPView, ResetPasswordView


urlpatterns = [
    path('users/', UserListAPIView.as_view(), name='user-list'),
    path('user/profile/update/', UpdateUserProfileView.as_view(), name='user-profile-update'),
    path('user/profile/', UpdateCustomerProfile.as_view(), name='user-profile-update'),
    path('register/', CustomUserCreateView.as_view(), name='user-register'),
    path('profile/', LoggedInUserView.as_view(), name='user-profile'),
    path('auth/password-reset/', SendOTPView.as_view(), name='password-reset'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]

