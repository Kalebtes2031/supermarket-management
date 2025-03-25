from rest_framework import generics, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView, ListAPIView
from .models import Product, Category,Size, Cart, CartItem, TraditionalDressingImage, ExploreFamilyImage, EventImage, DiscoverEthiopianImage
from .serializers import (
    ProductSerializer, 
    CategorySerializer,
    SizeSerializer, 
    CartItemSerializer, 
    CartSerializer, 
    TraditionalDressingImageSerializer,
    ExploreFamilyImageSerializer,
    EventImageSerializer,
    DiscoverEthiopianImageSerializer,
)

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.db.models import Min


class ProductSearchView(ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = PageNumberPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()  # Fetch and strip the 'q' parameter
        return Product.objects.filter(
            Q(item_name__icontains=query) |
            Q(item_name_amh__icontains=query) |
            Q(category__name__icontains=query) | 
            Q(category__name_amh__icontains=query)
        )


class TraditionalDressingImageListCreateView(generics.ListCreateAPIView):
    queryset = TraditionalDressingImage.objects.all()
    serializer_class = TraditionalDressingImageSerializer
    permission_classes = [AllowAny]
    
class ExploreFamilyImageListCreateView(generics.ListCreateAPIView):
    queryset = ExploreFamilyImage.objects.all()
    serializer_class = ExploreFamilyImageSerializer
    permission_classes = [AllowAny]
    
class EventImageListCreateView(generics.ListCreateAPIView):
    queryset = EventImage.objects.all()
    serializer_class = EventImageSerializer
    permission_classes = [AllowAny]

class DiscoverEthiopianImageListCreateView(generics.ListCreateAPIView):
    queryset = DiscoverEthiopianImage.objects.all()
    serializer_class = DiscoverEthiopianImageSerializer
    permission_classes = [AllowAny]
      
class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.prefetch_related('variations')
    serializer_class = ProductSerializer

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
class ProductView(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        """Assign permissions based on HTTP method."""
        if self.action in ['list', 'retrieve']:  # GET requests
            permission_classes = [AllowAny]
        else:  # POST, PUT, PATCH, DELETE requests
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('categoryId', None)
        sort = self.request.query_params.get('sort', None)
        
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
            
        if sort in ['price_asc', 'price_desc']:
            queryset = queryset.annotate(min_price=Min('variations__price'))
            if sort == 'price_asc':
                queryset = queryset.order_by('min_price')
            elif sort == 'price_desc':
                queryset = queryset.order_by('-min_price')
        elif sort == 'popularity':
            queryset = queryset.order_by('-popularity')
        elif sort == 'latest':
            queryset = queryset.order_by('-id')
 
            
        return queryset
    
class SizeViewSet(ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    # permission_classes = [IsAuthenticated]  
    
# View to retrieve or create a cart
class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

class CartItemView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)

# View to update or delete items from the cart
class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)
    
class ClearCartView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        cart.items.all().delete()
        return Response({"detail": "Cart cleared successfully."}, status=204)


class CartSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        total_price = sum(item.get_total_price() for item in cart.items.all())
        total_items = cart.items.count()
        return Response({
            "user": request.user.username,
            "total_items": total_items,
            "total_price": total_price,
        })
