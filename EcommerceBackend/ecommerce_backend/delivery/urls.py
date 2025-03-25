# delivery/urls.py
from django.urls import path
from .views import DeliveryUserCreateView, PendingOrdersListAPIView, AcceptOrderAPIView, OrderDetailsView, PendingAndPreparedOrdersListAPIView, UpdatePreparedStatusAPIView, AssignedOrdersListAPIView

urlpatterns = [
    path('register/', DeliveryUserCreateView.as_view(), name='delivery-register'),
    path('orders/pending/', PendingOrdersListAPIView.as_view(), name='pending-orders'),
    path('orders/assigned/', AssignedOrdersListAPIView.as_view(), name='assigned-orders'),
    path('orders/<int:order_id>/accept/', AcceptOrderAPIView.as_view(), name='accept-order'),
    path('orders/<int:order_id>/details/', OrderDetailsView.as_view(), name='order-details'),
    path('orders/pending-prepared/', PendingAndPreparedOrdersListAPIView.as_view(), name='pending-prepared-orders'),
    path('orders/<int:pk>/update-prepared/', UpdatePreparedStatusAPIView.as_view(), name='update-prepared'),

]
