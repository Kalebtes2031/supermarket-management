# delivery/urls.py
from django.urls import path
from .views import VendorUserCreateView, PendingAndPreparedOrdersListAPIView, UpdatePreparedStatusAPIView, AssignOrderToDeliveryAPIView

urlpatterns = [
    path('register/', VendorUserCreateView.as_view(), name='vendor-register'),
    path('orders/pending-prepared/', PendingAndPreparedOrdersListAPIView.as_view(), name='pending-prepared-orders'),
    path('orders/<int:pk>/update-prepared/', UpdatePreparedStatusAPIView.as_view(), name='update-prepared'),
    path('orders/<int:order_id>/assign/', AssignOrderToDeliveryAPIView.as_view(), name='assign_order'),
]