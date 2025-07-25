from rest_framework import serializers
from .models import (
    Product, 
    ProductVariation, 
    Category, Size, 
    Style, Cart, 
    CartItem, 
    TraditionalDressingImage, 
    ExploreFamilyImage, 
    EventImage, DiscoverEthiopianImage,
    Announcement
    )
from orders.models import  Order, Payment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name','name_amh', 'image']
       
       
class ProductVariationFinalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariation
        fields = '__all__'
        extra_kwargs = {
            'variations': {'read_only': True}
        }

class ProductFinalSerializer(serializers.ModelSerializer):
    variations = ProductVariationFinalSerializer(many=True, read_only=True)
    category    = CategorySerializer(read_only=True)

    # for POST/PUT: accept an integer id
    category_id = serializers.PrimaryKeyRelatedField(
        source='category',      # maps this field to .category on the model
        write_only=True,
        queryset=Category.objects.all()
    )
    
    class Meta:
        model = Product
        fields = '__all__'
        # depth = 1
        
class NewProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'item_name', 'item_name_amh',
            'category',
            'image', 'image_full',
            'image_left', 'image_right', 'image_back',
        ]

class NewProductVariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariation
        fields = ['id', 'variations', 'quantity', 'unit',
                  'price', 'in_stock', 'stock_quantity', 'popularity']
        read_only_fields = ['id', 'popularity']
        
class ProductVariationNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariation
        # omit `product`/`variations` FK here—handled by nesting
        fields = ['id', 'quantity', 'unit', 'price', 'in_stock', 'stock_quantity', 'popularity']
        read_only_fields = ['id', 'popularity']

class ProductNestedSerializer(serializers.ModelSerializer):
    variations = ProductVariationNestedSerializer(many=True)
    
    class Meta:
        model = Product
        fields = [
          'id',
          'item_name','item_name_amh',
          'category',      # or CategorySerializer if you want full nested
          'image','image_full','image_left','image_right','image_back',
          'variations',
        ]
    
    def create(self, validated_data):
        variations_data = validated_data.pop('variations', [])
        product = Product.objects.create(**validated_data)
        # create each variation, linking back
        for var in variations_data:
            ProductVariation.objects.create(variations=product, **var)
        return product

    def update(self, instance, validated_data):
        variations_data = validated_data.pop('variations', [])
        # 1) update top‑level product fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # 2) reconcile variations: simple approach—delete all then re‑create
        #    (you can do fancier diff‑by‑id logic if you want)
        instance.variations.all().delete()
        for var in variations_data:
            ProductVariation.objects.create(variations=instance, **var)
        return instance
    
    
class SimpleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'item_name','item_name_amh', 'image']


class ProductVariantSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer(source="variations", read_only=True)
    
    class Meta:
        model = ProductVariation
        fields = ['id', 'quantity', 'unit', 'price', 'in_stock', 'stock_quantity', 'product','popularity']

# serializers.py

class ProductVariationNewSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="variations.item_name")
    item_name_amh = serializers.CharField(source="variations.item_name_amh")
    category = serializers.StringRelatedField(source="variations.category")
    image = serializers.ImageField(source="variations.image")

    class Meta:
        model = ProductVariation
        fields = [
            "id",
            "item_name",
            "item_name_amh",
            "category",
            "image",
            "quantity",
            "unit",
            "price",
            "in_stock",
            "stock_quantity",
        ]


 
class StyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Style
        fields = ['id', 'name']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name']
            
class ProductSerializer(serializers.ModelSerializer):
    # variants = ProductVariantSerializer(many=True)
    # category = CategorySerializer(read_only=True)
    # category_id = serializers.PrimaryKeyRelatedField(
    #     queryset=Category.objects.all(), write_only=True, source='category'
    # )
    category = CategorySerializer()
    image = serializers.ImageField(required=False)
    image_full = serializers.ImageField(required=False)
    image_left = serializers.ImageField(required=False)
    image_right = serializers.ImageField(required=False)
    image_back = serializers.ImageField(required=False)
    # style = StyleSerializer()
    # sizes = SizeSerializer()
    variations = ProductVariantSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'item_name','item_name_amh', 'image','image_full','image_left','image_right','image_back', 'category', 'variations']




# class CartItemSerializer(serializers.ModelSerializer):
#     total_price = serializers.SerializerMethodField()

#     class Meta:
#         model = CartItem
#         fields = ['id', 'product', 'quantity', 'total_price']

#     def get_total_price(self, obj):
#         # Ensure `obj` is a CartItem instance
#         if isinstance(obj, CartItem):
#             return obj.get_total_price()
#         return obj.get('total_price', 0)  # Fallback for dictionary data

class CartItemSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    variations = ProductVariantSerializer(read_only=True)  # Use nested serializer for reading
    variations_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariation.objects.all(),
        write_only=True
    )  # Use this for writing (POST requests)
    item_name = serializers.SerializerMethodField()  # New field for product name
    item_name_amh = serializers.SerializerMethodField()  # New field for product name
    image = serializers.SerializerMethodField()  # New field for product image
    
    class Meta:
        model = CartItem
        fields = ['id', 'item_name','item_name_amh', 'image', 'variations', 'variations_id', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()
    
    def get_item_name(self, obj):
        # Return the item name from the related Product
        return obj.variations.variations.item_name
    def get_item_name_amh(self, obj):
        # Return the item name from the related Product
        return obj.variations.variations.item_name_amh

    def get_image(self, obj):
        request = self.context.get('request')  # Get request object from serializer context
        if obj.variations.variations.image:
            image_url = obj.variations.variations.image.url
            return request.build_absolute_uri(image_url) if request else settings.MEDIA_URL + image_url
        return None

    def create(self, validated_data):
        cart = validated_data.get('cart')
        variant = validated_data.get('variations_id')
        quantity = validated_data.get('quantity', 1)

        # Check if the product already exists in the cart
        cart_item, created = CartItem.objects.get_or_create(cart=cart, variations=variant)
        if not created:
            # Update the quantity if the item already exists
            cart_item.quantity += quantity
            cart_item.save()
        else:
            # Save the new item
            cart_item.quantity = quantity
            cart_item.save()

        return cart_item


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total']

    def get_total(self, obj):
        return sum(item.get_total_price() for item in obj.items.all())

class TraditionalDressingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraditionalDressingImage
        fields = '__all__'


class ExploreFamilyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExploreFamilyImage
        fields = '__all__'


class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = '__all__'


class DiscoverEthiopianImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscoverEthiopianImage
        fields = '__all__'



class GlobalSearchSerializer(serializers.Serializer):
    products = serializers.SerializerMethodField()
    orders = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    users = serializers.SerializerMethodField()

    def get_users(self, obj):
        from accounts.serializers import UserSerializer  # Local import
        return {
            'customers': UserSerializer(obj['users']['customers'], many=True).data,
            'vendors': UserSerializer(obj['users']['vendors'], many=True).data,
            'deliveries': UserSerializer(obj['users']['deliveries'], many=True).data
        }
    def get_products(self, obj):
        from .serializers import ProductSerializer
        return ProductSerializer(obj['products'], many=True).data

    def get_orders(self, obj):
        from orders.serializers import OrderSerializer
        return OrderSerializer(obj['orders'], many=True).data

    def get_payments(self, obj):
        from orders.serializers import PaymentSerializer
        return PaymentSerializer(obj['payments'], many=True).data

    def get_categories(self, obj):
        from .serializers import CategorySerializer
        return CategorySerializer(obj['categories'], many=True).data
    
class AnnouncementSerializer(serializers.ModelSerializer):
    image       = serializers.ImageField(write_only=True)
    image_url   = serializers.ImageField(source='image', read_only=True)

    class Meta:
        model  = Announcement
        fields = ['id', 'title', 'image', 'image_url', 'created']