from rest_framework import serializers
from .models import Product, ProductVariation, Category, Size, Style, Cart, CartItem, TraditionalDressingImage, ExploreFamilyImage, EventImage, DiscoverEthiopianImage


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariation
        fields = ['id', 'quantity', 'unit', 'price', 'in_stock', 'stock_quantity']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name','name_amh', 'image']
        
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
        fields = ['id', 'item_name','item_name_amh', 'image','image_full','image_left','image_right','image_back', 'category','popularity', 'variations']




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
    image = serializers.SerializerMethodField()  # New field for product image
    
    class Meta:
        model = CartItem
        fields = ['id', 'item_name', 'image', 'variations', 'variations_id', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()
    
    def get_item_name(self, obj):
        # Return the item name from the related Product
        return obj.variations.variations.item_name

    def get_image(self, obj):
        # Return the image from the related Product
        return obj.variations.variations.image.url if obj.variations.variations.image else None

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
