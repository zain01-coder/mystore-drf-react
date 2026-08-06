import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './orders.css'
import '../assets/global/style.css'
import api from '../utils/api'
import Loader from '../components/Loader'


const PLACEHOLDER_IMG = 'https://placehold.co/64x64/e5e7eb/6b7280?text=%20'

// The backend statuses are New / Accepted / Completed / Cancelled. The UI uses
// friendlier wording, so map both the label and the badge colour from one place.
const STATUS_LABEL = {
  New: 'Processing',
  Accepted: 'In Transit',
  Completed: 'Delivered',
  Cancelled: 'Cancelled',
}

const STATUS_BADGE = {
  New: 'badge-processing',
  Accepted: 'badge-transit',
  Completed: 'badge-delivered',
  Cancelled: 'badge-cancelled',
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

const formatMoney = (value) =>
  Number(value).toLocaleString('en-PK', { maximumFractionDigits: 2 })

// product_price is the price frozen onto the order line at checkout, not the
// product's price today.
const lineTotal = (line) => Number(line.product_price) * line.quantity

const orderTotal = (order) => Number(order.order_total) + Number(order.tax)

const countByStatus = (orders, status) =>
  orders.filter((order) => order.status === status).length





const Orders = () => {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12
  let visibleItems = []


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // The backend paginates at 12 per page — follow `next` until it's
        // exhausted so the full order history is available for the
        // client-side status filters and pagination below.
        let results = []
        let url = 'order/list/'

        while (url) {
          const response = await api.get(url)
          results = results.concat(response.data.results)
          url = response.data.next
        }

        setItems(results)
      }
      catch (err) {
        setError("Unable to load your orders. Please try again.")
      }
      finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])


  if (loading) {

    return <Loader label="Loading your orders..." />
  }
  else {
    visibleItems = activeStatus === 'All'
      ? items
      : items.filter((item) => item.status === activeStatus)
  }

  const totalPages = Math.ceil(visibleItems.length / pageSize)
  const pagedItems = visibleItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )



  return (
    <main className="orders-page commerce-page">
      <div className="container-xl px-3 px-md-4 pt-4 my-5" style={{ maxWidth: '1060px' }}>

        {/* ============ Header ============ */}
        <div className="orders-header">
          <div>
            <h1 className="page-heading mb-1">My Orders</h1>
            <p className="page-subtext mb-0">Track your deliveries, view details and reorder in a click.</p>
          </div>


        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {/* ============ Filter tabs + sort ============ */}
        <div className="orders-toolbar">
          <div className="orders-tabs">
            <button
              className={`orders-tab ${activeStatus === 'All' ? 'active' : ''}`}
              onClick={() => { setActiveStatus('All'); setCurrentPage(1) }}
            >
              All Orders <span className="orders-tab-count">{items.length}</span>
            </button>
            <button
              className={`orders-tab ${activeStatus === 'New' ? 'active' : ''}`}
              onClick={() => { setActiveStatus('New'); setCurrentPage(1) }}
            >
              Processing <span className="orders-tab-count">{countByStatus(items, 'New')}</span>
            </button>
            <button
              className={`orders-tab ${activeStatus === 'Accepted' ? 'active' : ''}`}
              onClick={() => { setActiveStatus('Accepted'); setCurrentPage(1) }}
            >
              In Transit <span className="orders-tab-count">{countByStatus(items, 'Accepted')}</span>
            </button>
            <button
              className={`orders-tab ${activeStatus === 'Completed' ? 'active' : ''}`}
              onClick={() => { setActiveStatus('Completed'); setCurrentPage(1) }}
            >
              Delivered <span className="orders-tab-count">{countByStatus(items, 'Completed')}</span>
            </button>
            <button
              className={`orders-tab ${activeStatus === 'Cancelled' ? 'active' : ''}`}
              onClick={() => { setActiveStatus('Cancelled'); setCurrentPage(1) }}
            >
              Cancelled <span className="orders-tab-count">{countByStatus(items, 'Cancelled')}</span>
            </button>
          </div>



        </div>

        {/* ============ Order list ============ */}
        {!error && visibleItems.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon-wrap">
              <i className="bi bi-box-seam"></i>
            </div>
            <h2 className="page-heading mb-2">No orders yet</h2>
            <p className="page-subtext mb-0">Once you place an order it will show up here.</p>
          </div>
        ) : (
          <div className="orders-list">
            {pagedItems.map((item) => (
              <article className="order-card" key={item.order_number}>

                <div className="order-card-head">
                  <div className="order-head-meta">
                    <div className="order-head-block">
                      <span className="order-head-label">Order</span>
                      <span className="order-head-value">{item.order_number}</span>
                    </div>
                    <div className="order-head-block">
                      <span className="order-head-label">Placed on</span>
                      <span className="order-head-value">{formatDate(item.created_at)}</span>
                    </div>
                    <div className="order-head-block">
                      <span className="order-head-label">Items</span>
                      <span className="order-head-value">{item.products.length}</span>
                    </div>
                  </div>
                  <span className={`order-badge ${STATUS_BADGE[item.status] || 'badge-processing'}`}>
                    <i className="bi bi-circle-fill"></i> {STATUS_LABEL[item.status] || item.status}
                  </span>
                </div>

                <div className="order-card-body">
                  {item.products.map((line) => {
                    const productHref = line.product
                      ? `/store/category/${line.product.category_slug}/${line.product.slug}`
                      : null

                    return (
                    <div className="order-line" key={line.id}>
                      {productHref ? (
                        <Link to={productHref} className="order-line-img-link">
                          <img
                            className="order-line-img"
                            src={line.product?.image || PLACEHOLDER_IMG}
                            alt={line.product?.product_name || 'Product'}
                          />
                        </Link>
                      ) : (
                        <img
                          className="order-line-img"
                          src={PLACEHOLDER_IMG}
                          alt="Product"
                        />
                      )}
                      <div className="order-line-info">
                        <div className="order-line-name">
                          {productHref ? (
                            <Link to={productHref} className="order-line-name-link">{line.product.product_name}</Link>
                          ) : (
                            'Product no longer available'
                          )}
                        </div>
                        {line.variation.length > 0 && (
                          <div className="order-line-chips">
                            {line.variation.map(v => (
                              <span className="order-chip" key={v.id}>
                                {v.variation_category}: {v.variation_value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="order-line-meta">
                          Qty: {line.quantity} &bull; Rs. {formatMoney(line.product_price)} each
                        </div>
                      </div>
                      <div className="order-line-price">Rs. {formatMoney(lineTotal(line))}</div>
                    </div>
                    )
                  })}
                </div>

                <div className="order-card-foot">
                  <div className="order-total-block">
                    <span className="order-total-label">Order Total</span>
                    <span className="order-total-value">Rs. {formatMoney(orderTotal(item))}</span>
                  </div>  
                </div>

              </article>
            ))}
          </div>
        )}

        {/* ============ Pagination ============ */}
        {totalPages > 1 && (
          <div className="orders-pagination">
            <button
              className="orders-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`orders-page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="orders-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}

      </div>
    </main>
  )
}

export default Orders
