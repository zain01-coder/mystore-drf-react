from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_cart_items),
    path('add/', views.add_to_cart),
    path('clear/', views.clear_cart_items),
    path('increase/<int:id>/', views.increase_cart_item),
    path('decrease/<int:id>/', views.decrease_cart_item),
    path('remove/<int:id>/', views.remove_cart_item),
]