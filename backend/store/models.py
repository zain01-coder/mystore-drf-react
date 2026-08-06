from django.db import models
from django.db.models import Avg
from django.core.validators import MaxValueValidator, MinValueValidator
from category.models import Category
from accounts.models import Account
# Create your models here.


class Product(models.Model):
    product_name    = models.CharField(max_length=100)
    slug            = models.SlugField()
    price           = models.DecimalField(default=0, decimal_places=2, max_digits=8)
    category        = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='category')
    description     = models.TextField(max_length=500, default='', blank=True, null=True)
    image           = models.ImageField(upload_to='uploads/product/')
    stock           = models.IntegerField()
    is_available    = models.BooleanField(default=True)
    is_sale         = models.BooleanField(default=False)
    sale_price      = models.DecimalField(default=0, decimal_places=2, max_digits=6)
    created_date    = models.DateTimeField(auto_now_add=True)
    modified_at     = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.product_name


    def averageReview(self):
        reviews = ReviewRating.objects.filter(product=self, status=True).aggregate(average=Avg('rating'))
        avg = reviews['average']
        return float(avg) if avg else 0

    def countReview(self):
        return ReviewRating.objects.filter(product=self, status=True).count()

    @property
    def discount_percentage(self):
        if self.is_sale and self.sale_price and self.price:
            if self.price > 0 and self.sale_price < self.price:
                discount = ((self.price - self.sale_price) / self.price) * 100
                return round(discount, 0)
        return 0



class ProductImage(models.Model):
    """Extra gallery shots for a product.

    Product.image stays the primary image used in listings, cart and orders;
    this holds only the *additional* photos shown on the detail page, so there
    is never any ambiguity about which one is the main image.
    """
    product      = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image        = models.ImageField(upload_to='uploads/product/')
    display_order = models.PositiveIntegerField(default=0)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f'{self.product.product_name} image {self.display_order}'


class VariationManager(models.Manager):
    def colors(self):
        return super(VariationManager, self).filter(variation_category = 'color', is_active=True)
    
    def sizes(self):
        return super(VariationManager, self).filter(variation_category = 'size', is_active=True)


variation_category_choice = (
    ('color', 'color'),
    ('size', 'size')
)

class Variation(models.Model):
    product             = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variations')
    variation_category  = models.CharField(max_length=100, choices=variation_category_choice)
    variation_value     = models.CharField(max_length=100)
    is_active           = models.BooleanField(default=True)
    created_at          = models.DateTimeField(auto_now=True)

    objects = VariationManager()

    def __str__(self):
        return f'{self.variation_category} {self.variation_value}'



RATING_CHOICES = (
    (1, '1'),
    (2, '2'),
    (3, '3'),
    (4, '4'),
    (5, '5'),
)




class ReviewRating(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='reviews')
    subject = models.CharField(max_length=100, blank=True)
    review = models.TextField(blank=True)
    rating = models.IntegerField(choices=RATING_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    status = models.BooleanField(default=True)
    ip = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return self.subject or f'{self.product} - {self.user}'

