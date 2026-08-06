from rest_framework import serializers


class NewsletterSubscribeSerializer(serializers.Serializer):
    email = serializers.EmailField()
