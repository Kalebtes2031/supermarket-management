# views.py or a new utils file
from django.utils import timezone
from datetime import timedelta
from .models import Payment

def cleanup_incomplete_transactions():
    # Define the expiration time for incomplete transactions (e.g., 24 hours)
    expiration_time = timedelta(hours=24)
    now = timezone.now()
    expired_time = now - expiration_time

    # Find transactions that are 'Pending' and older than the expiration time
    incomplete_transactions = Payment.objects.filter(status="Pending", created_at__lt=expired_time)

    if incomplete_transactions.exists():
        # Delete the incomplete transactions
        incomplete_transactions.delete()
        print(f"Removed {incomplete_transactions.count()} incomplete transactions.")
    else:
        print("No incomplete transactions found.")
