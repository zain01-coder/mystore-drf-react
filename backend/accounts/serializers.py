from rest_framework import serializers
from .models import Account, OTP
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken, TokenError


class AccountCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=12, min_length=8, write_only=True)
    password2 = serializers.CharField(max_length=12, min_length=8, write_only=True)

    class Meta:
        model = Account
        fields = [
            'email',
            'first_name',
            'last_name',
            'username',
            'password',
            'password2',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Password and confirm password must match.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = Account.objects.create_user(password=password, **validated_data)
        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('otp')

        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})

        try:
            otp = OTP.objects.get(user=user, code=code, is_used=False)
        except OTP.DoesNotExist:
            raise serializers.ValidationError({'otp': 'Invalid OTP.'})

        if otp.is_expired():
            raise serializers.ValidationError({'otp': 'OTP has expired.'})

        attrs['user'] = user
        attrs['otp_instance'] = otp
        return attrs


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email')

        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})

        if user.is_active:
            raise serializers.ValidationError({'email': 'This email is already verified.'})

        attrs['user'] = user
        return attrs


# class UserLoginSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, attrs):
#         email = attrs.get('email')
#         password = attrs.get('password')



class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        request = self.context.get('request')

        # first check if user exists
        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            raise AuthenticationFailed('Invalid email or password.')

        # then check if verified
        if not user.is_active:
            raise AuthenticationFailed('Account is not verified. Please verify your email first.')

        # then check password
        user = authenticate(request, email=email, password=password)
        if not user:
            raise AuthenticationFailed('Invalid email or password.')

        tokens = user.tokens()
        attrs['user'] = user
        attrs['refresh_token'] = tokens.get('refresh_token')
        attrs['access_token'] = tokens.get('access_token')
        return attrs



class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

    def validate(self, attrs):
        try:
            token = RefreshToken(attrs.get('refresh_token'))
        except TokenError:
            raise serializers.ValidationError({'refresh_token': 'Invalid or expired token.'})

        attrs['token'] = token
        return attrs

    def save(self, **kwargs):
        self.validated_data['token'].blacklist()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email')

        
        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})
        
        if not user.is_active:
            raise serializers.ValidationError({'email': 'Account is not verified.'})


        attrs['user'] = user
        return attrs
    


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(max_length=12, min_length=8, write_only=True)
    password2 = serializers.CharField(max_length=12, min_length=8, write_only=True)

    def validate(self, attrs):
        uid = attrs.get('uid')
        token = attrs.get('token')
        password = attrs.get('password')
        password2 = attrs.get('password2')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = Account.objects.get(pk=user_id)
        except (Account.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError({'token': 'Invalid password reset link.'})

        if not user.is_active:
            raise serializers.ValidationError({'token': 'Account is not verified.'})

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({'token': 'Invalid or expired password reset link.'})

        if password != password2:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})

        attrs['user'] = user
        return attrs


class CurrentUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField(source='get_full_name')

    class Meta:
        model = Account
        fields = ['id', 'first_name', 'last_name', 'full_name', 'username', 'email', 'phonenumber', 'date_joined']
        read_only_fields = fields
