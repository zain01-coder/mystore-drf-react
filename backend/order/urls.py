from django.urls import path
from . import views


urlpatterns = [
    path('list/', views.ListOrderAPIView.as_view(), name='list_order'),
    path('place/', views.PlaceOrderView.as_view(), name='place_order'),
    path('create_payment/', views.CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('stripe-webhook/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('<str:order_number>/confirm/', views.ConfirmOrderView.as_view(), name='order-confirm'),
    path('<str:order_number>/', views.RetrieveOrder.as_view(), name='order-detail'),
]
