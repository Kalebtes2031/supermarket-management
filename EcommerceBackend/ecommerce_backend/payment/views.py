import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def initialize_payment(request):
    if request.method == 'POST':
        data = request.POST  # or request.body if using JSON
        chapa_url = "https://api.chapa.co/v1/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "amount": data.get("amount"),
            "currency": "ETB",
            "email": data.get("email"),
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "phone":data.get("phone"),
            "tx_ref": data.get("tx_ref"),  # Unique transaction reference
            "callback_url": data.get("callback_url"),  # Frontend URL to redirect after payment
            "return_url": data.get("return_url"),  # Frontend success URL
            "customization[title]": "E-commerce Store",
            "customization[description]": "Payment for products in your cart",
        }
        response = requests.post(chapa_url, json=payload, headers=headers)
        return JsonResponse(response.json())
    return JsonResponse({"error": "Invalid request method"}, status=400)
