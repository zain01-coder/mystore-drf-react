import logging
import random
from django.core.mail import EmailMessage
from .models import OTP
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)


def generate_otp():
    otp = ''
    for i in range(6):
        otp += str(random.randint(1, 9))
    return otp


def send_otp(user):
    OTP.objects.filter(user = user).delete()
    code = generate_otp()
    OTP.objects.create(user=user, code=code)
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 30px;">
                
                <h2 style="color: #333;">Verify Your Email</h2>
                <p style="color: #555;">Use the OTP below to verify your account. It expires in <strong>5 minutes.</strong></p>
                
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                            text-align: center; background: #f0f0f0; 
                            padding: 20px; border-radius: 8px; margin: 20px 0;">
                    {code}
                </div>
                
                <p style="color: #999; font-size: 12px;">
                    If you didn't request this, please ignore this email.
                </p>

            </div>
        </body>
    </html>
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    email = EmailMessage(
        subject='Verify Your Email',
        body=html_content,
        from_email= from_email,
        to=[user.email]
    )
    email.content_subtype = 'html'  # this line makes it render as HTML
    try:
        email.send()
    except Exception:
        logger.exception('Failed to send verification email to %s', user.email)


def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_link = f'{frontend_url}/reset-password/{uid}/{token}'

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 30px;">

                <h2 style="color: #333;">Reset Your Password</h2>
                <p style="color: #555;">Click the button below to create a new password for your account.</p>

                <p style="text-align: center; margin: 28px 0;">
                    <a href="{reset_link}" style="background: #111827; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
                        Reset Password
                    </a>
                </p>

                <p style="color: #555; font-size: 14px;">If the button does not work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb; font-size: 14px;">{reset_link}</p>

                <p style="color: #999; font-size: 12px;">
                    If you did not request this, you can safely ignore this email.
                </p>

            </div>
        </body>
    </html>
    """

    email = EmailMessage(
        subject='Reset Your Password',
        body=html_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email]
    )
    email.content_subtype = 'html'
    try:
        email.send()
    except Exception:
        logger.exception('Failed to send password reset email to %s', user.email)
