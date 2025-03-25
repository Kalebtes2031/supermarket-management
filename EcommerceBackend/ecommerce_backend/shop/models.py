from django.db import models
from django.utils.text import slugify
from django.conf import settings
from decimal import Decimal


class Size(models.Model):
    name = models.CharField(max_length=10)
    
    def __str__(self):
        return self.name
    
class Style(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
    
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, blank=True, null=True)
    name_amh = models.CharField(max_length=100, unique=True, blank=True, null=True)

    def __str__(self):
       
        return self.name or "Unnamed Category"

class Product(models.Model):
    item_name = models.CharField(max_length=255, blank=True, null=True) 
    item_name_amh = models.CharField(max_length=255, blank=True, null=True)  
    # price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    # in_stock = models.BooleanField(default=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_full = models.ImageField(upload_to='products/', blank=True, null=True)
    image_left = models.ImageField(upload_to='products/', blank=True, null=True)
    image_right = models.ImageField(upload_to='products/', blank=True, null=True)
    image_back = models.ImageField(upload_to='products/', blank=True, null=True)
    popularity = models.PositiveIntegerField(default=0)
    # description = models.TextField(blank=True, null=True)
    
    @property
    def price_in_dollar(self):
        """
        Calculate price in dollars using the global exchange rate.
        """
        rate = Decimal(ExchangeRate.get_current_rate())  # Ensure rate is a Decimal
        if rate > 0:
            return round(self.price / rate, 2)
        return Decimal('0.00')  # Return Decimal for consistency
    # popularity = models.IntegerField(default=0)  # New field to track product popularity

    # def update_popularity(self):
    #     self.popularity = OrderItem.objects.filter(product=self).aggregate(Sum('quantity'))['quantity__sum'] or 0
    #     self.save()
    
    def __str__(self):
        return self.item_name or "Unnamed Category"

class ProductVariation(models.Model):
    UNIT_CHOICES = [
        ('L', 'Liter'),
        ('ml', 'Milliliter'),
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
    ]
    
    variations = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variations")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=5, choices=UNIT_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)

    # def price_in_dollar(self):
    #     rate = Decimal(ExchangeRate.get_current_rate())
    #     if rate > 0:
    #         return round(self.price / rate, 2)
    #     return Decimal('0.00')

    def __str__(self):
        return f"{self.variations.item_name} - {self.quantity}{self.unit}"


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    variations = models.ForeignKey(ProductVariation, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def get_total_price(self):
        return self.variations.price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.variations.item_name}"

class TraditionalDressingImage(models.Model):
    traditional_dressing = models.ImageField(upload_to='homepageImage/Traditional_Dressing/')

    def __str__(self):
        return f"Traditional Dressing Image {self.id}"


class ExploreFamilyImage(models.Model):
    explore_family = models.ImageField(upload_to='homepageImage/Explore_Family/')

    def __str__(self):
        return f"Explore Family Image {self.id}"


class EventImage(models.Model):
    event_image = models.ImageField(upload_to='homepageImage/Event/')

    def __str__(self):
        return f"Event Image {self.id}"


class DiscoverEthiopianImage(models.Model):
    discover_ethiopia = models.ImageField(upload_to='homepageImage/Discover_Ethiopian/')

    def __str__(self):
        return f"Discover Ethiopian Image {self.id}"


class ExchangeRate(models.Model):

    rate = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)  # Exchange rate: birr to dollar

    def __str__(self):
        return f"Current Exchange Rate: {self.rate}"

    class Meta:
        verbose_name = "Exchange Rate"
        verbose_name_plural = "Exchange Rate"

    @staticmethod
    def get_current_rate():
        """
        Retrieve the current exchange rate, or default to 1.0 if not set.
        """
        rate_instance, created = ExchangeRate.objects.get_or_create(id=1)  # Singleton pattern
        return rate_instance.rate
    