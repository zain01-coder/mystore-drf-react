import React, { useState, useEffect } from 'react'
import './dashboard.css'
import api from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { removeTokens } from '../utils/auth'
import { showToast } from '../utils/toast'



const PLACEHOLDER_IMG = 'https://placehold.co/56x56/e5e7eb/6b7280?text=%20'

const STATUS_BADGE = {
  Completed: 'badge-delivered',
  Accepted: 'badge-transit',
  New: 'badge-processing',
  Cancelled: 'badge-processing',
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

const formatMoney = (value) =>
  Number(value).toLocaleString('en-PK', { maximumFractionDigits: 0 })

// An order can hold several products but the row only fits one name, so show the
// first and note how many others came with it.
const orderTitle = (order) => {
  const products = order.products || []
  if (products.length === 0) return 'Order'
  const first = products[0].product?.product_name || 'Product'
  return products.length > 1 ? `${first} + ${products.length - 1} more` : first
}

const orderTotal = (order) => Number(order.order_total) + Number(order.tax)

const orderQuantity = (order) =>
  (order.products || []).reduce((sum, item) => sum + item.quantity, 0)




















const Dashboard = () => {
  const [wishlistItems, SetwishlistItems] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [orderCount, setOrderCount] = useState(0)
  const [addresses, setAddresses] = useState([])
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0] || null

  // First letter of the name, used for the placeholder avatar.
  const avatarInitial = user && user.first_name ? user.first_name.charAt(0).toUpperCase() : '%20'

  useEffect(() => {
    const fetchData = async () => {
      const wishlistResponse = await api.get('wishlist/')
      SetwishlistItems(wishlistResponse.data)
      // order/list/ is paginated (12 per page) and sorted by -created_at, so
      // the first page already holds the most recent orders for the preview
      // list below. `count` on that same response gives the true total
      // without needing to fetch every page.
      const orderResponse = await api.get('order/list/')
      setOrderItems(orderResponse.data.results)
      setOrderCount(orderResponse.data.count)
    }
    fetchData()

    const fetchAddresses = async () => {
      try {
        const addressResponse = await api.get('address/')
        setAddresses(addressResponse.data)
      } catch {
        setAddresses([])
      }
    }
    fetchAddresses()

    const fetchUser = async () => {
      try {
        const userResponse = await api.get('accounts/me/')
        setUser(userResponse.data)
      } catch {
        setUser(null)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    removeTokens()
    showToast('Logged out successfully', 'success')
    navigate('/login')
  }


  const handleRemove = (productId) => {
    SetwishlistItems(wishlistItems.filter(item => item.product.id != productId))
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">

        {/* ============ Sidebar ============ */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar-card">
            <div className="dash-profile-card">
              <img
                className="dash-avatar"
                src={`https://placehold.co/72x72/e5e7eb/6b7280?text=${avatarInitial}`}
                alt={user ? user.full_name : 'Account'}
              />
              <div className="dash-profile-info">
                <div className="dash-profile-name">{user ? user.full_name : ''}</div>
                <div className="dash-profile-email">{user ? user.email : ''}</div>
              </div>
            </div>

            <nav className="dash-nav">
              <a href="#" className="dash-nav-item active">
                <i className="bi bi-grid-fill"></i>
                Dashboard
              </a>
              <Link to='/orders' className="dash-nav-item">
                <i className="bi bi-box-seam"></i>
                My Orders
              </Link>
              <Link to='/wishlist' className="dash-nav-item">
                <i className="bi bi-heart"></i>
                Wishlist
              </Link>
            </nav>

            <hr className="dash-sidebar-divider" />

            <button onClick={handleLogout} className="dash-nav-item dash-logout">
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </div>
        </aside>

        {/* ============ Main content ============ */}
        <main className="dash-main">

          {/* Greeting + tier banner */}
          <div className="dash-greeting-row">
            <div>
              <h1 className="dash-greeting-title">
                Hello{user ? `, ${user.first_name}` : ''} <span>👋</span>
              </h1>
              <p className="dash-greeting-subtext">Welcome back! Here's what's happening with your account.</p>
            </div>

            
          </div>

          {/* Stat cards */}
          <div className="dash-stats-grid">
            <div className="dash-stat-card stat-blue">
              <div className="dash-stat-icon">
                <i className="bi bi-gift-fill"></i>
              </div>
              <div className="dash-stat-label">Total Orders</div>
              <div className="dash-stat-value">{orderCount}</div>
              <Link to='/orders' className="dash-stat-link">View all orders <i className="bi bi-arrow-right"></i></Link>
            </div>

            <div className="dash-stat-card stat-pink">
              <div className="dash-stat-icon">
                <i className="bi bi-heart-fill"></i>
              </div>
              <div className="dash-stat-label">Wishlist Items</div>
              <div className="dash-stat-value">{wishlistItems.length}</div>
              <Link to='/wishlist' className="dash-stat-link">View wishlist <i className="bi bi-arrow-right"></i></Link>
            </div>

            
          </div>

          {/* Recent orders + Wishlist preview */}
          <div className="dash-row-2col">
            <div className="dash-col-left">
              <section className="dash-panel dash-orders-panel">
                <div className="dash-panel-header">
                  <h2>Recent Orders</h2>
                  <Link to='/orders' className="dash-panel-link">View all orders <i className="bi bi-arrow-right"></i></Link>
                </div>

                {orderItems.length === 0 ? (
                  <p className="dash-greeting-subtext mb-0">No orders yet.</p>
                ) : (
                  <ul className="dash-order-list">
                    {orderItems.slice(0, 3).map((order) => (
                      <li className="dash-order-row" key={order.order_number}>
                        <img
                          className="dash-order-img"
                          src={order.products?.[0]?.product?.image || PLACEHOLDER_IMG}
                          alt={orderTitle(order)}
                        />
                        <div className="dash-order-info">
                          <div className="dash-order-title">Order #{order.order_number.slice(0, 8)}</div>
                          <div className="dash-order-name">{orderTitle(order)}</div>
                          <div className="dash-order-meta">
                            Qty: {orderQuantity(order)} &bull; Rs. {formatMoney(orderTotal(order))}
                          </div>
                        </div>
                        <div className="dash-order-status">
                          <span className={`dash-badge ${STATUS_BADGE[order.status] || 'badge-processing'}`}>
                            {order.status}
                          </span>
                          <div className="dash-order-date">{formatDate(order.created_at)}</div>
                        </div>
                        <div className="dash-order-price">Rs. {formatMoney(orderTotal(order))}</div>
                        <i className="bi bi-chevron-right dash-order-chevron"></i>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dash-panel dash-address-panel">
                <div className="dash-panel-header">
                  <h2>Saved Addresses</h2>
                  <Link to='/addresses' className="dash-panel-link">View all <i className="bi bi-arrow-right"></i></Link>
                </div>
                {defaultAddress ? (
                  <div className="dash-address-card">
                    <div className="dash-address-top">
                      <div className="dash-address-icon"><i className="bi bi-house-fill"></i></div>
                      <span className="dash-address-label">{defaultAddress.first_name} {defaultAddress.last_name}</span>
                      {defaultAddress.is_default && (
                        <span className="dash-badge badge-default">Default</span>
                      )}
                    </div>
                    <div className="dash-address-details">
                      <div className="dash-address-name">{defaultAddress.first_name} {defaultAddress.last_name}</div>
                      <div className="dash-address-text">
                        {defaultAddress.address_line_1}
                        {defaultAddress.address_line_2 ? `, ${defaultAddress.address_line_2}` : ''}, {defaultAddress.city}, {defaultAddress.state}, {defaultAddress.country}
                      </div>
                      <div className="dash-address-phone">{defaultAddress.phone}</div>
                    </div>
                    <Link to='/addresses' className="dash-address-edit">Edit</Link>
                  </div>
                ) : (
                  <p className="dash-greeting-subtext mb-0">No saved addresses.</p>
                )}
              </section>
            </div>

            <section className="dash-panel dash-wishlist-panel">
              <div className="dash-panel-header">
                <h2>Wishlist Preview</h2>
                <Link to='/wishlist' className="dash-panel-link">View all wishlist <i className="bi bi-arrow-right"></i></Link>
              </div>

              {wishlistItems.length === 0 ? (
                <p className="dash-greeting-subtext mb-0">No items in your wishlist yet.</p>
              ) : (
                <div className="dash-wishlist-grid">
                  {wishlistItems.slice(0, 4).map((item) => (
                    <div className="dash-wish-card" key={item.product.id}>
                      <ProductCard product={item.product} isWishlisted={true} onRemove={handleRemove} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

        </main>
      </div>
    </div>
  )
}

export default Dashboard
