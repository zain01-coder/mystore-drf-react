from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.ProductListAPIView.as_view(), name='product_list'),
    path('', views.StoreProductListAPIView.as_view(), name='product_list'),
    path('category/<slug:category_slug>/', views.ProductCategoryListAPIView.as_view(), name='product_category'),
    path('category/<slug:category_slug>/<slug:product_slug>/', views.ProductRetrieveAPIView.as_view(), name='product_category'),
    path('products/<int:product_id>/reviews/', views.ProductReviewListCreateAPIView.as_view(), name='product_reviews'),
    path('reviews/<int:pk>/', views.ReviewDetailAPIView.as_view(), name='review_detail'),
]
