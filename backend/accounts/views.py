from rest_framework.response import Response
from .serializers import AccountCreateSerializer, VerifyEmailSerializer, ResendOTPSerializer, UserLoginSerializer, LogoutSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, CurrentUserSerializer
from cart.models import Cart, CartItem
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from .utils import send_otp, send_password_reset_email
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from cart.utils import _cart_id




class RegisterUserView(GenericAPIView):
    serializer_class = AccountCreateSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_otp(user)
        return Response({
            'data': serializer.data,
            'message': 'Registration successful. Please verify the OTP sent to your email.'
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(GenericAPIView):
    serializer_class = VerifyEmailSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp_instance']

        user.is_active = True
        user.save(update_fields=['is_active'])

        otp.is_used = True
        otp.save(update_fields=['is_used'])

        return Response({
            'message': 'Email verified successfully.'
        }, status=status.HTTP_200_OK)




class ResendOTPView(GenericAPIView):
    serializer_class = ResendOTPSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        send_otp(user)

        return Response({
            'message': 'A new OTP has been sent to your email.'
        }, status=status.HTTP_200_OK)

    




class UserLoginView(GenericAPIView):
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh_token = serializer.validated_data['refresh_token']
        access_token = serializer.validated_data['access_token']
        
        guest_cart = Cart.objects.filter(cart_id = _cart_id(request)).first()

        if guest_cart:
            user_cart, _ = Cart.objects.get_or_create(user = user)
            for guest_item in CartItem.objects.filter(cart =  guest_cart):
                guest_variations = set(guest_item.variation.all())
                match = None

                for user_item in CartItem.objects.filter(cart = user_cart, product=guest_item.product):
                    if set(user_item.variation.all()) == guest_variations:
                        match = user_item
                        break
                
                if match:
                    match.quantity += guest_item.quantity
                    match.save()
                    guest_item.delete()
                else:
                    guest_item.cart = user_cart
                    guest_item.save()
            guest_cart.delete()


        return Response({
            'user': {
                'email': user.email,
                'full_name': user.get_full_name,
                'username': user.username,
            },
            'access_token': access_token,
            'refresh_token': refresh_token,
        }, status=status.HTTP_200_OK)
    





class LogoutView(GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class LoggedIn(GenericAPIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        return Response({
            'msg':"Everything is fine"
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(GenericAPIView):
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        send_password_reset_email(user)
        return Response({
            'message': 'Password reset link has been sent to your email.'
        }, status=status.HTTP_200_OK)
    




class ResetPasswordView(GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        user.set_password(serializer.validated_data['password'])
        user.save()

        return Response({
            'message': 'Password reset successfully.'
        }, status=status.HTTP_200_OK)

    


class CurrentUserView(RetrieveAPIView):
    """Details of the logged-in user, for the dashboard and navbar."""
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
