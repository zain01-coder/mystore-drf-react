import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './cart.css'
import '../assets/global/style.css'
import api from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { showToast } from '../utils/toast'
import { useCart } from '../context/CartContext'



const Cart = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { refreshCart } = useCart()

  const subtotal = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
  const tax = subtotal * 0.02
  const total = subtotal + tax

  const fetchProduct = async () => {
    try {
      const response = await api.get(`cart/`)
      setItems(response.data)
    } catch {
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {

    fetchProduct()
  }, [])


  const handleIncrease = async (id) => {
    try {
      await api.post(`cart/increase/${id}/`)
      fetchProduct()
      refreshCart()
    } catch {
      showToast('Could not update quantity', 'error')
    }
  }


  const handleDecrease = async (id) => {
    try {
      await api.post(`cart/decrease/${id}/`)
      fetchProduct()
      refreshCart()
    } catch {
      showToast('Could not update quantity', 'error')
    }
  }


  const handleRemove = async (id) => {
    try {
      await api.delete(`cart/remove/${id}/`)
      fetchProduct()
      refreshCart()
      showToast('Item removed from cart', 'success')
    } catch {
      showToast('Could not remove item', 'error')
    }
  }



  const handleClear = async () => {
    try {
      await api.delete(`cart/clear/`)
      fetchProduct()
      refreshCart()
      showToast('Cart cleared', 'success')
    } catch {
      showToast('Could not clear cart', 'error')
    }
  }



  if (loading) return <Loader label="Loading cart..." />
  if (error) return <p>{error}</p>

  return (
    <main className="cart-page commerce-page">
      <div className="container-xl px-3 px-md-4 pt-4 my-5 cart-container">

        {/* ── Page title + checkout steps ── */}
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-heading">Shopping Cart</h1>
            <p className="page-subtext mb-0">Review your items before checkout</p>
          </div>

          {/* Checkout progress (desktop only) */}
          <div className="checkout-steps flex-shrink-0 d-none d-sm-flex">
            <div className="step active">
              <div className="step-dot">1</div>
              <span>Cart</span>
            </div>
            <div className="step-line mx-2"></div>
            <div className="step">
              <div className="step-dot">2</div>
              <span>Checkout</span>
            </div>
            <div className="step-line mx-2"></div>
            <div className="step">
              <div className="step-dot">3</div>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div id="cart-filled">
            <div className="row g-4 align-items-start">

              {/* ── LEFT: Cart Items ── */}
              <div className="col-12 col-lg-8">

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="section-label">{items.length} items in your cart</span>
                  <button className="btn-remove clear-cart-btn" id="clearCartBtn" aria-label="Clear cart" onClick={handleClear}>
                    <i className="bi bi-trash3"></i> Clear all
                  </button>
                </div>

                {/* Cart Items Card */}
                <div className="card-white p-4 mb-4">

                  {items.map((item) => {
                    const product = item.product
                    const productUrl = `/store/category/${product.category_slug}/${product.slug}`

                    return (
                      <div className="cart-item" data-item-id={item.id} key={item.id}>
                        <Link to={productUrl}>
                          <img src={product.image} className="cart-img" alt={product.product_name} />
                        </Link>

                        <div className="flex-grow-1 min-width-0">
                          <div className="item-cat">{product.category_name}</div>

                          <Link to={productUrl}>
                            <div className="item-name">{product.product_name}</div>
                          </Link>
                          {item.variation.map(variation => (
                            <p key={variation.id}>
                              {variation.variation_category}: {variation.variation_value}
                            </p>
                          ))}

                          <div className="d-flex align-items-center flex-wrap gap-3">
                            <div className="qty-wrap" role="group" aria-label="Quantity">
                              <button className="qty-btn qty-minus" aria-label="Decrease" onClick={() => handleDecrease(item.id)}>
                                <i className="bi bi-dash"></i>
                              </button>

                              <input className="qty-input" type="number" value={item.quantity} min="1" max="99" aria-label="Quantity" readOnly />

                              <button type="button" className="qty-btn qty-plus" aria-label="Increase" onClick={() => handleIncrease(item.id)}>
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                            <div className="item-unit-price">Rs. {item.unit_price} each</div>
                          </div>
                        </div>

                        <div className="d-flex flex-column align-items-end gap-2 flex-shrink-0">
                          <button className="btn-remove" aria-label="Remove item" data-item-id={item.id} onClick={() => { handleRemove(item.id) }}>
                            <i className="bi bi-trash3"></i>
                          </button>
                          <div className="item-total">Rs. {item.total_price}</div>
                        </div>
                      </div>
                    )
                  })}

                </div>{/* /cart items card */}

                

                <Link to="/store" className="btn-continue">
                  <i className="bi bi-arrow-left"></i> Continue Shopping
                </Link>

              </div>{/* /col left */}

              {/* ── RIGHT: Order Summary ── */}
              <div className="col-12 col-lg-4">
                <div className="summary-sticky">

                  {/* Summary card */}
                  <div className="card-white p-4 mb-3">
                    <h2 className="summary-heading">Order Summary</h2>

                    <div className="summary-row">
                      <span>Subtotal <span className="summary-qty-label">({items.length} items)</span></span>
                      <span id="subtotal-display" className="summary-value">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className="badge-shipping">Free</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax <span className="summary-qty-label">(2%)</span></span>
                      <span id="tax-display" className="summary-value">Rs. {tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Discount</span>
                      <span id="discount-display" className="summary-discount">—</span>
                    </div>

                    <hr className="summary-divider" />

                    <div className="summary-row total">
                      <span>Total</span>
                      <span id="total-display">Rs. {total.toFixed(2)}</span>
                    </div>

                    <button onClick={() => { 
                      if (isAuthenticated()){
                        navigate('/checkout')
                      }
                      else{
                        navigate('/login', {state:{from: '/cart'}})
                      }
                    }} className="btn-checkout mt-4 text-decoration-none" id="checkoutBtn">
                      <i className="bi bi-lock-fill"></i> Proceed to Checkout
                    </button>

                    {/* Trust badges */}
                    <div className="trust-badges-wrap d-flex flex-column gap-2 mt-3 pt-3">
                      <div className="trust-badge">
                        <i className="bi bi-shield-lock-fill trust-icon-green"></i>
                        <span>SSL-encrypted checkout</span>
                      </div>
                      <div className="trust-badge">
                        <i className="bi bi-arrow-counterclockwise trust-icon-blue"></i>
                        <span>Free 30-day returns</span>
                      </div>
                      <div className="trust-badge">
                        <i className="bi bi-truck trust-icon-accent"></i>
                        <span>Delivery in 2–3 business days</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment icons */}
                  <div className="card-white px-4 py-3">
                    <div className="section-label mb-2">We accept</div>
                    <div className="d-flex flex-wrap gap-2">
                      <div className="payment-badge">Visa</div>
                      <div className="payment-badge">Mastercard</div>
                      <div className="payment-badge">PayPal</div>
                      <div className="payment-badge">Stripe</div>
                      <div className="payment-badge">Apple Pay</div>
                    </div>
                  </div>

                </div>
              </div>{/* /col right */}

            </div>{/* /row */}
          </div>
        ) : (
          <div id="cart-empty">
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="card-white">
                  <div className="empty-state">
                    <div className="empty-icon-wrap">
                      <i className="bi bi-bag-x"></i>
                    </div>
                    <h2 className="empty-title">Your cart is empty</h2>
                    <p className="empty-sub">
                      Looks like you haven't added anything yet.<br />
                      Start exploring and find something you love.
                    </p>
                    <Link to="/store" className="btn-shop-now">
                      <i className="bi bi-bag-heart-fill"></i> Continue Shopping
                    </Link>
                    <div className="popular-section mt-4 pt-2">
                      <p className="popular-label">Popular right now</p>
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        <Link to="/store/category/electronics" className="popular-tag">Electronics</Link>
                        <Link to="/store/category/fashion" className="popular-tag">Fashion</Link>
                        <Link to="/store/category/home-living" className="popular-tag">Home &amp; Living</Link>
                        <Link to="/store/category/sports" className="popular-tag">Sports</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>{/* /container */}
    </main>
  )
}

export default Cart
