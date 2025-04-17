# # # orders/signals.py
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Order
# import logging

# logger = logging.getLogger(__name__)

# # @receiver(post_save, sender=Order)
# # def update_product_popularity(sender, instance, created, **kwargs):
# #     if instance.status == 'Pending':  # Ensure the order status is 'Delivered'
# #         logger.info(f"Order #{instance.id} is pending. Updating product popularity.")
# #         for item in instance.items.all():
# #             product = item.variations
# #             logger.info(f"Updating popularity for product {product.item_name}. Current popularity: {product.popularity}")
# #             product.popularity += item.quantity
# #             product.save()
# #             logger.info(f"New popularity for {product.item_name}: {product.popularity}")
# @receiver(post_save, sender=Order)
# def update_variation_popularity(sender, instance, created, **kwargs):
#     # Only run on the *initial* save
#     if created and instance.status == 'Pending':
#         for item in instance.items.all():
#             variation = item.variations
#             variation.popularity += item.quantity
#             variation.save(update_fields=['popularity'])