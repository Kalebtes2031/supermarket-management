# vendor/views.py
from rest_framework import generics, status
from accounts.models import CustomUser
from .serializers import VendorUserCreateSerializer
from orders.models import Order
from orders.serializers import OrderSerializer, OrderItemSerializer
from accounts.permissions import IsVendorPerson, IsAdminOrSuperUser, IsVendorOrAdminOrSuperUser
import logging
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from delivery.models import AvailableDelivery
from notifications import send_notification
from django.utils import timezone
from datetime import timedelta



logger = logging.getLogger(__name__)


class VendorUserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = VendorUserCreateSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.debug("Received registration data: %s", request.data)
        return super().post(request, *args, **kwargs)

class PendingAndPreparedOrdersListAPIView(generics.ListAPIView):
    """
    Returns a list of orders with status "Pending", not prepared,
    and fully paid. Vendors can filter these orders by scheduled delivery date.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsVendorOrAdminOrSuperUser]

    def get_queryset(self):
        queryset = Order.objects.filter(
            status='Pending', 
            prepared=False, 
            # payment_status='Fully Paid'
        )
        
        # Get the schedule filter from query params (e.g., "today", "tomorrow", "this_week")
        schedule_filter = self.request.query_params.get("schedule", None)
        now = timezone.now()
        
        if schedule_filter:
            if schedule_filter.lower() == "today":
                start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end = start + timedelta(days=1)
                queryset = queryset.filter(scheduled_delivery__range=(start, end))
            elif schedule_filter.lower() == "tomorrow":
                start = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
                end = start + timedelta(days=1)
                queryset = queryset.filter(scheduled_delivery__range=(start, end))
            elif schedule_filter.lower() == "this_week":
                # Assuming week starts on Monday
                start = now - timedelta(days=now.weekday())
                start = start.replace(hour=0, minute=0, second=0, microsecond=0)
                end = start + timedelta(days=7)
                queryset = queryset.filter(scheduled_delivery__range=(start, end))
            # You can add additional filters as needed

        return queryset

class OnDeliveryPaymentOrdersListAPIView(generics.ListAPIView):
    """
    Returns a list of orders with payment status "On Delivery".
    """
    serializer_class = OrderSerializer
    permission_classes = [IsVendorPerson]

    def get_queryset(self):
        queryset = Order.objects.filter(
            payment_status='On Delivery'
        )
        return queryset
    

class UpdatePreparedStatusAPIView(APIView):
    """
    Update the 'prepared' field of an order to True based on the order's ID.
    """
    permission_classes = [IsVendorOrAdminOrSuperUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            order.prepared = True
            order.save()
            return Response({"message": "Order prepared status updated successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
class UpdateOrderStatusToConfirmAPIView(APIView):
    """
    Update the 'status' field of an order to Confirmed based on the order's ID.
    """
    permission_classes = [IsVendorOrAdminOrSuperUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            order.status = "Confirmed"
            order.save()
            return Response({"message": "Order status updated successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
class UpdateOrderStatusToOutDeliveryAPIView(APIView):
    """
    Update the 'status' field of an order to Confirmed based on the order's ID.
    """
    permission_classes = [IsVendorOrAdminOrSuperUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            order.status = "In Transit"
            order.save()
            return Response({"message": "Order status updated successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdatePaymentStatusAPIView(APIView):
    """
    Update the 'prepared' field of an order to True based on the order's ID.
    """
    permission_classes = [IsVendorPerson]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            order.payment_status = "Fully Paid"
            order.save()
            return Response({"message": "Order prepared status updated successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

class AssignOrderToDeliveryAPIView(APIView):
    permission_classes = [IsVendorOrAdminOrSuperUser]

    def post(self, request, order_id):
        delivery_person_id = request.data.get("delivery_person_id")
        if not delivery_person_id:
            return Response({"error": "Delivery person id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Ensure order is confirmed and prepared
            order = Order.objects.get(id=order_id, status='Confirmed', prepared=True)
        except Order.DoesNotExist:
            return Response({"error": "Order not available for assignment"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            delivery_profile = AvailableDelivery.objects.get(user__id=delivery_person_id)
        except AvailableDelivery.DoesNotExist:
            return Response({"error": "Delivery person not found"}, status=status.HTTP_404_NOT_FOUND)
        
        order.status = "Assigned"
        order.delivery_person = delivery_profile
        order.save()
        
        # Serialize order data (assumes you have a serializer or can build a dict)
        updated_order_data = {
        "id": order.id,
        "status": order.status,
        "delivery_person": {
            "user": {
                "id": delivery_profile.user.id,
                "first_name": delivery_profile.user.first_name,
                "last_name": delivery_profile.user.last_name,
                "phone_number": delivery_profile.user.phone_number,
                # Add other fields as needed
            },
        },
    }

        
        return Response(
            {"message": "Order assigned to delivery person successfully", "order": updated_order_data},
            status=status.HTTP_200_OK
        )


# class PendingAndPreparedOrdersListAPIView(generics.ListAPIView):
#     """
#     Returns a list of orders with status "Pending" for delivery personnel.
#     """
#     serializer_class = OrderSerializer
#     permission_classes = [IsVendorPerson]

#     def get_queryset(self):
#         # Filter orders with status 'Pending'
#         return Order.objects.filter(status='Pending', prepared=False, payment_status='Fully Paid')
