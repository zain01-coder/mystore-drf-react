import os
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from category.models import Category
from store.models import Product


class Command(BaseCommand):
    help = 'Seed products with downloaded placeholder images'

    def handle(self, *args, **kwargs):

        Product.objects.all().delete()
        self.stdout.write('Deleted existing products...')

        products_data = [

            # ── ELECTRONICS ──
            {'product_name': 'Samsung Galaxy S24', 'slug': 'samsung-galaxy-s24', 'price': 999.99, 'category': 'Electronics', 'description': 'Latest Samsung flagship with AI features.', 'stock': 50, 'is_available': True, 'is_sale': True, 'sale_price': 849.99, 'image_id': 1056},
            {'product_name': 'Apple iPhone 15', 'slug': 'apple-iphone-15', 'price': 1099.99, 'category': 'Electronics', 'description': 'Apple iPhone 15 with A16 Bionic chip.', 'stock': 40, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 160},
            {'product_name': 'Sony WH-1000XM5 Headphones', 'slug': 'sony-wh-1000xm5', 'price': 349.99, 'category': 'Electronics', 'description': 'Industry leading noise cancelling headphones.', 'stock': 30, 'is_available': True, 'is_sale': True, 'sale_price': 279.99, 'image_id': 250},
            {'product_name': 'Dell XPS 15 Laptop', 'slug': 'dell-xps-15', 'price': 1799.99, 'category': 'Electronics', 'description': 'Premium laptop with OLED display.', 'stock': 20, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 180},
            {'product_name': 'Apple iPad Pro 12.9', 'slug': 'apple-ipad-pro-12', 'price': 1299.99, 'category': 'Electronics', 'description': 'Powerful iPad with M2 chip.', 'stock': 25, 'is_available': True, 'is_sale': True, 'sale_price': 1099.99, 'image_id': 201},
            {'product_name': 'Samsung 4K Smart TV 55"', 'slug': 'samsung-4k-tv-55', 'price': 799.99, 'category': 'Electronics', 'description': '55 inch 4K QLED Smart TV with HDR.', 'stock': 15, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 326},
            {'product_name': 'Canon EOS R50 Camera', 'slug': 'canon-eos-r50', 'price': 679.99, 'category': 'Electronics', 'description': 'Mirrorless camera perfect for beginners.', 'stock': 18, 'is_available': True, 'is_sale': True, 'sale_price': 579.99, 'image_id': 403},

            # ── BOOKS ──
            {'product_name': 'Atomic Habits', 'slug': 'atomic-habits', 'price': 18.99, 'category': 'Books', 'description': 'Build good habits and break bad ones by James Clear.', 'stock': 100, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 24},
            {'product_name': 'The Alchemist', 'slug': 'the-alchemist', 'price': 14.99, 'category': 'Books', 'description': 'A magical story about following your dreams.', 'stock': 80, 'is_available': True, 'is_sale': True, 'sale_price': 10.99, 'image_id': 42},
            {'product_name': 'Deep Work', 'slug': 'deep-work', 'price': 17.99, 'category': 'Books', 'description': 'Rules for focused success in a distracted world.', 'stock': 60, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 45},
            {'product_name': 'Rich Dad Poor Dad', 'slug': 'rich-dad-poor-dad', 'price': 15.99, 'category': 'Books', 'description': 'Personal finance classic by Robert Kiyosaki.', 'stock': 90, 'is_available': True, 'is_sale': True, 'sale_price': 11.99, 'image_id': 48},
            {'product_name': 'Clean Code', 'slug': 'clean-code', 'price': 39.99, 'category': 'Books', 'description': 'A handbook of agile software craftsmanship.', 'stock': 45, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 51},
            {'product_name': 'The Psychology of Money', 'slug': 'psychology-of-money', 'price': 16.99, 'category': 'Books', 'description': 'Timeless lessons on wealth and happiness.', 'stock': 70, 'is_available': True, 'is_sale': True, 'sale_price': 12.99, 'image_id': 54},
            {'product_name': 'Sapiens', 'slug': 'sapiens', 'price': 19.99, 'category': 'Books', 'description': 'A brief history of humankind by Yuval Noah Harari.', 'stock': 55, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 57},

            # ── MEN CLOTHING ──
            {'product_name': 'Slim Fit Chino Pants', 'slug': 'slim-fit-chino-pants', 'price': 49.99, 'category': 'Men Clothing', 'description': 'Classic slim fit chinos for casual and office wear.', 'stock': 60, 'is_available': True, 'is_sale': True, 'sale_price': 34.99, 'image_id': 342},
            {'product_name': 'Oxford Button Down Shirt', 'slug': 'oxford-button-down-shirt', 'price': 39.99, 'category': 'Men Clothing', 'description': 'Crisp Oxford weave shirt for a smart casual look.', 'stock': 75, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 350},
            {'product_name': 'Leather Biker Jacket', 'slug': 'leather-biker-jacket', 'price': 149.99, 'category': 'Men Clothing', 'description': 'Genuine leather jacket with quilted shoulder detail.', 'stock': 30, 'is_available': True, 'is_sale': True, 'sale_price': 119.99, 'image_id': 355},
            {'product_name': 'Classic White Sneakers', 'slug': 'classic-white-sneakers', 'price': 69.99, 'category': 'Men Clothing', 'description': 'Minimalist white sneakers that go with everything.', 'stock': 50, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 358},
            {'product_name': 'Merino Wool Sweater', 'slug': 'merino-wool-sweater', 'price': 89.99, 'category': 'Men Clothing', 'description': 'Soft and warm merino wool crewneck sweater.', 'stock': 40, 'is_available': True, 'is_sale': True, 'sale_price': 69.99, 'image_id': 360},
            {'product_name': 'Cargo Shorts', 'slug': 'cargo-shorts-men', 'price': 34.99, 'category': 'Men Clothing', 'description': 'Durable cargo shorts with multiple pockets.', 'stock': 65, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 365},
            {'product_name': 'Formal Blazer', 'slug': 'formal-blazer-men', 'price': 129.99, 'category': 'Men Clothing', 'description': 'Sharp single breasted blazer for formal occasions.', 'stock': 25, 'is_available': True, 'is_sale': True, 'sale_price': 99.99, 'image_id': 370},

            # ── WOMEN CLOTHING ──
            {'product_name': 'Floral Wrap Dress', 'slug': 'floral-wrap-dress', 'price': 59.99, 'category': 'Women Clothing', 'description': 'Elegant floral wrap dress perfect for any occasion.', 'stock': 55, 'is_available': True, 'is_sale': True, 'sale_price': 44.99, 'image_id': 375},
            {'product_name': 'High Waist Yoga Pants', 'slug': 'high-waist-yoga-pants', 'price': 44.99, 'category': 'Women Clothing', 'description': 'Comfortable high waist leggings for yoga and everyday wear.', 'stock': 80, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 380},
            {'product_name': 'Oversized Knit Cardigan', 'slug': 'oversized-knit-cardigan', 'price': 64.99, 'category': 'Women Clothing', 'description': 'Cozy oversized cardigan in neutral tones.', 'stock': 45, 'is_available': True, 'is_sale': True, 'sale_price': 49.99, 'image_id': 385},
            {'product_name': 'Satin Slip Skirt', 'slug': 'satin-slip-skirt', 'price': 39.99, 'category': 'Women Clothing', 'description': 'Elegant satin slip skirt with a bias cut.', 'stock': 60, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 390},
            {'product_name': 'Denim Jacket', 'slug': 'denim-jacket-women', 'price': 79.99, 'category': 'Women Clothing', 'description': 'Classic denim jacket with a relaxed fit.', 'stock': 50, 'is_available': True, 'is_sale': True, 'sale_price': 59.99, 'image_id': 395},
            {'product_name': 'Linen Blazer', 'slug': 'linen-blazer-women', 'price': 99.99, 'category': 'Women Clothing', 'description': 'Lightweight linen blazer for a polished summer look.', 'stock': 35, 'is_available': True, 'is_sale': False, 'sale_price': 0, 'image_id': 400},
            {'product_name': 'Printed Midi Dress', 'slug': 'printed-midi-dress', 'price': 69.99, 'category': 'Women Clothing', 'description': 'Vibrant printed midi dress with a flattering silhouette.', 'stock': 40, 'is_available': True, 'is_sale': True, 'sale_price': 54.99, 'image_id': 407},
        ]

        for item in products_data:
            try:
                category = Category.objects.get(category_name=item['category'])

                # Download image from Picsum
                image_url = f"https://picsum.photos/id/{item['image_id']}/400/400"
                self.stdout.write(f"Downloading image for: {item['product_name']}...")
                response = requests.get(image_url, timeout=10)

                if response.status_code == 200:
                    image_content = ContentFile(response.content)
                    image_filename = f"{item['slug']}.jpg"

                    product = Product(
                        product_name=item['product_name'],
                        slug=item['slug'],
                        price=item['price'],
                        category=category,
                        description=item['description'],
                        stock=item['stock'],
                        is_available=item['is_available'],
                        is_sale=item['is_sale'],
                        sale_price=item['sale_price'],
                    )

                    # Save image to media/uploads/product/
                    product.image.save(image_filename, image_content, save=True)
                    self.stdout.write(self.style.SUCCESS(f"✔ Created: {item['product_name']}"))

                else:
                    self.stdout.write(self.style.WARNING(f"⚠ Image download failed for {item['product_name']}, skipping image..."))

            except Category.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"✘ Category not found: {item['category']}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"✘ Error creating {item['product_name']}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS('\nAll products seeded successfully!'))