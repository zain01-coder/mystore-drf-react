import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import './checkout.css'
import './payment.css'
import api from '../utils/api'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from './CheckoutForm'
import Loader from '../components/Loader'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PAYMENT_FORM_ID = 'stripe-payment-form'

const Payment = () => {
  const { order_number } = useParams()
  const [order, setOrder] = useState([])
  const [clientSecret, setClientSecret] = useState('')
  const [loadError, setLoadError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // StrictMode runs effects twice in dev. Without this guard we fire two
  // create_payment calls and end up paying with a different intent than the
  // one saved on the order.
  const startedFor = useRef(null)

  useEffect(() => {
    if (startedFor.current === order_number) return
    startedFor.current = order_number

    const fetchOrder = async () => {
      try {
            const response = await api.get(`order/${order_number}/`)
            setOrder(response.data)
            const paymentResponse = await api.post('order/create_payment/', { order_number })
            setClientSecret(paymentResponse.data.client_secret)
        } catch {
            setLoadError('This order is no longer available for payment. Please checkout again.')
        }
    }
    fetchOrder()
  }, [order_number])

  const subtotal = order.order_total ? Number(order.order_total) : 0
  const tax = order.tax ? Number(order.tax) : 0
  const total = subtotal + tax
  const itemCount = order.products?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <main className="checkout-page commerce-page">
      <div className="container-xl px-3 px-md-4 pt-4 my-5" style={{ maxWidth: '1200px' }}>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="payment-header-icon">
              <i className="bi bi-credit-card-2-front-fill"></i>
            </div>
            <div>
              <h1 className="page-heading mb-1">Payment</h1>
              <p className="page-subtext mb-0">Review your billing details and complete your payment securely</p>
            </div>
          </div>
          <div className="secure-checkout-badge">
            <i className="bi bi-shield-lock-fill"></i>
            <div>
              <div className="secure-checkout-title">100% Secure Checkout</div>
              <div className="secure-checkout-sub">Your payment information is safe</div>
            </div>
          </div>
        </div>

        <div className="row g-4 align-items-start">
          {/* Left column */}
          <div className="col-12 col-lg-7">
            <div className="card-white p-4 p-md-4 p-lg-5 mb-4">
              <div className="payment-section">
                <div className="payment-section-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-lock-fill payment-section-icon"></i>
                    <div>
                      <h2 className="payment-section-title mb-0">Payment Details</h2>
                      <span className="section-label d-block">Choose your preferred payment method</span>
                    </div>
                  </div>
                </div>

                <div className="payment-method-row payment-method-active">
                  <span className="payment-method-radio"><span className="payment-method-radio-dot"></span></span>
                  <i className="bi bi-credit-card payment-method-icon"></i>
                  <div className="flex-grow-1">
                    <div className="payment-method-name">Card</div>
                    <div className="payment-method-sub">Visa, Mastercard, and other major cards</div>
                  </div>
                  <div className="d-flex gap-1">
                    <span className="payment-pill">Visa</span>
                    <span className="payment-pill">Mastercard</span>
                  </div>
                </div>

                <div className="payment-element-wrap mt-3">
                  {loadError ? (
                    <div className="alert alert-danger mb-0">
                      {loadError}
                      <Link to="/checkout" className="alert-link ms-1">Go to checkout</Link>
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm
                        formId={PAYMENT_FORM_ID}
                        orderNumber={order_number}
                        onProcessingChange={setProcessing}
                        onErrorChange={setPaymentError}
                      />
                    </Elements>
                  ) : (
                    <Loader label="Loading payment options..." />
                  )}
                </div>
              </div>

              <div className="payment-section payment-section-last">
                <div className="payment-section-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-fill payment-section-icon"></i>
                    <div>
                      <h2 className="payment-section-title mb-0">Billing Address</h2>
                      <span className="section-label d-block">Customer billing information</span>
                    </div>
                  </div>
                  <Link to="/checkout" className="btn-edit-address">
                    <i className="bi bi-pencil"></i> Edit
                  </Link>
                </div>

                <div className="billing-info-box">
                  <p className="billing-info-name mb-2">{order.first_name} {order.last_name}</p>
                  <div className="billing-info-row">
                    <i className="bi bi-geo-alt-fill"></i>
                    <span>{order.address_line_1}{order.address_line_2 ? `, ${order.address_line_2}` : ''}<br />{order.city}, {order.state}<br />{order.country}</span>
                  </div>
                  <div className="billing-info-row">
                    <i className="bi bi-envelope-fill"></i>
                    <span>{order.email}</span>
                  </div>
                  <div className="billing-info-row">
                    <i className="bi bi-telephone-fill"></i>
                    <span>{order.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/checkout" className="btn-continue">
              <i className="bi bi-arrow-left"></i> Back to Checkout
            </Link>
          </div>

          {/* Right column */}
          <div className="col-12 col-lg-5">
            <div style={{ position: 'sticky', top: '80px' }}>
              <div className="card-white p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-bag-fill payment-section-icon"></i>
                  <div>
                    <h2 className="order-review-title mb-0">Orders</h2>
                    <span className="section-label d-block">Items included in this payment</span>
                  </div>
                </div>

                <div className="product-review-list mb-3">
                  {order.products?.map((item) => (
                    <div className="review-item" key={item.id}>
                      <img className="review-item-img" src={item.product.image} alt="" />
                      <div className="flex-grow-1 min-width-0">
                        <div className="item-cat">{item.product.category_name}</div>
                        <div className="item-name mb-1">{item.product.product_name}</div>
                        {item.variation.map(v => (
                          <span className="item-meta d-block" key={v.id}>{v.variation_category}: {v.variation_value}</span>
                        ))}
                        <div className="review-meta mt-2">
                          <span>Qty: {item.quantity} &bull; Rs.{item.product_price} each</span>
                        </div>
                      </div>
                      <div className="item-total">Rs.{(item.product_price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <hr className="summary-divider" />

                <div className="d-flex align-items-center gap-2 mb-3 mt-3">
                  <i className="bi bi-receipt payment-section-icon"></i>
                  <h2 className="order-review-title mb-0">Order Summary</h2>
                </div>

                <div className="summary-row">
                  <span>Subtotal <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({itemCount} items)</span></span>
                  <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>Rs.{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="badge-shipping">Free</span>
                </div>
                <div className="summary-row">
                  <span>Tax <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>(2%)</span></span>
                  <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>Rs.{tax.toFixed(2)}</span>
                </div>

                <div className="summary-total-box mt-3">
                  <span>Total</span>
                  <span>Rs.{total.toFixed(2)}</span>
                </div>

                {paymentError && <div className="text-danger mt-3 mb-0">{paymentError}</div>}

                <button
                  type="submit"
                  form={PAYMENT_FORM_ID}
                  disabled={!clientSecret || processing}
                  className="btn-pay-now mt-3"
                >
                  <i className="bi bi-lock-fill"></i>
                  {processing ? 'Processing...' : 'Make Payment'}
                  {!processing && <i className="bi bi-arrow-right"></i>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="trust-banner mt-4">
          <div className="trust-banner-item">
            <div className="trust-banner-icon"><i className="bi bi-shield-check"></i></div>
            <div>
              <div className="trust-banner-title">Secure &amp; Protected</div>
              <div className="trust-banner-sub">Your payment is encrypted and protected with 256-bit SSL</div>
            </div>
          </div>
          <div className="trust-banner-item">
            <div className="trust-banner-icon"><i className="bi bi-patch-check-fill"></i></div>
            <div>
              <div className="trust-banner-title">Review Before Pay</div>
              <div className="trust-banner-sub">Carefully review your order and billing details before payment</div>
            </div>
          </div>
          <div className="trust-banner-item">
            <div className="trust-banner-icon"><i className="bi bi-file-earmark-check-fill"></i></div>
            <div>
              <div className="trust-banner-title">Instant Confirmation</div>
              <div className="trust-banner-sub">You'll receive an instant confirmation once payment is successful</div>
            </div>
          </div>
        </div>

        {/* empty-cart branch */}
        {order.products?.length === 0 && (
          <div className="row justify-content-center mt-4">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card-white">
                <div className="empty-state">
                  <div className="empty-icon-wrap">
                    <i className="bi bi-credit-card-2-front"></i>
                  </div>
                  <h2 className="empty-title">No items available for payment</h2>
                  <p className="empty-sub">
                    There is nothing ready for payment right now.<br />
                    Add products to your cart and complete checkout first.
                  </p>
                  <Link to="/cart" className="btn-shop-now">
                    <i className="bi bi-arrow-left-circle-fill"></i> Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Payment
