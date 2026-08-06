from django.shortcuts import render
from rest_framework import generics
from .serializers import ProductSerializer, ReviewRatingSerializer
from .models import Product, ReviewRating
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .filters import ProductFilter
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

# Create your views here.

#Helper function for cart


#Pagination class
class ProductPagination(PageNumberPagination):
    page_size = 12
    page_query_param = 'page_num'
    max_page_size = 48


class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(is_available = True)[:8]



class StoreProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(is_available = True).order_by('-id')
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend,SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['product_name', 'description', 'category__category_name']
    ordering_fields = ['price','id', 'created_date']
    ordering = ['-id']

    



class ProductCategoryListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['product_name', 'description', 'category__category_name']
    ordering_fields = ['price','id', 'created_date']
    ordering = ['-id']

    def get_queryset(self):
        category_slug = self.kwargs.get('category_slug')

        return Product.objects.filter(
            is_available=True,
            category__slug=category_slug
        )



class ProductRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'product_slug'
    queryset = Product.objects.filter(is_available = True).prefetch_related('images', 'variations')




class ProductReviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ReviewRatingSerializer

    def get_queryset(self):
        return ReviewRating.objects.filter(product_id=self.kwargs['product_id'], status=True)

    def perform_create(self, serializer):
        try:
            serializer.save(
                user=self.request.user,
                product_id=self.kwargs['product_id'],
            )
        except IntegrityError:
            raise ValidationError('You have already reviewed this product')


# class ProductReviewListCreateAPIView(generics.ListCreateAPIView):
#     serializer_class = ReviewRatingSerializer
#     permission_classes = [IsAuthenticatedOrReadOnly]

#     def get_queryset(self):
#         return ReviewRating.objects.filter(
#             product__slug=self.kwargs['product_slug'],
#             status=True,
#         ).select_related('user')

#     def perform_create(self, serializer):
#         product = get_object_or_404(
#             Product,
#             slug=self.kwargs['product_slug'],
#             is_available=True,
#         )

#         if ReviewRating.objects.filter(product=product, user=self.request.user).exists():
#             raise ValidationError(
#                 {'detail': 'You have already submitted a rating for this product.'}
#             )

#         serializer.save(
#             product=product,
#             user=self.request.user,
#             ip=self.request.META.get('REMOTE_ADDR'),
        # )


class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReviewRating.objects.filter(user = self.request.user)

