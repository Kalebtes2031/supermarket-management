from django.urls import path, include
from .views import (ProductDetailView, 
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
                    AdminCategoryViewSet,
                    ProductVariantViewSet,
                    PopularProductVariationsView,
                    AdminProductViewSet,
                    NewProductViewSet,
                    NewProductVariationViewSet,
                    ProductFinalViewSet,
                    ProductVariationFinalViewSet,
                    CategoryViewSet,
                    GlobalSearchView,
                    AnnouncementViewSet,
                    )
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'admin/category', AdminCategoryViewSet, basename= 'admin-category')
router.register(r'customer/products', ProductView, basename='customer-products')
router.register(r'admin/products', ProductVariantViewSet, basename='admin-products')
router.register(r'size', SizeViewSet)
router.register(r'admin/all/products', AdminProductViewSet, basename='admin-all-products')
router.register(r'admin/new/products', NewProductViewSet, basename='admin-new-products')
router.register(r'admin/new/variations', NewProductVariationViewSet, basename='admin-new-variations')
router.register(r'products', ProductFinalViewSet)
router.register(r'announcements', AnnouncementViewSet, basename='announcement')

products_router = routers.NestedSimpleRouter(router, r'products', lookup='product')
products_router.register(r'variations', ProductVariationFinalViewSet, basename='product-variations')


urlpatterns = [
    path('popular-variations/', PopularProductVariationsView.as_view(), name='popular-variations'),
    path('category-list/', CategoryListView.as_view(), name='category-list'),
    path('productdetail/', ProductDetailView.as_view(), name='create_order'),
    path('', include(router.urls)),
    path('', include(products_router.urls)),
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
    path('search/global/', GlobalSearchView.as_view(), name='global-search'),
]
