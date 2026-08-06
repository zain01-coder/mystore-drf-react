from rest_framework import serializers
from store.serializers import ProductSerializer, VariationSerializer
from .models import CartItem




class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only = True)
    total_price = serializers.ReadOnlyField()
    unit_price = serializers.ReadOnlyField()
    variation = VariationSerializer(many=True, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity','total_price', 'unit_price', 'variation']


