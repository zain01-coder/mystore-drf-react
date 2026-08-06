from django.db import models
from store.models import Product, Variation
from accounts.models import Account
# Create your models here.


class Cart(models.Model):
    user        = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    cart_id     = models.CharField(max_length=250, blank=True)
    date_added  = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.cart_id


class CartItem(models.Model):
    variation   = models.ManyToManyField(Variation, blank=True, related_name='variations')
    product     = models.ForeignKey(Product, models.CASCADE)
    cart        = models.ForeignKey(Cart, models.CASCADE, null=True)
    quantity    = models.IntegerField()
    is_active   = models.BooleanField(default=True)


    @property
    def unit_price(self):
        if self.product.is_sale and self.product.sale_price:
            return self.product.sale_price
        return self.product.price
    
    @property
    def total_price(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return self.product