from decimal import Decimal
from django.db import transaction
from django.db.models import F
from cart.models import Cart, CartItem
from store.models import Product
from .models import Order, Payment
from .utils import order_confirmed_email


def _remove_ordered_items_from_cart(order):
    """Delete only the cart lines this order was built from, leaving anything
    the user added afterwards alone."""
    cart = Cart.objects.filter(user=order.user).first()
    if not cart:
        return

    for order_product in order.orderproduct_set.prefetch_related('variation'):
        if not order_product.product:
            continue

        ordered_variations = set(order_product.variation.all())

        candidates = CartItem.objects.filter(
            cart=cart, product=order_product.product
        ).prefetch_related('variation')

        for cart_item in candidates:
            if set(cart_item.variation.all()) != ordered_variations:
                continue

            if cart_item.quantity > order_product.quantity:
                cart_item.quantity -= order_product.quantity
                cart_item.save(update_fields=['quantity'])
            else:
                cart_item.delete()
            break


@transaction.atomic
def fulfil_order(order, intent):
    claimed = Order.objects.filter(pk = order.pk, is_ordered=False, status = 'New').update(is_ordered=True, status='Completed')

    if not claimed:
        return False

    payment = Payment.objects.create(
        user=order.user,
        payment_id=intent['id'],
        payment_method='Stripe',
        amount_paid=str(Decimal(intent['amount']) / 100),
        status='succeeded',
    )

    Order.objects.filter(pk=order.pk).update(payment=payment)
    order.orderproduct_set.update(ordered=True, payment=payment)

    for order_product in order.orderproduct_set.all():
        if order_product.product_id:
            Product.objects.filter(pk=order_product.product_id).update(
                stock=F('stock') - order_product.quantity
            )

    _remove_ordered_items_from_cart(order)

    transaction.on_commit(lambda: order_confirmed_email(order))
    return True

