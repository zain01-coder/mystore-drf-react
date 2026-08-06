from django.shortcuts import render
from .models import Wishlist
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import WishlistSerializer
# Create your views here.



class WishlistListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user = self.request.user)

    def perform_create(self, serializer):
        serializer.save(user = self.request.user)




class WishlistDestroyAPIView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistSerializer
    lookup_field = 'product_id'
    lookup_url_kwarg = 'product_id'

    def get_queryset(self):
        return Wishlist.objects.filter(user = self.request.user)


class WishlistClearAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        Wishlist.objects.filter(user = request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)










