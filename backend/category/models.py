from django.db import models
from django.urls import reverse
# Create your models here.

class Category(models.Model):
    category_name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(max_length=250, blank=True)
    categ_img = models.ImageField(upload_to='uploads/category', blank=True)



    class Meta:
        verbose_name = 'category'
        verbose_name_plural = 'categories'



    def get_url(self):
        return reverse('category_slug', args=[self.slug])

    def __str__(self):
        return self.category_name