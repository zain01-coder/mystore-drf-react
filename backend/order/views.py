import stripe
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import PlaceOrderSerializer, OrderDetailSerializer
from django.conf import settings
from .models import Order
from cart.models import Cart, CartItem
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from .models import Payment
from .utils import order_confirmed_email
from .services import fulfil_order


stripe.api_key = settings.STRIPE_SECRET_KEY


class OrderPagination(PageNumberPagination):
    page_size = 12
    page_query_param = 'page_num'
    max_page_size = 48


class ListOrderAPIView(ListAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = OrderPagination

    def get_queryset(self):
        # Only orders that were actually paid for. Abandoned 'New' orders and the
        # ones auto-cancelled at placement time are noise, not order history.
        queryset = (
            Order.objects
            .filter(user=self.request.user, is_ordered=True)
            .order_by('-created_at')
            .prefetch_related('orderproduct_set__product', 'orderproduct_set__variation')
        )

        limit = self.request.query_params.get('limit')
        if limit and limit.isdigit():
            queryset = queryset[:int(limit)]

        return queryset



class RetrieveOrder(RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_number'
    lookup_url_kwarg = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)



class PlaceOrderView(GenericAPIView):
    serializer_class = PlaceOrderSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        return Response({
            'order_number': order.order_number,
            'order_total': order.order_total,
            'tax': order.tax,
        }, status=status.HTTP_201_CREATED)
    


class CreatePaymentIntentView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order = Order.objects.filter(
            order_number=request.data.get('order_number'),
            user=request.user,
            is_ordered=False,
            status='New',
        ).first()

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        amount = int(round((order.order_total + order.tax) * 100))

        if order.payment_intent_id:
            intent = stripe.PaymentIntent.retrieve(order.payment_intent_id)

            if intent.status in ('requires_payment_method', 'requires_confirmation', 'requires_action'):
                if intent.amount != amount:
                    intent = stripe.PaymentIntent.modify(intent.id, amount=amount)
                return Response({'client_secret': intent.client_secret}, status=status.HTTP_200_OK)

            # Already paid — the webhook just hasn't reached us yet. Finish the
            # order here instead of handing out a second payment form.
            if intent.status == 'succeeded':
                fulfil_order(order, intent)
                return Response({'error': 'This order has already been paid.'},
                                status=status.HTTP_409_CONFLICT)

            if intent.status == 'processing':
                return Response({'error': 'Your payment is still processing.'},
                                status=status.HTTP_409_CONFLICT)

        # The idempotency key makes two concurrent calls for the same order return
        # the SAME intent instead of creating two. Without it, React StrictMode's
        # double-invoked effect creates a pair and we store the wrong one.
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            metadata={'order_number': order.order_number},
            idempotency_key=f'pi-{order.order_number}',
        )
        order.payment_intent_id = intent.id
        order.save(update_fields=['payment_intent_id'])

        return Response({'client_secret': intent.client_secret}, status=status.HTTP_200_OK)




@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)

        if event['type'] == 'payment_intent.succeeded':
            intent = event['data']['object']
            # Stripe's StripeObject is not a dict subclass, so .get() is unavailable.
            # Bracket access and `in` both work on it.
            metadata = intent['metadata']
            order_number = metadata['order_number'] if 'order_number' in metadata else None

            order = Order.objects.filter(
                order_number=order_number, is_ordered=False, status='New'
            ).first()
            if order:
                fulfil_order(order, intent)

        return HttpResponse(status=200)


class ConfirmOrderView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):
        order = Order.objects.filter(
            order_number=order_number, user=request.user
        ).first()

        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.is_ordered:
            return Response({'status': order.status}, status=status.HTTP_200_OK)

        if not order.payment_intent_id:
            return Response({'error': 'No payment started for this order'},
                            status=status.HTTP_400_BAD_REQUEST)

        intent = stripe.PaymentIntent.retrieve(order.payment_intent_id)

        if intent.status == 'succeeded':
            fulfil_order(order, intent)
            return Response({'status': 'Completed'}, status=status.HTTP_200_OK)

        return Response({'status': intent.status}, status=status.HTTP_202_ACCEPTED)
