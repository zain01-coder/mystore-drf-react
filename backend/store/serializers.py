from rest_framework import serializers
from .models import Product, Variation, ReviewRating, ProductImage
from category.serializers import CategorySerializer




class VariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variation
        fields = ['id','variation_category', 'variation_value','is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'display_order']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None





class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only = True)
    category_slug = serializers.CharField(source = 'category.slug', read_only = True)
    image = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    variations = VariationSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField(source='averageReview')
    review_count = serializers.ReadOnlyField(source = 'countReview')

    class Meta:
        model = Product
        fields = [
            'id',
            'product_name',
            'slug',
            'price',
            'category_name',
            'category_slug',
            'variations',
            'description',
            'image',
            'images',
            'stock',
            'is_available',
            'average_rating',
            'review_count',
            'is_sale',
            'sale_price',
            'discount_percentage',
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None



class ReviewRatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only = True)
    is_owner = serializers.SerializerMethodField()
    class Meta:
        model = ReviewRating
        fields = ['id', 'subject', 'review', 'rating', 'created_at', 'user_name', 'updated_at', 'is_owner']
        read_only_fields = ['id', 'user_name', 'created_at', 'updated_at', 'is_owner']


    def get_is_owner(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.user_id == request.user.id)


