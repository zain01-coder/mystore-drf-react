import uuid
from django.core.mail import EmailMessage
from django.conf import settings


def generate_order_number():
    return uuid.uuid4().hex[:20]



def order_confirmed_email(order):
    grand_total = order.order_total + order.tax

    item_rows = ''
    for order_product in order.orderproduct_set.all():
        product_name = order_product.product.product_name if order_product.product else 'Deleted product'
        variations = ', '.join(
            f'{v.variation_category}: {v.variation_value}' for v in order_product.variation.all()
        )
        line_total = order_product.quantity * order_product.product_price

        item_rows += f'''
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold; color: #333;">{product_name}</div>
                {f'<div style="color: #999; font-size: 12px;">{variations}</div>' if variations else ''}
                <div style="color: #999; font-size: 12px;">Qty: {order_product.quantity} &times; Rs.{order_product.product_price}</div>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #333;">
                Rs.{line_total:.2f}
            </td>
        </tr>
        '''

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 30px;">

                <h2 style="color: #333;">Order Confirmed</h2>
                <p style="color: #555;">Thanks for your order! Here's a summary of what you purchased.</p>

                <p style="color: #555; margin-bottom: 4px;">Order Number</p>
                <p style="font-weight: bold; font-size: 18px; margin-top: 0;">{order.order_number}</p>

                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    {item_rows}
                </table>

                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr>
                        <td style="padding: 4px 0; color: #555;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; color: #555;">Rs.{order.order_total:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #555;">Tax</td>
                        <td style="padding: 4px 0; text-align: right; color: #555;">Rs.{order.tax:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Total</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid #ddd;">Rs.{grand_total:.2f}</td>
                    </tr>
                </table>

                <p style="color: #555; margin-bottom: 4px; margin-top: 24px;">Shipping to</p>
                <p style="color: #333; margin-top: 0;">
                    {order.first_name} {order.last_name}<br>
                    {order.address_line_1}{f', {order.address_line_2}' if order.address_line_2 else ''}<br>
                    {order.city}, {order.state}<br>
                    {order.country}
                </p>

                <p style="color: #999; font-size: 12px;">
                    If you have any questions about your order, just reply to this email.
                </p>

            </div>
        </body>
    </html>
    """

    email = EmailMessage(
        subject=f'Order Confirmed - {order.order_number}',
        body=html_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[order.email]
    )
    email.content_subtype = 'html'
    email.send()



