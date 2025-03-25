from django.contrib import admin
from django.db.models import Min
from .models import (
    ExchangeRate,
    Product,
    ProductVariation,  # Use consistent naming with your models
    Style,
    Category,
    Size,
    TraditionalDressingImage,
    ExploreFamilyImage,
    EventImage,
    DiscoverEthiopianImage
)

# @admin.register(ExchangeRate)
# class ExchangeRateAdmin(admin.ModelAdmin):
#     list_display = ('rate',)


class ProductVariantInline(admin.TabularInline):
    model = ProductVariation
    extra = 1  # Number of extra empty forms to display


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'item_name_amh', 'min_price', 'popularity']
    inlines = [ProductVariantInline]

    def min_price(self, obj):
        result = obj.variations.aggregate(min_price=Min('price'))
        return result['min_price'] if result['min_price'] is not None else 'N/A'
    min_price.short_description = 'Min Price'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_amh']


# Register additional models for easy management in the admin.
# admin.site.register(Size)
# admin.site.register(TraditionalDressingImage)
# admin.site.register(ExploreFamilyImage)
# admin.site.register(EventImage)
# admin.site.register(DiscoverEthiopianImage)


@admin.register(ProductVariation)
class ProductVariantAdmin(admin.ModelAdmin):
    # Instead of using 'product' directly, we define a custom method to display product information.
    list_display = ['product_name', 'quantity', 'unit', 'price', 'in_stock', 'stock_quantity']

    def product_name(self, obj):
        return obj.variations.item_name if obj.variations else "N/A"
    product_name.short_description = 'Product'


