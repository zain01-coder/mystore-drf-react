import django_filters as filters
from .models import Product
from django.db.models import Avg, Q



class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    in_stock  = filters.BooleanFilter(method='filter_in_stock')
    min_rating = filters.NumberFilter(method='filter_min_rating')

    class Meta:
        model = Product
        fields = ['min_price', 'max_price', 'in_stock']


    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset

    def filter_min_rating(self, queryset, name, value):
        return queryset.annotate(
            avg_rating=Avg('reviews__rating', filter=Q(reviews__status=True))
        ).filter(avg_rating__gte=value)