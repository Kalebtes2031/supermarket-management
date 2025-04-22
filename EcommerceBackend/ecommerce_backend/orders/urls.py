# orders/urls.py
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
     path('', include(router.urls)),
    path('orders/<int:order_id>/schedule-delivery-pick-from-store/', views.ScheduleDeliveryAndPickFromStoreAPIView.as_view(), name='schedule_delivery_and_pick_from_store'),
    path('orders/<int:order_id>/schedule-delivery/', views.ScheduleDeliveryAPIView.as_view(), name='schedule_delivery'),
    path('orders/<int:order_id>/confirm-delivery/', views.ConfirmDeliveryAPIView.as_view(), name='confirm_delivery'),
    path('update-payment-status/', views.update_payment_status, name='update_payment_status'),
    path('order/<int:order_id>/status', views.order_status, name='order_status'),
    path('cleanup-incomplete-transactions/', views.CleanupIncompleteTransactionsView.as_view(), name='cleanup_incomplete_transactions'),
    path("payment/initiate", views.InitiatePaymentView.as_view(), name="initiate-payment"),
    path("payment/callback", views.PaymentCallbackView.as_view(), name="payment-callback"),
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/all/', views.AllOrderListView.as_view(), name='all-order-list'),
    path('orders/status/count/', views.order_status_counts, name='count-all-order-status'),
    path('orders/status/pending/', views.PendingOrdersListView.as_view(), name='all-pending-order-status'),
    path('orders/status/confirmed/', views.ConfirmedOrdersListView.as_view(), name='all-confirmed-order-status'),
    path('orders/status/prepared/', views.PreparedOrdersListView.as_view(), name='all-prepared-order-status'),
    path('orders/status/accepted/', views.AcceptedOrdersListView.as_view(), name='all-accepted-order-status'),
    path('orders/status/out-delivery/', views.OutDeliveryOrdersListView.as_view(), name='all-out-delivery-order-status'),
    path('orders/status/delivered/', views.DeliveredOrdersListView.as_view(), name='all-delivered-order-status'),
    path('orders/status/cancelled/', views.CancelledOrdersListView.as_view(), name='all-cancelled-order-status'),
    path('orders/need-delivery/', views.DeliveryOrderListView.as_view(), name='orders-need-delivery'),
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
