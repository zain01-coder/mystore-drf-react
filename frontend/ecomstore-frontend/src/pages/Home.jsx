import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './home.css'
import '../assets/global/style.css'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { isAuthenticated } from '../utils/auth'
import { useCategories } from '../context/CategoryContext'
import { showToast } from '../utils/toast'

const Home = () => {
  const [product, setproduct] = useState([])
  const [wishlistIds, setWishlistIds] = useState(new Set)
  const [error, seterror] = useState('')
  const [loading, setloading] = useState(true)
  const { categories } = useCategories()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault()
    if (!newsletterEmail || subscribing) return

    setSubscribing(true)
    try {
      await api.post('newsletter/subscribe/', { email: newsletterEmail })
      showToast('Check your inbox — you are subscribed!', 'success')
      setNewsletterEmail('')
    } catch (err) {
      const message = err.response?.data?.email?.[0] || 'Failed to subscribe. Please try again.'
      showToast(message, 'error')
    } finally {
      setSubscribing(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await api.get('store/products/')
        setproduct(response.data)
        if (isAuthenticated()) {
          const wishlistRes = await api.get('wishlist/')
          setWishlistIds(new Set(wishlistRes.data.map(item => item.product.id)))
        }
      } catch {
        seterror("failed to load data")
      }
      finally {
        setloading(false)
      }

    }
    fetchData()
  }, [])


  return (
    <main>
      <div className="container-xl px-3 px-md-4">

        {/* HERO */}
        <section className="hero-section my-4">
          <div className="container-fluid">
            <div className="row align-items-center gy-4 py-4">
              <div className="col-lg-7 col-md-8 position-relative">
                <span className="hero-badge">
                  <i className="bi bi-lightning-charge-fill me-1"></i> Limited Time Offer
                </span>
                <h1 className="hero-title">
                  Discover the <span>Best Products</span><br />Made for You
                </h1>
                <p className="hero-subtitle">
                  Shop thousands of curated products across every category. Fast delivery, best prices, and genuine quality — all in one place.
                </p>
                <div className="d-flex flex-wrap gap-3 hero-cta-row">
                  <Link to="/store" className="btn-hero-primary">
                    <i className="bi bi-bag-check-fill"></i> Shop Now
                  </Link>
                  <Link to="/categories" className="btn-hero-secondary">
                    <i className="bi bi-compass"></i> Explore
                  </Link>
                </div>
                <div className="d-flex flex-wrap gap-4 mt-4 hero-stat-row">
                  <div className="hero-stat">
                    <span className="hero-stat-icon"><i className="bi bi-box-seam-fill"></i></span>
                    <span>
                      <div className="stat-number">50K+</div>
                      <div className="stat-label">Products</div>
                    </span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-icon"><i className="bi bi-emoji-smile-fill"></i></span>
                    <span>
                      <div className="stat-number">2M+</div>
                      <div className="stat-label">Happy Customers</div>
                    </span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-icon"><i className="bi bi-star-fill"></i></span>
                    <span>
                      <div className="stat-number">4.9</div>
                      <div className="stat-label">Average Rating</div>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-md-4 d-none d-md-flex align-items-center justify-content-center">
                <div className="hero-visual">
                  <img
                    className="hero-visual-img"
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
                    alt="Featured product"
                  />
                  <div className="hero-visual-tag">
                    <div className="hero-visual-tag-label">Best Seller</div>
                    <div className="hero-visual-tag-price">$189.99</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="categories" className="my-5">
          <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="section-title">Shop by Categories</h2>
              <p className="section-subtitle mb-0">Explore our wide range of curated product collections</p>
              <div className="section-line"></div>
            </div>
            <Link to="/categories" className="view-all-link">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="row g-3 justify-content-center">
            {categories.map((cat) => (
              <div className="col-6 col-md-4 col-lg-2" key={cat.slug}>
                <Link to={`/store/category/${cat.slug}`} className="category-card h-100">
                  <div className="cat-img-wrap">
                    <img src={cat.categ_img} alt={cat.category_name} />
                  </div>
                  <div className="cat-text">
                    <div className="cat-label">{cat.category_name}</div>
                    <div className="cat-count">{cat.product_count} items</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

        </section>

        {/* FEATURED PRODUCTS */}
        <section id="featured" className="my-5">
          <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle mb-0">Hand-picked bestsellers and top-rated items</p>
              <div className="section-line"></div>
            </div>
            <Link to="/store" className="view-all-link">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading && <Loader label="Loading products..." />}
          {error && <p>{error}</p>}

          <div className="row g-3">
            {!loading && !error && product.map((pro) => (
              <div className="col-6 col-md-4 col-lg-3" key={pro.id}>
                <ProductCard product={pro} isWishlisted={wishlistIds.has(pro.id)} />
              </div>
            ))}
          </div>
        </section>

        {/* PROMO BANNER */}
        <section className="my-5">
          <div className="promo-banner">
            <div className="row align-items-center gy-4">
              <div className="col-lg-7">
                <p className="promo-eyebrow">
                  <i className="bi bi-clock-fill me-1"></i> Flash Sale — Ends Soon
                </p>
                <h2 className="promo-title">
                  Big Sale — Up to <span>50% Off</span><br />Top Brands
                </h2>
                <p className="promo-sub">
                  Don't miss out on the biggest sale of the season. New deals added every hour.
                </p>
                <Link to="/store" className="btn-promo">
                  <i className="bi bi-lightning-charge-fill"></i> Explore Deals
                </Link>
              </div>
              <div className="col-lg-5 d-none d-lg-flex justify-content-center">
                <img
                  className="promo-visual-img"
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=380&q=80"
                  alt="Seasonal sale products"
                />
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="my-5">
          <div className="text-center mb-4">
            <h2 className="section-title">Why Choose MyStore?</h2>
            <p className="section-subtitle">Everything you need for a seamless shopping experience</p>
            <div className="section-line mx-auto"></div>
          </div>
          <div className="why-strip">
            {[
              { icon: 'bi-truck', tone: 'tone-blue', title: 'Fast & Free Delivery', desc: 'Get your order delivered within 2–3 business days. Free shipping on all orders over $49.' },
              { icon: 'bi-patch-check-fill', tone: 'tone-amber', title: 'Best Quality Products', desc: 'Every product is vetted for quality. We only list brands that pass our strict standards.' },
              { icon: 'bi-headset', tone: 'tone-green', title: '24/7 Customer Support', desc: 'Our support team is available around the clock via chat, email, or phone.' },
              { icon: 'bi-shield-lock-fill', tone: 'tone-pink', title: 'Secure Payments', desc: 'All transactions are encrypted with industry-standard SSL. Shop with total confidence.' },
              { icon: 'bi-arrow-counterclockwise', tone: 'tone-purple', title: 'Easy 30-Day Returns', desc: 'Not happy? Return any item within 30 days for a full refund — no questions asked.' },
              { icon: 'bi-tags-fill', tone: 'tone-orange', title: 'Best Price Guarantee', desc: "We match or beat any competitor's price. You always get the best deal." },
            ].map((item) => (
              <div className="why-item" key={item.title}>
                <div className={`why-icon-wrap ${item.tone}`}>
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h5>{item.title}</h5>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="my-5">
          <div className="newsletter-section">
            <div className="newsletter-icon" aria-hidden="true">
              <i className="bi bi-envelope-fill"></i>
            </div>
            <div className="newsletter-copy">
              <h3>Stay in the Loop</h3>
              <p>Subscribe for exclusive deals, new arrivals, and member-only discounts.</p>
            </div>
            <form className="newsletter-input-wrap" onSubmit={handleNewsletterSubscribe}>
              <label htmlFor="newsletter-email" className="visually-hidden">Email address</label>
              <div className="input-group">
                <input
                  id="newsletter-email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email address…"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button className="btn-subscribe" type="submit" disabled={subscribing}>
                  {subscribing ? 'Subscribing…' : 'Subscribe'} <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </main>
  )
}

export default Home