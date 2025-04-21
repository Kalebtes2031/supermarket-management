from rest_framework import generics, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView, ListAPIView, GenericAPIView
from .models import Product, ProductVariation, Category,Size, Cart, CartItem, TraditionalDressingImage, ExploreFamilyImage, EventImage, DiscoverEthiopianImage, Announcement
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
    ProductVariationNewSerializer,
    ProductVariantSerializer,
    ProductNestedSerializer,
    NewProductSerializer,
    NewProductVariationSerializer,
    ProductFinalSerializer,
    ProductVariationFinalSerializer,
    GlobalSearchSerializer,
    AnnouncementSerializer,
)

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.db.models import Min,Max,Sum
from accounts.permissions import IsAdminOrSuperUser, IsVendorOrAdminOrSuperUser
from orders.models import Order, Payment
from accounts.models import CustomUser
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
# views.py

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.order_by('-created')
    serializer_class = AnnouncementSerializer
    parser_classes   = [MultiPartParser, FormParser]

    def get_permissions(self):
        # SAFE_METHODS are GET, HEAD, OPTIONS
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            perms = [AllowAny]
        else:
            perms = [IsVendorOrAdminOrSuperUser]
        return [p() for p in perms]
    
class GlobalSearchView(GenericAPIView):
    serializer_class = GlobalSearchSerializer
    permission_classes = [IsAdminOrSuperUser]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        results = {
            'products': [],
            'orders': [],
            'payments': [],
            'categories': [],
            'users': {
                'customers': [],
                'vendors': [],
                'deliveries': []
            }
        }

        if query:
            # Product Search (including variations)
            products = Product.objects.filter(
                Q(item_name__icontains=query) |
                Q(item_name_amh__icontains=query)
            ).select_related('category')[:5]
            results['products'] = products

            # Order Search
            orders = Order.objects.filter(
                Q(id__icontains=query) |
                Q(user__username__icontains=query) |
                Q(phone_number__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query)
            )[:5]
            results['orders'] = orders

            # Payment Search
            payments = Payment.objects.filter(
                Q(transaction_id__icontains=query) |
                Q(order__id__icontains=query) |
                Q(user__username__icontains=query)
            )[:5]
            results['payments'] = payments

            # Category Search
            categories = Category.objects.filter(
                Q(name__icontains=query) |
                Q(name_amh__icontains=query)
            )[:5]
            results['categories'] = categories
            
            # User Search
            users = CustomUser.objects.filter(
                Q(username__icontains=query) |
                Q(email__icontains=query) |
                Q(phone_number__icontains=query)
            )[:10]  # Limit to 10 users

            # Categorize users by role
            results['users']['customers'] = [u for u in users if u.role == 'customer']
            results['users']['vendors'] = [u for u in users if u.role == 'vendor']
            results['users']['deliveries'] = [u for u in users if u.role == 'delivery']

        serializer = self.get_serializer(results)
        return Response(serializer.data)


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrSuperUser]
    
class ProductFinalViewSet(ModelViewSet):
    queryset = Product.objects.all().prefetch_related('variations')
    serializer_class = ProductFinalSerializer
    permission_classes = [IsAdminOrSuperUser]

class ProductVariationFinalViewSet(ModelViewSet):
    serializer_class = ProductVariationFinalSerializer
    permission_classes = [IsAdminOrSuperUser]

    def get_queryset(self):
        # only show variations for product_pk
        return ProductVariation.objects.filter(
            variations_id=self.kwargs['product_pk']
        )

    def perform_create(self, serializer):
        # inject the product FK from the URL
        serializer.save(variations_id=self.kwargs['product_pk'])

    def update(self, request, *args, **kwargs):
        # allow partial updates via PUT if you like
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)



class PopularProductVariationsView(generics.ListAPIView):
    serializer_class = ProductVariantSerializer

    def get_queryset(self):
        return ProductVariation.objects.filter(in_stock=True).order_by('-popularity')[:4]

class ProductSearchView(ListAPIView):
    serializer_class = ProductVariationNewSerializer
    pagination_class = PageNumberPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        
        # Filter ProductVariation based on parent Product fields
        return ProductVariation.objects.filter(
            Q(variations__item_name__icontains=query) |
            Q(variations__item_name_amh__icontains=query) |
            Q(variations__category__name__icontains=query) |
            Q(variations__category__name_amh__icontains=query)
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

class AdminCategoryViewSet(ModelViewSet):
    """
    API endpoint for admin users to manage categories.
    Only accessible to admin users.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrSuperUser]
    
class ProductVariantViewSet(ModelViewSet):
    """
    API endpoint that allows product variations to be viewed or edited.
    """
    queryset = ProductVariation.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminOrSuperUser]
    
class NewProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductNestedSerializer
    permission_classes = [IsAdminOrSuperUser]


class NewProductVariationViewSet(ModelViewSet):
    queryset = ProductVariation.objects.all()
    serializer_class = NewProductVariationSerializer
    permission_classes = [IsAdminOrSuperUser]    

class AdminProductViewSet(ModelViewSet):
    """
    GET    /admin/products/          → list all (with nested variations)
    POST   /admin/products/          → create product + variations
    GET    /admin/products/{id}/     → retrieve single product
    PUT    /admin/products/{id}/     → full update (incl variations)
    PATCH  /admin/products/{id}/     → partial update
    DELETE /admin/products/{id}/     → delete product (+ cascade variations)
    """
    queryset = Product.objects.all()
    serializer_class = ProductNestedSerializer
    permission_classes = [IsAdminOrSuperUser]
    
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
        category_id = self.request.query_params.get('category_id', None)
        sort = self.request.query_params.get('sort', None)
        
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
            
        if sort in ['price_asc', 'price_desc']:
            queryset = queryset.annotate(min_price=Min('variations__price'))
            if sort == 'price_asc':
                queryset = queryset.order_by('min_price')
            elif sort == 'price_desc':
                queryset = queryset.order_by('-min_price')
        # elif sort == 'popularity':
        #     queryset = queryset.order_by('-popularity')
        elif sort == 'popularity':
            queryset = (
                queryset
                .annotate(popularity_score=Sum('variations__popularity'))
                .order_by('-popularity_score')[:6]
            )
        elif sort == 'latest':
            queryset = queryset.order_by('-id')
 
            
        return queryset
 
class CategoryListView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
       
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
# class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = CartItemSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         cart, _ = Cart.objects.get_or_create(user=self.request.user)
#         return CartItem.objects.filter(cart=cart)
class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'variations_id'  # Use variations_id instead of the default 'pk'

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
