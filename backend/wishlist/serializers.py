from rest_framework import serializers
from store.serializers import ProductSerializer
from store.models import Product
from .models import Wishlist



class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    class Meta:
        model = Wishlist
        fields = ['product', 'product_id', 'created_at']



    def validate_product_id(self, value):
        user = self.context['request'].user
        if Wishlist.objects.filter(user=user, product=value).exists():
            raise serializers.ValidationError('Already in your wishlist.')
        return value