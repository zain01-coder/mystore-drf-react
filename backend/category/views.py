from django.shortcuts import render
from rest_framework import generics
from .serializers import CategorySerializer
from .models import Category
from django.db.models import Count
# Create your views here.



class CategoryListAPIView(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.annotate(
        product_count=Count('category')
    ).all()
