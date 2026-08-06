from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from rest_framework import serializers
from .models import Order, OrderProduct
from cart.models import CartItem
from cart.utils import get_cart
from .utils import generate_order_number
from store.serializers import ProductSerializer, VariationSerializer


class PlaceOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['first_name',
                  'last_name',
                  'phone',
                  'email',
                  'address_line_1',
                  'address_line_2',
                  'country',
                  'state',
                  'city',
                  'order_note',
                  ]

    def validate(self, attrs):
        request = self.context['request']
        cart_items = CartItem.objects.filter(cart=get_cart(request), is_active=True)

        if not cart_items.exists():
            raise serializers.ValidationError('Your cart is empty.')

        attrs['cart_items'] = cart_items
        return attrs



    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        cart_items = validated_data.pop('cart_items')

        Order.objects.filter(user = request.user, is_ordered=False, status='New').update(status='Cancelled')

        order_total = sum(item.total_price for item in cart_items)
        tax = order_total * Decimal('0.02')

        order = Order.objects.create(
            user=request.user,
            order_number=generate_order_number(),
            order_total=order_total,
            tax=tax,
            ip=request.META.get('REMOTE_ADDR'),
            **validated_data,
        )

        for item in cart_items:
            order_product = OrderProduct.objects.create(
                user = request.user,
                order = order,
                product = item.product,
                quantity = item.quantity,
                product_price = item.unit_price
            )
            order_product.variation.set(item.variation.all())
        return order


class OrderProductSerializer(serializers.ModelSerializer):
    variation = VariationSerializer(many=True, read_only=True)
    product = ProductSerializer(read_only=True)
    class Meta:
        model = OrderProduct
        fields = ['id', 'product', 'variation', 'quantity', 'product_price']



class OrderDetailSerializer(serializers.ModelSerializer):
    products = OrderProductSerializer(source='orderproduct_set', many=True)
    class Meta:
        model = Order
        fields = ['order_number', 'first_name', 'last_name', 'email', 'phone',
                  'address_line_1', 'address_line_2', 'country', 'state', 'city',
                  'order_total', 'tax', 'status', 'created_at', 'products']
