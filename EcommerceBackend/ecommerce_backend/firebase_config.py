import firebase_admin
from firebase_admin import credentials

# Use an environment variable or hard-code the path (not recommended for production)
SERVICE_ACCOUNT_PATH = r'C:\Users\Hp\OneDrive\Desktop\YasonBackend\EcommerceBackend\ecommerce_backend\serviceAccountKey.json'

# Create a credential object using the service account key
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

print("Firebase Admin initialized successfully.")
