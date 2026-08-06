from django.contrib import admin
from .models import Product, Variation, ProductImage
# Register your models here.


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3


class ProductAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('product_name',)}
    list_display = ('product_name', 'slug', 'price', 'stock', 'category', 'created_date', 'modified_at', 'is_available')
    inlines = [ProductImageInline]


admin.site.register(Product, ProductAdmin)
admin.site.register(Variation)
