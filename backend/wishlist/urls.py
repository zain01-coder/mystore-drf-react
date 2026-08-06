from django.urls import path
from . import views


urlpatterns = [
    path('', views.WishlistListCreateAPIView.as_view(), name='wishlist_list_create'),
    path('clear/', views.WishlistClearAPIView.as_view(), name='wishlist_clear'),
    path('<int:product_id>', views.WishlistDestroyAPIView.as_view(), name='wishlist_destroy'),
]