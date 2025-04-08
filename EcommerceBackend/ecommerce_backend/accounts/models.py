# accounts/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

ROLE_CHOICES = (
    ('customer', 'Customer'),
    ('vendor', 'Vendor'),
    ('delivery', 'Delivery'), 
)

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    image = models.ImageField(upload_to='profileImage/', blank=True, null=True)
    is_active = models.BooleanField(default=False)
    is_deactivated = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    fcm_token = models.CharField(max_length=255, blank=True, null=True)

    # Use the custom manager
    objects = CustomUserManager()

    def __str__(self):
        return self.username
    
# class CustomUser(AbstractUser):
#     email = models.EmailField(unique=True)
#     phone_number = models.CharField(max_length=20, blank=True, null=True) 
#     is_active = models.BooleanField(default=False)
#     is_deactivated = models.BooleanField(default=False)
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
#     fcm_token = models.CharField(max_length=255, blank=True, null=True)
    
#     def __str__(self):
#         return self.username


class OTP(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    email_or_phone = models.CharField(max_length=255)  # To store the recipient
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    channel = models.CharField(max_length=10)  # sms/email
    
    def __str__(self):
        return f"OTP {self.code} for {self.email_or_phone}"
    