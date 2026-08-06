import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './checkout.css'
import api from '../utils/api'
import Loader from '../components/Loader'
import { showToast } from '../utils/toast'

const Checkout = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [defaultAddress, setDefaultAddress] = useState(null)
    const [useNewAddress, setUseNewAddress] = useState(false)

    const navigate = useNavigate()

    const noItems = () => {
        if (items.length <= 0) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await api.get('cart/')
                setItems(response.data)
            } catch {
                setError('Product not found')
            } finally {
                setLoading(false)
            }
        }

        const fetchDefaultAddress = async () => {
            try {
                const response = await api.get('address/')
                const defaultAddr = response.data.find((a) => a.is_default) || null
                setDefaultAddress(defaultAddr)
                setUseNewAddress(!defaultAddr)
            } catch {
                setUseNewAddress(true)
            }
        }

        fetchCart()
        fetchDefaultAddress()
    }, [])


    const handlePlaceOrder = async (e) => {
        e.preventDefault()
        setSubmitError('')
        setSubmitting(true)

        try {
            const formData = new FormData(e.target)
            let payload = Object.fromEntries(formData.entries())

            if (!useNewAddress && defaultAddress) {
                payload = {
                    ...payload,
                    first_name: defaultAddress.first_name,
                    last_name: defaultAddress.last_name,
                    phone: defaultAddress.phone,
                    address_line_1: defaultAddress.address_line_1,
                    address_line_2: defaultAddress.address_line_2,
                    country: defaultAddress.country,
                    state: defaultAddress.state,
                    city: defaultAddress.city,
                }
            } else if (formData.get('save_address')) {
                try {
                    await api.post('address/', {
                        first_name: payload.first_name,
                        last_name: payload.last_name,
                        phone: payload.phone,
                        address_line_1: payload.address_line_1,
                        address_line_2: payload.address_line_2,
                        country: payload.country,
                        state: payload.state,
                        city: payload.city,
                    })
                    showToast('Address saved for next time', 'success')
                } catch {
                    // Non-critical — don't block order placement over this.
                }
            }


            const response = await api.post('order/place/', payload)

            navigate(`/payment/${response.data.order_number}`)
        } catch (err) {
            const message =
                err.response?.data?.non_field_errors?.[0] ||
                err.response?.data?.detail ||
                'Could not place order. Please try again.'

            setSubmitError(message)
        } finally {
            setSubmitting(false)
        }
    }



    return (
        <main className="checkout-page commerce-page">
            <div className="container-xl px-3 px-md-4 pt-4 my-5" style={{ maxWidth: '1200px' }}>
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                    <div>
                        <h1 className="page-heading">Checkout</h1>
                        <p className="page-subtext mb-0">Add your billing details and review your order before placing it</p>
                    </div>
                    <div className="checkout-steps flex-shrink-0 d-none d-sm-flex">
                        <div className="step done">
                            <div className="step-dot"><i className="bi bi-check-lg"></i></div>
                            <span>Cart</span>
                        </div>
                        <div className="step-line mx-2"></div>
                        <div className="step active">
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

                {loading ? (
                    <Loader label="Loading checkout..." />
                ) : !noItems() ? (
                    <div className="row g-4 align-items-start">
                        <div className="col-12 col-lg-7">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <span className="section-label">Billing Address</span>
                                <span className="billing-note">{items.length} item(s) ready for checkout</span>
                            </div>

                            <div className="card-white p-4 p-md-4 p-lg-5">
                                {submitError && (
                                    <div className="alert alert-danger">{submitError}</div>
                                )}
                                {defaultAddress && !useNewAddress && (
                                    <div className="default-address-card mb-4">
                                        <div className="default-address-top">
                                            <span className="section-label mb-0">Deliver to</span>
                                            <span className="addr-badge badge-default">
                                                <i className="bi bi-check-circle-fill"></i> Default
                                            </span>
                                        </div>
                                        <div className="default-address-name">{defaultAddress.first_name} {defaultAddress.last_name}</div>
                                        <div className="default-address-text">
                                            {defaultAddress.address_line_1}
                                            {defaultAddress.address_line_2 ? `, ${defaultAddress.address_line_2}` : ''}, {defaultAddress.city}, {defaultAddress.state}, {defaultAddress.country}
                                        </div>
                                        <div className="default-address-phone"><i className="bi bi-telephone-fill"></i> {defaultAddress.phone}</div>
                                        <button type="button" className="btn-continue mt-3" onClick={() => setUseNewAddress(true)}>
                                            Use a different address
                                        </button>
                                    </div>
                                )}

                                <form className="billing-form" id="billing-form" onSubmit={handlePlaceOrder}>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="email" className="form-label">Email Address</label>
                                            <input type="email" className="form-control" id="email" name="email"
                                                placeholder="Enter email address" required />
                                        </div>

                                        {(useNewAddress || !defaultAddress) && (
                                            <>
                                                <div className="col-12 col-md-6">
                                                    <label htmlFor="first_name" className="form-label">First Name</label>
                                                    <input type="text" className="form-control" id="first_name" name="first_name"
                                                        placeholder="Enter first name" required />
                                                </div>

                                                <div className="col-12 col-md-6">
                                                    <label htmlFor="last_name" className="form-label">Last Name</label>
                                                    <input type="text" className="form-control" id="last_name" name="last_name"
                                                        placeholder="Enter last name" required />
                                                </div>

                                                <div className="col-12 col-md-6">
                                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                                    <input type="text" className="form-control" id="phone" name="phone"
                                                        placeholder="Enter phone number" required />
                                                </div>

                                                <div className="col-12">
                                                    <div className="row g-3">
                                                        <div className="col-12 col-md-4">
                                                            <label htmlFor="city" className="form-label">City</label>
                                                            <input type="text" className="form-control" id="city" name="city" placeholder="City"
                                                                required />
                                                        </div>

                                                        <div className="col-12 col-md-4">
                                                            <label htmlFor="state" className="form-label">State</label>
                                                            <input type="text" className="form-control" id="state" name="state"
                                                                placeholder="State" required />
                                                        </div>

                                                        <div className="col-12 col-md-4">
                                                            <label htmlFor="country" className="form-label">Country</label>
                                                            <input type="text" className="form-control" id="country" name="country"
                                                                placeholder="Country" required />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <label htmlFor="address_line_1" className="form-label">Address Line 1</label>
                                                    <textarea className="form-control form-control-area" id="address_line_1" name="address_line_1"
                                                        rows="3" placeholder="House number, street, area, and any delivery details"
                                                        required></textarea>
                                                </div>

                                                <div className="col-12">
                                                    <label htmlFor="address_line_2" className="form-label">Address Line 2</label>
                                                    <input type="text" className="form-control" id="address_line_2" name="address_line_2"
                                                        placeholder="Apartment, suite, landmark, or optional extra details" />
                                                </div>

                                                <div className="col-12">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" id="save_address" name="save_address" />
                                                        <label className="form-check-label" htmlFor="save_address">
                                                            Save this address for next time
                                                        </label>
                                                    </div>
                                                </div>

                                                {defaultAddress && (
                                                    <div className="col-12">
                                                        <button type="button" className="btn-continue" onClick={() => setUseNewAddress(false)}>
                                                            Use my default address instead
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div className="col-12">
                                            <label htmlFor="order_note" className="form-label">Order Note</label>
                                            <textarea className="form-control form-control-area" id="order_note" name="order_note"
                                                rows="4"
                                                placeholder="Add any notes for your order, delivery, or special instructions"></textarea>
                                        </div>

                                        <div className="col-12">
                                            <div className="checkout-actions">
                                                <Link to="/cart" className="btn-continue">
                                                    <i className="bi bi-arrow-left"></i> Back to Cart
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="col-12 col-lg-5">
                            <div style={{ position: 'sticky', top: '80px' }}>
                                <div className="card-white p-4 mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h2 className="order-review-title mb-0">Order Review</h2>
                                        <span className="section-label mb-0">{items.length} items</span>
                                    </div>

                                    <div className="product-review-list">
                                        {items.map((item) => {
                                            return (

                                                <div className="review-item" key={item.id}>
                                                    <img src={item.product.image} className="review-item-img" alt={item.product.product_name} />
                                                    <div className="flex-grow-1 min-width-0">
                                                        <div className="item-cat">{item.product.category}</div>
                                                        <div className="item-name mb-1">{item.product.product_name}</div>

                                                        {item.variation.map(variation => (
                                                            <p key={variation.id}>
                                                                {variation.variation_category}: {variation.variation_value}
                                                            </p>
                                                        ))}

                                                        <div className="review-meta mt-2">
                                                            <span>{item.quantity}</span>
                                                            <span>Rs.{item.unit_price} each</span>
                                                        </div>
                                                    </div>
                                                    <div className="item-total">Rs.{item.total_price}</div>
                                                </div>
                                            )
                                        })}

                                    </div>

                                    <button className="btn-checkout mt-4" disabled={noItems() || submitting} type="submit" form="billing-form">
                                        <i className="bi bi-bag-check-fill"></i> {submitting ? 'Placing Order...' : 'Place Order'}
                                    </button>

                                    <div className="d-flex flex-column gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                        <div className="trust-badge">
                                            <i className="bi bi-shield-lock-fill" style={{ color: '#059669' }}></i>
                                            <span>Your billing details stay protected</span>
                                        </div>
                                        <div className="trust-badge">
                                            <i className="bi bi-patch-check-fill" style={{ color: 'var(--brand-light)' }}></i>
                                            <span>Review all items before confirmation</span>
                                        </div>
                                        <div className="trust-badge">
                                            <i className="bi bi-truck" style={{ color: 'var(--accent)' }}></i>
                                            <span>Fast delivery after order placement</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            <div className="card-white">
                                <div className="empty-state">
                                    <div className="empty-icon-wrap">
                                        <i className="bi bi-bag-x"></i>
                                    </div>
                                    <h2 className="empty-title">No items available for checkout</h2>
                                    <p className="empty-sub">
                                        Your cart is empty right now.<br />
                                        Add products first, then return here to place your order.
                                    </p>
                                    <Link to="/" className="btn-shop-now">
                                        <i className="bi bi-bag-heart-fill"></i> Continue Shopping
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

export default Checkout
