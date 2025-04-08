"""
URL configuration for ecommerce_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from accounts.views import CustomTokenObtainPairView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
# from vendor.admin import vendor_admin_site
# router = DefaultRouter()
# router.register('auth/users', CustomUserRegistrationView, basename='user')

urlpatterns = [
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/jwt/create/',CustomTokenObtainPairView.as_view(),name='custom_jwt_create'),
    path('admin/', admin.site.urls),
    path('api/', include('shop.urls')),
    path('account/', include('accounts.urls')),
    path('pay/', include('orders.urls')),
    path('payment/', include('payment.urls')),
    path('delivery/', include('delivery.urls')),
    path('vendor/', include('vendor.urls')),
    # path('vendor-admin/', include((vendor_admin_site.urls, 'vendor_admin'), namespace='vendor_admin')),
    path('notification/', include('notification.urls')), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


