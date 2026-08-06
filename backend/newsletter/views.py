from django.conf import settings
from django.core.mail import EmailMessage
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import NewsletterSubscribeSerializer


class NewsletterSubscribeAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NewsletterSubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        html_content = """
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #333;">You're subscribed!</h2>
                    <p style="color: #555;">
                        Thanks for signing up to our newsletter. You'll now be the first to hear about
                        exclusive deals, new arrivals, and member-only discounts.
                    </p>
                </div>
            </body>
        </html>
        """

        email_message = EmailMessage(
            subject='Welcome to our Newsletter',
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_message.content_subtype = 'html'
        email_message.send()

        return Response({'detail': 'Subscribed successfully'}, status=status.HTTP_200_OK)
