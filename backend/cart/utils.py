from .models import Cart

def _cart_id(request):
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def get_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user = request.user)
    else:
        cart, _ = Cart.objects.get_or_create(cart_id = _cart_id(request), user__isnull = True)
    return cart