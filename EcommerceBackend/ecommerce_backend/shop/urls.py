from django.urls import path, include
from .views import (ProductDetailView, 
                    CategoryViewSet,
                    ProductView, 
                    SizeViewSet, 
                    CartView, 
                    CartItemView, 
                    CartItemUpdateDeleteView, 
                    ClearCartView, 
                    CartSummaryView, 
                    TraditionalDressingImageListCreateView, 
                    ExploreFamilyImageListCreateView, 
                    EventImageListCreateView,
                    DiscoverEthiopianImageListCreateView,
                    ProductSearchView,
                    CategoryListView,
                    )
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'category', CategoryViewSet, basename= 'category')
router.register(r'products', ProductView)
router.register(r'size', SizeViewSet)

urlpatterns = [
    path('category-list/', CategoryListView.as_view(), name='category-list'),
    path('productdetail/', ProductDetailView.as_view(), name='create_order'),
    path('', include(router.urls)),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart_items'),
    path('cart/items/<int:variations_id>/', CartItemUpdateDeleteView.as_view(), name='cart_item_detail'),
    path('cart/clear/', ClearCartView.as_view(), name='clear_cart'),
    path('cart/summary/', CartSummaryView.as_view(), name='cart_summary'),
    path('traditional-dressing/', TraditionalDressingImageListCreateView.as_view(), name='traditional-dressing-list-create'),
    path('explore-family/', ExploreFamilyImageListCreateView.as_view(), name='explore-family-list-create'),
    path('event/', EventImageListCreateView.as_view(), name='event-list-create'),
    path('discover-ethiopian/', DiscoverEthiopianImageListCreateView.as_view(), name='discover-ethiopian-list-create'),
    path('search/', ProductSearchView.as_view(), name="product-search"),
]
