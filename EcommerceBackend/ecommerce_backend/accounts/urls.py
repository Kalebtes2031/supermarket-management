from django.urls import path
from .views import UserListAPIView, UpdateCustomerProfile, CustomUserCreateView, UpdateUserProfileView

urlpatterns = [
    path('users/', UserListAPIView.as_view(), name='user-list'),
    path('user/profile/update/', UpdateUserProfileView.as_view(), name='user-profile-update'),
    path('user/profile/', UpdateCustomerProfile.as_view(), name='user-profile-update'),
    path('register/', CustomUserCreateView.as_view(), name='user-register'),

]
