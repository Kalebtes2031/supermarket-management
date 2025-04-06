# orders/views.py
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from .models import Order, OrderItem, Payment
from shop.models import Cart, Product, ProductVariation
from .serializers import OrderSerializer, PaymentSerializer, ScheduleDeliverySerializer
from chapa import Chapa
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.shortcuts import get_object_or_404
import requests
import logging
import uuid
from django.http import JsonResponse
from django.views import View
from .utils import cleanup_incomplete_transactions  # Import the cleanup function
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status as http_status
from requests.exceptions import RequestException, Timeout
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from notifications import send_notification  # your custom notification function



class ScheduleDeliveryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        # Retrieve the order and ensure it belongs to the authenticated user
        order = get_object_or_404(Order, id=order_id)
        if request.user != order.user:
            return Response({"detail": "Not authorized to schedule this order."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ScheduleDeliverySerializer(data=request.data)
        if serializer.is_valid():
            order.scheduled_delivery = serializer.validated_data['scheduled_delivery']
            order.save()
            return Response({"detail": "Delivery scheduled successfully.", "scheduled_delivery": order.scheduled_delivery},
                            status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class ScheduleDeliveryAndPickFromStoreAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        # Retrieve the order and ensure it belongs to the authenticated user
        order = get_object_or_404(Order, id=order_id)
        if request.user != order.user:
            return Response({"detail": "Not authorized to schedule this order."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ScheduleDeliverySerializer(data=request.data)
        if serializer.is_valid():
            order.scheduled_delivery = serializer.validated_data['scheduled_delivery']
            order.need_delivery = False
            order.save()
            return Response({"detail": "Delivery scheduled and need delivery changed successfully.", "scheduled_delivery": order.scheduled_delivery},
                            status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class ConfirmDeliveryAPIView(APIView):
    """
    Endpoint for customers to confirm that their delivered order has been received.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        # Retrieve the order using order_id
        order = get_object_or_404(Order, id=order_id)

        # Ensure that the logged in user is the customer who placed the order.
        if request.user != order.user:
            return Response({"detail": "You are not authorized to confirm this order."},
                            status=status.HTTP_403_FORBIDDEN)

        # Check if the order has already been confirmed/delivered.
        if order.status == "Delivered":
            return Response({"detail": "Order has already been confirmed as delivered."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Update the order status to 'Delivered'
        order.status = "Delivered"
        order.payment_status = "On Delivery"
        order.save()

        # Optional: Send notification to the delivery person indicating the delivery is confirmed.
        if order.delivery_person and hasattr(order.delivery_person.user, 'fcm_token') and order.delivery_person.user.fcm_token:
            title = "Delivery Confirmed"
            body = f"Customer has confirmed receipt of order #{order.id}."
            data = {"order_id": str(order.id)}
            try:
                send_notification(order.delivery_person.user.fcm_token, title, body, data)
            except Exception as e:
                print("Error sending notification to delivery person:", e)

        return Response({"detail": "Delivery confirmed successfully."},
                        status=status.HTTP_200_OK)


@api_view(['GET'])
def order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    return Response({
        "order_id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "payment_status": order.payment_status
    })


class CleanupIncompleteTransactionsView(View):
    def get(self, request, *args, **kwargs):
        # Run the cleanup function
        cleanup_incomplete_transactions()
        return JsonResponse({"message": "Cleanup completed."})


CHAPA_BASE_URL = "https://api.chapa.co/v1/transaction/initialize"
CHAPA_SECRET_KEY = "CHASECK_TEST-tZ38AXvfd2wh74xrnUrmiwf9risCD6tx"  # Replace with your Chapa secret key


# Configure logging
logger = logging.getLogger(__name__)

def validate_file_extension(file):
    allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
    extension = file.name.split('.')[-1].lower()
    if extension not in allowed_extensions:
        raise ValidationError(f"Unsupported file extension. Allowed types: {', '.join(allowed_extensions)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_payment_status(request):
    try:
        # Extract data from request
        order_id = request.data.get("orderId")
        amount_to_pay = Decimal(request.data.get("amountToPay"))
        payment_status = request.data.get("paymentStatus")
        # transaction_id= request.data.get("transaction_id")
        bank_name = request.data.get("bankName")
        receipt = request.FILES.get("receipt")

        # Check if transaction_id already exists
        # if Payment.objects.filter(transaction_id=transaction_id).exists():
        #     return Response(
        #         {"error": "Transaction ID already exists. Please check your details."},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )
        
        # Validate the uploaded file's extension
        if receipt:
            validate_file_extension(receipt)
            
        # Fetch the order
        order = Order.objects.get(id=order_id)

        # Create or get the payment entry (you might want to check for duplicate transactions)
        Payment.objects.create(
            user=request.user,  
            order=order,
            # transaction_id=transaction_id,  
            amount=amount_to_pay,
            status="Success",  # assuming the payment is successful
            bank_name = bank_name,
            receipt= receipt
            
        )

        # Now update the order based on payment status
        print(f"paymentType is : {payment_status},and payment status is: {order.payment_status}")

        # Update total paid based on the payment type 
        order.total_payment += amount_to_pay
        order.payment_status = "Fully Paid"
        order.save()

        # Return success response
        return Response({"message": "Payment status updated successfully."}, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        error_msg = "Order not found."
        print(error_msg)  # or use logging.error(error_msg)
        return Response({"error": error_msg}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Log the error for debugging
        print("Error in update_payment_status:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class InitiatePaymentView(APIView):
    """
    Initiates a payment request with Chapa and returns the payment URL.
    """
    def post(self, request, *args, **kwargs):
        print('recieved data,', request.data)
        order_id = int(request.data.get("orderId"))
        total_amount = float(request.data.get("amountToPay"))
        payment_type = request.data.get("paymentStatus")
        first_name = request.data.get("firstName")
        last_name = request.data.get("lastName")
        email = request.data.get("email")
        phone = request.data.get("phone")

        logger.info(f"Received payment initiation request: OrderID={order_id}, TotalAmount={total_amount}, User={request.user.username}")

        # Validate and fetch the order
        order = get_object_or_404(Order, id=order_id, user=request.user)

        # Generate a unique transaction reference using UUID
        def generate_unique_tx_ref(order_id, payment_type):
            return f"order-{order_id}-{payment_type}-{str(uuid.uuid4())}"

        
        if payment_type in ["Pending", "full_payment"]:
            amount = total_amount
        elif payment_type == "advance":
            order.calculate_advance_payment()
            order.calculate_remaining_payment()
            order.save()
            amount = order.advance_payment
        elif payment_type == "remaining":
            if order.payment_status != "Partial Payment":
                return Response(
                    {"message": "Remaining payment is not required for this order."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            order.calculate_advance_payment()
            order.calculate_remaining_payment()
            order.save()
            amount = order.remaining_payment
        else:
            return Response(
                {"message": "Invalid payment type."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Prepare Chapa request payload
        payload = {
            "amount": float(amount),
            "currency": "ETB",
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "phone_number": phone,
            "payment_type": payment_type,
            "tx_ref": generate_unique_tx_ref(order.id, payment_type),
            "callback_url": request.build_absolute_uri("/pay/payment/callback"),
            "return_url":"http://localhost:5173",
            # "return_url":"",
            "customization": {
                "title": "Order Payment",
                "description":  "Payment for order",
            },
        }

        logger.info(f"Sending payment request to Chapa: {payload}")

        # Make a request to Chapa
        headers = {"Authorization": f"Bearer {CHAPA_SECRET_KEY}"}
        try:
            chapa_response = requests.post(CHAPA_BASE_URL, json=payload, headers=headers)
            chapa_response.raise_for_status()  # Raise an error for bad responses
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to Chapa: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Chapa response error details: {e.response.text}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


        logger.info(f"Chapa response status: {chapa_response.status_code}")

        if chapa_response.status_code == 200:
            chapa_data = chapa_response.json()
            checkout_url = chapa_data.get("data", {}).get("checkout_url")

            # Create a Payment record
            Payment.objects.create(
                user=request.user,
                order=order,
                transaction_id=payload["tx_ref"],
                amount=amount,
                status="Pending",
            )

            logger.info(f"Payment initiated successfully. Redirect URL: {checkout_url}")
            return Response({"payment_url": checkout_url}, status=status.HTTP_200_OK)
        else:
            logger.error(f"Chapa API Error: {chapa_response.status_code}, {chapa_response.json()}")
            return Response({"error": chapa_response.json()}, status=status.HTTP_400_BAD_REQUEST)

class PaymentCallbackView(APIView):
    authentication_classes = []  # Disable authentication for the callback
    permission_classes = []  # Allow public access to this endpoint

    def get(self, request, *args, **kwargs):
        tx_ref = request.query_params.get("trx_ref")
        status = request.query_params.get("status")
        tx_ref_parts = tx_ref.split('-')
        if len(tx_ref_parts) < 3:
            return Response({"message": "Invalid transaction reference."}, status=http_status.HTTP_400_BAD_REQUEST)

        payment_type = tx_ref_parts[2]
        # Log callback data for debugging
        print(f"Callback received: tx_ref={tx_ref}, status={status}")

        if not tx_ref or not status:
            return Response({"message": "Invalid callback data."}, status=http_status.HTTP_400_BAD_REQUEST)

        # Fetch the payment record using tx_ref
        payment = get_object_or_404(Payment, transaction_id=tx_ref)

        # Verify the transaction with Chapa API
        verification_url = f"https://api.chapa.co/v1/transaction/verify/{tx_ref}"
        headers = {
            "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"
        }

        try:
            response = requests.get(verification_url, headers=headers, timeout=10)  # Set a timeout of 10 seconds
            response.raise_for_status()  # Raise an exception for HTTP errors

            # Parse the response
            transaction_data = response.json()

            # Check if the transaction is valid and successful
            if transaction_data["status"] == "success" and transaction_data["data"]["status"] == "success":
                # Update payment status
                payment.status = "Success"
                payment.save()

                #update order 
                order = payment.order
                amount_paid = payment.amount
                
                print(f"paymentType is : {payment_type}, and payment status is: {order.payment_status}")
                 
                 # Update total paid
                if payment_type == "full_payment":
                    order.total_payment += amount_paid
                    order.payment_status = "Fully Paid"
                elif payment_type == "Pending":
                    order.total_payment += amount_paid
                    # Determine payment status
                    if order.total_payment == order.total:
                        order.payment_status = "Fully Paid"
                    else:    
                        order.calculate_advance_payment()
                        order.calculate_remaining_payment()
                        order.save()
                        if order.total_payment == order.advance_payment:
                            order.payment_status = "Partial Payment"
                        
                elif payment_type == "advance":
                    order.calculate_advance_payment()
                    order.calculate_remaining_payment()
                    order.save()
                    order.total_payment = order.advance_payment
                    order.payment_status = "Partial Payment"
                elif payment_type == "remaining":
                    order.calculate_advance_payment()
                    order.calculate_remaining_payment()
                    order.save()
                    order.total_payment += order.remaining_payment
                    order.payment_status = "Fully Paid"
                    # order.remaining_payment = Decimal(0)
                    
                order.save()

                return Response({"message": "Payment verified and processed successfully."}, status=http_status.HTTP_200_OK)
            else:
                # Mark payment as failed
                payment.status = "Failed"
                payment.save()

                return Response({"message": "Payment verification failed."}, status=http_status.HTTP_400_BAD_REQUEST)

        except Timeout:
            # Handle timeout explicitly
            print("Verification request timed out.")
            return Response({"message": "Payment verification timed out. Please try again."},
                            status=http_status.HTTP_504_GATEWAY_TIMEOUT)
        except RequestException as e:
            # Handle other request-related exceptions
            print(f"Error during Chapa verification: {e}")
            return Response({"message": "Payment verification failed due to a network error."},
                            status=http_status.HTTP_503_SERVICE_UNAVAILABLE)



class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
# class CreateOrderView(generics.CreateAPIView):
#     permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
#     serializer_class = OrderSerializer

#     def post(self, request, *args, **kwargs):
#         user = request.user

#         # Get the cart for the user
#         try:
#             cart = Cart.objects.get(user=user)
#         except Cart.DoesNotExist:
#             return Response({'error': 'No cart found for the user'}, status=404)

#         # Check if cart has items
#         if not cart.items.exists():
#             return Response({'error': 'Your cart is empty. Please add items to the cart before placing an order.'}, status=400)

#         # Get the items from the cart and create order items from them
#         order_items = []
#         for cart_item in cart.items.all():
#             product = cart_item.product
#             quantity = cart_item.quantity
#             price = product.price

#             # Create order item from the cart's product and quantity
#             order_item = OrderItem(order=None, product=product, quantity=quantity, price=price)
#             order_items.append(order_item)

#         # Create the order and associate with the user
#         order = Order.objects.create(user=user)

#         # Bulk create order items (link them to the created order)
#         for order_item in order_items:
#             order_item.order = order

#         OrderItem.objects.bulk_create(order_items)

#         # Calculate and save the total price for the order
#         order.calculate_total()
#         order.save()

#         # Clear the user's cart after creating the order
#         cart.items.all().delete()

#         # Return the created order's details
#         return Response(OrderSerializer(order).data, status=201)

# class InitiatePaymentView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         order_id = request.data.get('order_id')
#         amount = request.data.get('amount')

#         try:
#             order = Order.objects.get(id=order_id, user=request.user)
#         except Order.DoesNotExist:
#             return Response({'error': 'Order not found'}, status=404)

#         if amount > order.remaining_payment:
#             return Response({'error': 'Amount exceeds remaining payment'}, status=400)

#         chapa = Chapa(settings.CHAPA_SECRET_KEY)
#         payment_data = {
#             'amount': amount,
#             'email': request.user.email,
#             'tx_ref': f"order-{order.id}",
#             'return_url': "http://localhost:5173/verify-payment",
#             'first_name': request.user.first_name,
#             'last_name': request.user.last_name,
#         }
#         response = chapa.initialize(payment_data)

#         if response['status'] != 'success':
#             return Response({'error': 'Failed to initiate payment'}, status=400)

#         Payment.objects.create(
#             order=order,
#             user=request.user,
#             transaction_id=response['data']['tx_ref'],
#             amount=amount,
#             status='Pending'
#         )

#         return Response({'checkout_url': response['data']['checkout_url']})


# class VerifyPaymentView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         tx_ref = request.data.get('tx_ref')

#         chapa = Chapa(settings.CHAPA_SECRET_KEY)
#         response = chapa.verify(tx_ref)

#         if response['status'] == 'success':
#             try:
#                 payment = Payment.objects.get(transaction_id=tx_ref)
#             except Payment.DoesNotExist:
#                 return Response({'error': 'Payment record not found'}, status=404)

#             payment.status = 'Success'
#             payment.save()

#             return Response({'message': 'Payment verified successfully'})

#         return Response({'error': 'Payment verification failed'}, status=400)


class OrderCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    
    def get_serializer_context(self):
        # Pass the current user to the serializer context
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        user = self.request.user

        # Ensure the user has a cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise NotFound("No cart found for the user.")

        # Ensure the cart is not empty
        if not cart.items.exists():
            raise PermissionDenied("Cannot create an order from an empty cart.")

        # Create the order
        order = serializer.save(
            user=user,
            phone_number=self.request.data.get("phone_number"),
            first_name=self.request.data.get("first_name"),
            last_name=self.request.data.get("last_name"),
            email=self.request.data.get("email")
        )

        # Add cart items to the order
        order_items = []
        for cart_item in cart.items.all():
            
            order_items.append(OrderItem(
                order=order,
                variations=cart_item.variations,
                quantity=cart_item.quantity,
                price=cart_item.variations.price
            ))

        # Bulk create order items
        OrderItem.objects.bulk_create(order_items)

        # Calculate and save the total price
        order.calculate_total()
        # order.calculate_advance_payment()
        # order.calculate_remaining_payment()
        order.save()

        # Clear the user's cart
        cart.items.all().delete()


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class DeliveryOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user, need_delivery=True)


class PaymentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    serializer_class = PaymentSerializer

    def get_queryset(self):
        # Return payments of the authenticated user
        return Payment.objects.filter(user=self.request.user)

class PaymentDetailView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        order_id = self.kwargs.get('order_id')
        try:
            return Payment.objects.filter(user=user, order__id=order_id)
        except Payment.DoesNotExist:
            raise NotFound(detail="Payment not found for the specified order ID.")
        
    
class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# class OrderListView(generics.ListAPIView):
#     serializer_class = OrderSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         return Order.objects.filter(user=self.request.user)

# class OrderDetailView(generics.RetrieveAPIView):
#     serializer_class = OrderSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     queryset = Order.objects.all()

#     def get_queryset(self):
#         return Order.objects.filter(user=self.request.user)

class OrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Order.objects.all()

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        status = request.data.get('status')
        if status:
            order.status = status
            order.save()
            return Response({"status": "updated"})
        return Response({"status": "invalid status"}, status=400)

class OrderCancelView(generics.DestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()

    def get_object(self):
        """
        Overriding get_object to ensure that only the order belonging to the authenticated user is deleted.
        """
        obj = super().get_object()  # Fetches the order using pk from the URL.
        if obj.user != self.request.user:  # Ensure the order belongs to the authenticated user.
            raise PermissionDenied("You do not have permission to delete this order.")
        return obj
    
# View for handling payment
class PaymentCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    def perform_create(self, serializer):
        order = serializer.validated_data['order']
        payment = serializer.save()

        if payment.status == 'Success':
            order.payment_status = 'Paid' if order.remaining_payment <= 0 else 'Partial Payment'
            order.save()

        return Response(self.get_serializer(payment).data)