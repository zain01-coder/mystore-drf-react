from django.shortcuts import render
from .models import Cart, CartItem
from store.models import Product, Variation
from .serializers import CartItemSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import get_cart
from rest_framework import status
# Create your views here.






@api_view(['POST'])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    variation_ids = request.data.get('variations', [])


    selected_variations = Variation.objects.filter(id__in=variation_ids)
    try:
        product = Product.objects.get(id = product_id)
    except Product.DoesNotExist:
        return Response({'error':'Product does not exists'}, status=status.HTTP_404_NOT_FOUND)    
    
    if quantity > product.stock:
        return Response({'error':"Product is out of stock"}, status=status.HTTP_400_BAD_REQUEST)



    cart = get_cart(request)

    cart_items = CartItem.objects.filter(product = product, cart = cart)


    item_exists = False
    for cartitem in cart_items:
        existing_variations = cartitem.variation.all()
        if set(existing_variations) == set(selected_variations):
            cartitem.quantity += quantity
            cartitem.save()
            item_exists = True
            break

    if not item_exists:
        cart_item = CartItem.objects.create(product=product, cart=cart, quantity=quantity)
        cart_item.variation.set(selected_variations)

    return Response({'message': 'Product added to cart'}, status=status.HTTP_200_OK)




@api_view(['GET'])
def get_cart_items(request):
    try:
        cart = get_cart(request)
        cart_items = CartItem.objects.select_related('product', 'product__category').filter(cart = cart, is_active = True)
        serializer = CartItemSerializer(cart_items, many=True, context={'request':request})
        return Response(serializer.data)
    except Cart.DoesNotExist:
        return Response([])



@api_view(['POST'])
def increase_cart_item(request, id):
    try:
        cart_item = CartItem.objects.get(id = id, cart = get_cart(request))
        cart_item.quantity += 1
        cart_item.save()
        return Response({'message':"Quantity increased successfully"})
    except CartItem.DoesNotExist:
        return Response({'error':'Item not found'}, status=404)


@api_view(['POST'])
def decrease_cart_item(request, id):
    try:
        cart_item = CartItem.objects.get(id=id, cart = get_cart(request))
        if cart_item.quantity > 1:
            cart_item.quantity -= 1
            cart_item.save()
        else:
            cart_item.delete()  # remove item if quantity reaches 0
        return Response({'message': 'Quantity decreased'})
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)
    


@api_view(['DELETE'])
def remove_cart_item(request, id):
    try:
        cart_item = CartItem.objects.get(id=id, cart = get_cart(request))
        cart_item.delete()
        return Response({'message': 'Item removed'})
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)
    


@api_view(['DELETE'])
def clear_cart_items(request):
    cartitems = CartItem.objects.filter(cart = get_cart(request))
    cartitems.delete()
    return Response({'message':'Cart Items Deleted'})

