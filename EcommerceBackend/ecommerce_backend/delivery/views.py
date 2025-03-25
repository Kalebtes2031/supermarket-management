# delivery/views.py
from rest_framework import generics, status
from accounts.models import CustomUser
from .serializers import DeliveryUserCreateSerializer
from orders.models import Order
from orders.serializers import OrderSerializer, OrderItemSerializer
from accounts.permissions import IsDeliveryPerson
import logging
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from delivery.models import AvailableDelivery
from notifications import send_notification

logger = logging.getLogger(__name__)


class DeliveryUserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = DeliveryUserCreateSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.debug("Received registration data: %s", request.data)
        return super().post(request, *args, **kwargs)


class AvailableOrdersList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsDeliveryPerson]

    def get_queryset(self):
        return Order.objects.filter(status='Pending')


class PendingOrdersListAPIView(generics.ListAPIView):
    """
    Returns a list of orders with status "Pending" for delivery personnel.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsDeliveryPerson]

    def get_queryset(self):
        # Filter orders with status 'Pending'
        return Order.objects.filter(status='Pending')


class PendingAndPreparedOrdersListAPIView(generics.ListAPIView):
    """
    Returns a list of orders with status "Pending" for delivery personnel.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsDeliveryPerson]

    def get_queryset(self):
        # Filter orders with status 'Pending'
        return Order.objects.filter(status='Pending', prepared=False)

class UpdatePreparedStatusAPIView(APIView):
    """
    Update the 'prepared' field of an order to True based on the order's ID.
    """
    permission_classes = [IsDeliveryPerson]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            order.prepared = True
            order.save()
            return Response({"message": "Order prepared status updated successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
class previousAcceptOrderAPIView(APIView):
    permission_classes = [IsDeliveryPerson]

    def post(self, request, order_id):
        # Retrieve the order with the given ID
        order = get_object_or_404(Order, id=order_id)
        
        # Ensure that the order status is "Pending"
        if order.status != "Pending":
            return Response(
                {"detail": "Order is not available for assignment."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
         # Check if the delivery user already has a DeliveryProfile.
        try:
            delivery_profile = request.user.delivery_profile
        except AvailableDelivery.DoesNotExist:
            # Create one on the fly if it doesn't exist.
            delivery_profile = AvailableDelivery.objects.create(
                user=request.user, 
                phone_number=request.user.phone_number
            )

        # Update the order status and assign the delivery person correctly
        order.status = "Assigned"
        order.delivery_person = delivery_profile  # Assign to the dedicated field
        order.save()


         # Send notification to the customer if they have an FCM token
        customer = order.user
        if hasattr(customer, 'fcm_token') and customer.fcm_token:
            title = "Track your order"
            body = f"Your order #{order.id} has been accepted for delivery. Check it out"
            data = {"order_id": str(order.id),
                    "delivery_person_id": str(order.delivery_person.user.id),
                    "delivery_person": str(order.delivery_person.user.username),
                    "delivery_phoneNumber": str(order.delivery_person.phone_number)
                    }
            try:
                send_notification(customer.fcm_token, title, body, data)
            except Exception as e:
                # Log the error if notification fails
                print("Error sending notification:", e)
                

        # Build the response with order info and delivery person details
        response_data = {
            "order_id": order.id,
            "order_status": order.status,
            "delivery_person": {
                "username": request.user.username,
                "email": request.user.email,
                "phone_number": request.user.phone_number,
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)

class OrderDetailsView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

    def get(self, request, order_id):
        # Get the order
        order = get_object_or_404(Order, id=order_id, user=request.user)  # Ensure the customer owns this order

        # Serialize order items
        order_items = order.items.all()  # Assuming `items` is the related_name for OrderItem in the Order model
        serialized_items = OrderItemSerializer(order_items, many=True).data

        # Prepare response data
        response_data = {
            "order_id": order.id,
            "order_status": order.status,
            "delivery_person": {
                "username": order.delivery_person.user.username,
                "email": order.delivery_person.user.email,
                "phone_number": order.delivery_person.phone_number,
                "profile_image": order.delivery_person.user.image.url if order.delivery_person.user.image else None,
            } if order.delivery_person else None,
            "items": serialized_items,  # Include serialized order items
        }

        return Response(response_data, status=status.HTTP_200_OK)

class AssignedOrdersListAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsDeliveryPerson]

    def get_queryset(self):
        # Delivery person fetches orders assigned to their profile
        return Order.objects.filter(status='Assigned', delivery_person__user=self.request.user)

class AcceptOrderAPIView(APIView):
    permission_classes = [IsDeliveryPerson]

    def post(self, request, order_id):
        # Retrieve the order with the given ID
        order = get_object_or_404(Order, id=order_id)
        
        # Ensure that the order status is "Assigned"
        if order.status != "Assigned":
            return Response(
                {"detail": "Order is not available for acceptance."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the delivery person already has a DeliveryProfile.
        try:
            delivery_profile = request.user.delivery_profile
        except AvailableDelivery.DoesNotExist:
            # Create one on the fly if it doesn't exist.
            delivery_profile = AvailableDelivery.objects.create(
                user=request.user, 
                phone_number=request.user.phone_number
            )

        # Ensure that the order is actually assigned to this delivery person
        if order.delivery_person != delivery_profile:
            return Response(
                {"detail": "This order is not assigned to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update the order status to "Accepted" (or another appropriate status)
        order.status = "Accepted"
        order.save()

        # Send notification to the customer if they have an FCM token
        customer = order.user
        if hasattr(customer, 'fcm_token') and customer.fcm_token:
            title = "Your order is on the way!"
            body = f"Delivery person {delivery_profile.user.username} has accepted your order #{order.id}."
            data = {
                "order_id": str(order.id),
                "delivery_person_id": str(delivery_profile.user.id),
                "delivery_person": str(delivery_profile.user.username),
                "delivery_phoneNumber": str(delivery_profile.phone_number)
            }
            try:
                send_notification(customer.fcm_token, title, body, data)
            except Exception as e:
                # Log the error if notification fails
                print("Error sending notification:", e)

        # Build the response with order info and delivery person details
        response_data = {
            "order_id": order.id,
            "order_status": order.status,
            "delivery_person": {
                "username": delivery_profile.user.username,
                "email": delivery_profile.user.email,
                "phone_number": delivery_profile.phone_number,
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)
