from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    categ_img = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Category
        fields = ("category_name",'slug','description', 'categ_img', 'product_count')

    
    def get_categ_img(self, obj):
        request = self.context.get('request')
        if obj.categ_img and request:
            return request.build_absolute_uri(obj.categ_img.url)
        return None        

