# orders/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('orders/<int:order_id>/schedule-delivery/', views.ScheduleDeliveryAPIView.as_view(), name='schedule_delivery'),
    path('orders/<int:order_id>/confirm-delivery/', views.ConfirmDeliveryAPIView.as_view(), name='confirm_delivery'),
    path('update-payment-status/', views.update_payment_status, name='update_payment_status'),
    path('order/<int:order_id>/status', views.order_status, name='order_status'),
    path('cleanup-incomplete-transactions/', views.CleanupIncompleteTransactionsView.as_view(), name='cleanup_incomplete_transactions'),
    path("payment/initiate", views.InitiatePaymentView.as_view(), name="initiate-payment"),
    path("payment/callback", views.PaymentCallbackView.as_view(), name="payment-callback"),
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('payment-history/', views.PaymentListView.as_view(), name='payment-list'),
    path('payment-history/<int:order_id>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('orders/create/', views.OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    # path('orders/<int:pk>/update/', views.OrderStatusUpdateView.as_view(), name='order-update-status'),
    path('orders/<int:pk>/cancel/', views.OrderCancelView.as_view(), name='order-cancel'),
    path('order-history/', views.OrderHistoryView.as_view(), name='order-history'),
    # path('create-order/', views.CreateOrderView.as_view(), name='create-order'),
    path('initiate-payment/', views.InitiatePaymentView.as_view(), name='initiate-payment'),
    # path('verify-payment/', views.VerifyPaymentView.as_view(), name='verify-payment'),
]
