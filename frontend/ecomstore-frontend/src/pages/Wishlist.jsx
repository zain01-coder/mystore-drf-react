import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './wishlist.css'
import '../assets/global/style.css'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { showToast } from '../utils/toast'



const Wishlist = () => {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await api.get('wishlist/')
        setItems(response.data)
      }
      catch (err) {
        const message = err.response?.data?.detail || 'Failed to load the items'
        setError(message)
      }
      finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])



  const handleRemove = (productId) => {
    setItems(items.filter(item => item.product.id != productId))
  }

  const handleClearAll = async () => {
    try {
      await api.delete('wishlist/clear/')
      setItems([])
      showToast('Wishlist cleared', 'success')
    }
    catch (err) {
      const message = err.response?.data?.detail || 'Failed to clear wishlist'
      showToast(message, 'error')
    }
  }

  if (loading) return <Loader label="Loading wishlist..." />
  if (error) return <p>{error}</p>

  return (
    <main className="wishlist-page">
      <div className="container-xl px-3 px-md-4 pt-4 my-5 wishlist-container">

        {/* ── Breadcrumb + Page title ── */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb breadcrumb-custom mb-0">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Wishlist</li>
          </ol>
        </nav>

        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-heading">My Wishlist</h1>
            <p className="page-subtext mb-0">Products you've saved for later</p>
          </div>
          {items.length > 0 && (
            <button className="btn-remove clear-wishlist-btn" aria-label="Clear wishlist" onClick={handleClearAll}>
              <i className="bi bi-trash3"></i> Clear all
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="section-label">{items.length} items saved</span>
            </div>

            {/* ── Wishlist grid ── */}
            <div className="row g-4">
              {items.map((item) => (
                <div className="col-6 col-md-4 col-lg-3" key={item.product.id}>
                  <ProductCard product={item.product} isWishlisted={true} onRemove={handleRemove}/>
                </div>
              ))}
            </div>

            <Link to="/store" className="btn-continue mt-4">
              <i className="bi bi-arrow-left"></i> Continue Shopping
            </Link>
          </>
        ) : (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card-white">
                <div className="empty-state">
                  <div className="empty-icon-wrap">
                    <i className="bi bi-heart"></i>
                  </div>
                  <h2 className="empty-title">Your wishlist is empty</h2>
                  <p className="empty-sub">
                    Save items you love by tapping the heart icon.<br />
                    They'll show up here for easy access later.
                  </p>
                  <Link to="/store" className="btn-shop-now">
                    <i className="bi bi-bag-heart-fill"></i> Explore Products
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

export default Wishlist


// echo "# mystore-drf-react" >> README.md
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/zain01-coder/mystore-drf-react.git
// git push -u origin main
