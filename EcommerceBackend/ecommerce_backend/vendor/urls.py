# vendor/urls.py
from django.urls import path
from .views import (
    VendorUserCreateView, 
    PendingAndPreparedOrdersListAPIView, 
    UpdatePreparedStatusAPIView, 
    AssignOrderToDeliveryAPIView, 
    UpdatePaymentStatusAPIView, 
    OnDeliveryPaymentOrdersListAPIView,
    UpdateOrderStatusToConfirmAPIView,
    UpdateOrderStatusToOutDeliveryAPIView
    )

urlpatterns = [
    path('register/', VendorUserCreateView.as_view(), name='vendor-register'),
    path('orders/pending-prepared/', PendingAndPreparedOrdersListAPIView.as_view(), name='pending-prepared-orders'),
    path('orders/on-delivery-payment/', OnDeliveryPaymentOrdersListAPIView.as_view(), name='on-delivery-orders'),
    path('orders/<int:pk>/update-prepared/', UpdatePreparedStatusAPIView.as_view(), name='update-prepared'),
    path('orders/<int:pk>/update-confirmed/', UpdateOrderStatusToConfirmAPIView.as_view(), name='update-confirmed'),
    path('orders/<int:pk>/update-out-delivery/', UpdateOrderStatusToOutDeliveryAPIView.as_view(), name='update-out-delivery'),
    path('orders/<int:order_id>/assign/', AssignOrderToDeliveryAPIView.as_view(), name='assign_order'),
    path('orders/<int:pk>/update-payment/', UpdatePaymentStatusAPIView.as_view(), name='update-payment'),
]