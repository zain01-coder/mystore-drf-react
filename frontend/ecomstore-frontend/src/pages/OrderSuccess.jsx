import React, { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'

const OrderSuccess = () => {
    const { orderNumber } = useParams()
    const [searchParams] = useSearchParams()
    const { refreshCart } = useCart()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [confirmed, setConfirmed] = useState(false)

    useEffect(() => {
        const redirectStatus = searchParams.get('redirect_status')

        const confirmAndFetch = async () => {
            if (redirectStatus && redirectStatus !== 'succeeded') {
                setConfirmed(false)
                setLoading(false)
                return
            }

            try {
                await api.post(`order/${orderNumber}/confirm/`)
            } catch {
                // confirm/ failing doesn't necessarily mean payment failed (e.g. already
                // confirmed by the webhook) — the order status fetched below is authoritative.
            }
            try {
                const response = await api.get(`order/${orderNumber}/`)
                setOrder(response.data)
                const isCompleted = response.data.status === 'Completed'
                setConfirmed(isCompleted)
                if (isCompleted) {
                    refreshCart()
                }
            } catch {
                setOrder(null)
                setConfirmed(false)
            } finally {
                setLoading(false)
            }
        }
        confirmAndFetch()
    }, [orderNumber, searchParams])

    if (loading) {
        return (
            <main>
                <div className="container-xl px-3 px-md-4 pt-4 my-5" style={{ maxWidth: '700px' }}>
                    <div className="card-white p-4 p-md-5 text-center">
                        <p className="page-subtext mb-0">Confirming your payment…</p>
                    </div>
                </div>
            </main>
        )
    }

    if (!confirmed) {
        return (
            <main>
                <div className="container-xl px-3 px-md-4 pt-4 my-5" style={{ maxWidth: '700px' }}>
                    <div className="card-white p-4 p-md-5 text-center">
                        <div className="empty-icon-wrap mb-3">
                            <i className="bi bi-x-circle-fill" style={{ color: '#dc2626' }}></i>
                        </div>
                        <h1 className="page-heading mb-2">Payment Not Completed</h1>
                        <p className="page-subtext mb-3">
                            We couldn't confirm payment for this order. If you were charged, it will be
                            confirmed automatically shortly; otherwise please try again.
                        </p>
                        <Link to="/checkout" className="btn-shop-now">
                            <i className="bi bi-arrow-repeat"></i> Try Again
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main>
            <div className="container-xl px-3 px-md-4 pt-4 my-5" style={{ maxWidth: '700px' }}>
                <div className="card-white p-4 p-md-5 text-center">
                    <div className="empty-icon-wrap mb-3">
                        <i className="bi bi-check-circle-fill" style={{ color: '#059669' }}></i>
                    </div>
                    <h1 className="page-heading mb-2">Order Placed Successfully</h1>

                    {orderNumber ? (
                        <>
                            <p className="page-subtext mb-1">Your order number is:</p>
                            <p className="fw-bold mb-3">{orderNumber}</p>
                            {order && (
                                <p className="page-subtext mb-3">
                                    Order total: Rs. {(Number(order.order_total) + Number(order.tax)).toFixed(2)}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="page-subtext mb-3">Thank you for your order.</p>
                    )}

                    <Link to="/" className="btn-shop-now">
                        <i className="bi bi-bag-heart-fill"></i> Continue Shopping
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default OrderSuccess
