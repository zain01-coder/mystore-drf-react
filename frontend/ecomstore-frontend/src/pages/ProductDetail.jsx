import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import '../assets/global/style.css'
import './productdetail.css'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom' // ← add this
import Loader from '../components/Loader'
import { isAuthenticated } from '../utils/auth'
import { showToast } from '../utils/toast'
import { useCart } from '../context/CartContext'



const ProductDetail = () => {
  const { category_slug, product_slug } = useParams()
  const [wishlistIds, setWishlistIds] = useState(new Set)
  const [wishlisted, setWishlisted] = useState(false)
  const [reviews, setReviews] = useState([])
  const [product, setProduct] = useState(null)      // ← null not undefined
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)  // ← true not false
  const [error, setError] = useState('')
  const [selectedVariations, setSelectedVariations] = useState({})
  const [cartError, setCartError] = useState('')
  const [reviewForm, setReviewForm] = useState({ subject: '', review: '', rating: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const navigate = useNavigate()
  const { refreshCart } = useCart()

  // The main product image comes first, then the extra gallery images.
  // These are the pictures the left/right arrows move through.
  let gallery = []
  if (product) {
    gallery.push(product.image)
    if (product.images) {
      for (let i = 0; i < product.images.length; i++) {
        gallery.push(product.images[i].image)
      }
    }
  }

  const showPrevImage = () => {
    if (activeImage === 0) {
      setActiveImage(gallery.length - 1)
    } else {
      setActiveImage(activeImage - 1)
    }
  }

  const showNextImage = () => {
    if (activeImage === gallery.length - 1) {
      setActiveImage(0)
    } else {
      setActiveImage(activeImage + 1)
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`store/category/${category_slug}/${product_slug}/`)
        setProduct(response.data)
        if (isAuthenticated()) {
          const wishlistRes = await api.get('wishlist/')
          const ids = new Set(wishlistRes.data.map(item => item.product.id))
          setWishlistIds(ids)
          setWishlisted(ids.has(response.data.id))
        }
      } catch {
        setError('Product not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [category_slug, product_slug])

  useEffect(() => {
    if (!product) return
    const fetchReviews = async () => {

      const list_review_response = await api.get(`store/products/${product.id}/reviews/`)
      setReviews(list_review_response.data)
    }
    fetchReviews()
  }, [product])





  const groupedVariations = product?.variations?.reduce((groups, variation) => {
    const category = variation.variation_category

    if (!groups[category]) {
      groups[category] = []
    }

    groups[category].push(variation)
    return groups
  }, {}) || {}

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0
    return { star, percent }
  })


  const handleVariationChange = (category, variationId) => {
    setSelectedVariations(previous => ({
      ...previous,
      [category]: Number(variationId),
    }))

    setCartError('')
  }

  const handleAddToCart = async () => {
    const variationCategories = Object.keys(groupedVariations)
    const allVariationsSelected = variationCategories.every(
      category => selectedVariations[category]
    )

    if (!allVariationsSelected) {
      setCartError('Please select all product options')
      return
    }

    try {
      setCartError('')

      await api.post('cart/add/', {
        product_id: product.id,
        quantity,
        variations: Object.values(selectedVariations),
      })

      navigate('/cart')
      showToast("Added to cart", 'success')
      refreshCart()
    } catch (error) {
      setCartError(
        error.response?.data?.error || 'Could not add product to cart'
      )
    }
  }



  const toggleWishlist = async () => {
    if (wishlisted) {
      try {

        await api.delete(`wishlist/${product.id}`)
        setWishlisted(false)
        showToast("Removed from wishlist", 'success')
      }
      catch (err) {
        const message = err.response?.data || 'Failed to remove from wishlist'
        showToast(message, 'error')

      }
    }
    else {
      try {
        const response = await api.post('wishlist/', { 'product_id': product.id })
        setWishlisted(true)
        showToast("Added from wishlist", 'success')
      }
      catch (err) {
        const message = err.response?.data || 'Failed to add to wishlist'
        showToast(message, 'error')

      }
    }
  }

  const myReview = reviews.find((r) => r.is_owner)

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    try {
      setSubmittingReview(true)
      if (editingReviewId) {
        const response = await api.patch(`store/reviews/${editingReviewId}/`, reviewForm)
        setReviews(reviews.map((r) => (r.id === editingReviewId ? response.data : r)))
        showToast('Review updated', 'success')
      } else {
        const response = await api.post(`store/products/${product.id}/reviews/`, reviewForm)
        setReviews([response.data, ...reviews])
        showToast('Review submitted', 'success')
      }
      setReviewForm({ subject: '', review: '', rating: '' })
      setEditingReviewId(null)
    } catch (err) {
      const message = err.response?.data?.[0] || err.response?.data?.detail || 'Could not submit review'
      showToast(message, 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleEditReview = (review) => {
    setEditingReviewId(review.id)
    setReviewForm({ subject: review.subject, review: review.review, rating: String(review.rating) })
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`store/reviews/${reviewId}/`)
      setReviews(reviews.filter((r) => r.id !== reviewId))
      showToast('Review deleted', 'success')
    } catch {
      showToast('Could not delete review', 'error')
    }
  }



  if (loading) return <Loader label="Loading product..." />
  if (error) return <p>{error}</p>
  if (!product) return null

  const outOfStock = product.stock <= 0


  return (
    <div className="detail-page-bg commerce-page product-detail-page">
      <div className="container py-4 py-md-5 detail-container">

        {/* Product Detail Card */}
        <div className="product-detail-card p-3 p-md-4 mb-4">
          <div className="row g-4 align-items-start">

            {/* LEFT: Image */}
            <div className="col-12 col-md-5">
              <div className="product-img-wrap">
                <img src={gallery[activeImage]} alt={product.product_name} />

                {/* Arrows only make sense when there is more than one picture */}
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery-arrow gallery-arrow-left"
                      onClick={showPrevImage}
                      aria-label="Previous image"
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <button
                      type="button"
                      className="gallery-arrow gallery-arrow-right"
                      onClick={showNextImage}
                      aria-label="Next image"
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="d-flex gap-2 mt-3 justify-content-center flex-wrap">
                  {gallery.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={index === activeImage ? 'thumb-wrap thumb-active' : 'thumb-wrap'}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={imageUrl} alt={`${product.product_name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Info */}
            <div className="col-12 col-md-7">

              <div className="d-flex align-items-center gap-2 mb-2">

                {
                  outOfStock ? (
                    <span className="out-of-stock-badge">Out of Stock</span>
                  ) : (
                    <span className="badge-tag">In Stock</span>

                  )
                }
                <span className="sku-text">SKU: LMN-WTC-004</span>
              </div>

              <h1 className="product-title mb-1">{product.product_name}</h1>
              <p className="brand-text mb-2">by <strong>Luminary Atelier</strong></p>

              {/* Stars */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${i < Math.round(product.average_rating) ? 'bi-star-fill' : 'bi-star'} star-filled`}
                    ></i>
                  ))}
                </div>
                <span className="review-count">{product.average_rating} <span className="text-muted">({product.review_count} reviews)</span></span>
              </div>


              {/* Price */}
              <div className="d-flex align-items-center gap-3 mb-3">
                {product.is_sale ? (
                  <>
                    <span className="price-current">Rs. {product.sale_price}</span>
                    <span className="price-old">Rs. {product.price}</span>
                    <span className="price-off">{product.discount_percentage}% off</span>
                  </>
                ) : (
                  <span className="price-current">Rs. {product.price}</span>
                )}
              </div>

              {/* Description */}
              <p className="product-description mb-0">
                {product.description}
              </p>

              {/* Key Features */}
              {/* <ul className="feature-list mt-2 mb-0">
                <li>Sapphire crystal glass — scratch resistant</li>
                <li>Japanese quartz movement ± 10 sec/year</li>
                <li>Genuine leather strap with stainless buckle</li>
                <li>Water resistant 50m (5 ATM)</li>
              </ul> */}

              <hr className="divider" />

              {/* Variation Selection */}
              {Object.keys(groupedVariations).length > 0 &&
                <>
                  {Object.entries(groupedVariations).map(([category, variations]) => (
                    <div className="mb-3" key={category}>
                      <label
                        htmlFor={`${category}Select`}
                        className="variant-label text-capitalize"
                      >
                        Choose {category}
                      </label>
                      <select
                        id={`${category}Select`}
                        className="form-select variant-select"
                        value={selectedVariations[category] || ''}
                        onChange={event =>
                          handleVariationChange(category, event.target.value)
                        }
                      >
                        <option value="">Select {category}</option>
                        {variations.map(variation => (
                          <option key={variation.id} value={variation.id}>
                            {variation.variation_value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  < hr className="divider" />
                </>
              }


              {/* Quantity */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="qty-label">Qty</span>
                <button className="qty-btn" aria-label="Decrease quantity" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-count">{quantity}</span>
                <button className="qty-btn" aria-label="Increase quantity" onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>

              {/* Buttons */}
              {cartError && (
                <p className="text-danger mb-2">{cartError}</p>
              )}
              <div className="d-flex gap-2">
                {
                  product.stock > 0 ? (
                    <button className="add-to-cart" onClick={handleAddToCart}>
                      <i className="bi bi-bag-plus me-2"></i>Add to Cart
                    </button>

                  ) : (
                    <button className="add-to-cart out-of-stock" disabled>
                      <i className="bi bi-x-circle me-2"></i>Out of Stock
                    </button>
                  )}
                <button
                  className={`wishlist-btn${wishlisted ? ' wishlist-btn-active' : ''}`}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  onClick={toggleWishlist}
                >
                  <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="d-flex flex-wrap gap-3 mt-3 trust-badges">
                <span><i className="bi bi-shield-check me-1 trust-icon"></i>2-Year Warranty</span>
                <span><i className="bi bi-truck me-1 trust-icon"></i>Free Shipping over Rs. 999</span>
                <span><i className="bi bi-arrow-return-left me-1 trust-icon"></i>30-Day Returns</span>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="text-center mb-3">
          <h2 className="section-heading">Customer Reviews</h2>
          <p className="section-subtext">See what others are saying about this product</p>
        </div>

        <div className="review-card p-3 p-md-4">

          {/* Rating Summary */}
          <div className="row g-3 align-items-center mb-3">
            <div className="col-auto text-center">
              <div className="rating-big">{product.average_rating}</div>
              <div className="mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`bi ${i < Math.round(product.average_rating) ? 'bi-star-fill' : 'bi-star'} star-filled rating-star`}
                  ></i>
                ))}
              </div>
              <div className="total-reviews">{product.review_count} reviews</div>
            </div>
            <div className="col">
              {ratingBreakdown.map((row) => (
                <div className="d-flex align-items-center gap-2 mb-1" key={row.star}>
                  <span className="star-label">{row.star}</span>
                  <div className="progress flex-grow-1 rating-progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${row.percent}%`, background: 'var(--color-primary)' }}
                    ></div>
                  </div>
                  <span className="star-label">{row.percent}%</span>
                </div>
              ))}
            </div>
          </div>


          <hr className="divider" />

          {/* Reviews */}
          {/* Reviews */}
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review this product.</p>
          ) : (
            reviews.map((r) => (
              <div className="review-item py-3" key={r.id}>
                <div className="d-flex align-items-start gap-3">
                  <div className="reviewer-avatar">
                    {r.user_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="reviewer-name">{r.user_name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1 mb-2">
                      <div>
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <i key={i} className="bi bi-star-fill star-filled review-star"></i>
                        ))}
                      </div>
                      <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.subject && <p className="fw-semibold mb-1">{r.subject}</p>}
                    <p className="review-text">{r.review}</p>

                    {r.is_owner && (
                      <div className="d-flex gap-2 mt-2">
                        <button type="button" className="btn-edit-address" onClick={() => handleEditReview(r)}>
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button type="button" className="btn-edit-address" onClick={() => handleDeleteReview(r.id)}>
                          <i className="bi bi-trash3"></i> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          <hr className="divider" />

          {/* Review Form */}
          {/* Review Form */}
          {!myReview || editingReviewId ? (
            <div>
              <h3 className="write-review-heading">{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label variant-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Great quality"
                      value={reviewForm.subject}
                      onChange={(e) => setReviewForm({ ...reviewForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label variant-label">Rating</label>
                    <select
                      className="form-select"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      required
                    >
                      <option value="">Select rating…</option>
                      <option value="5">★★★★★ — Excellent (5)</option>
                      <option value="4">★★★★☆ — Good (4)</option>
                      <option value="3">★★★☆☆ — Average (3)</option>
                      <option value="2">★★☆☆☆ — Below Average (2)</option>
                      <option value="1">★☆☆☆☆ — Poor (1)</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label variant-label">Your Review</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Share your experience with this product…"
                      value={reviewForm.review}
                      onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="col-12 d-flex gap-2">
                    <button className="submit-btn" type="submit" disabled={submittingReview}>
                      <i className="bi bi-send me-2"></i>
                      {submittingReview ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                    </button>
                    {editingReviewId && (
                      <button
                        type="button"
                        className="btn-reset"
                        onClick={() => { setEditingReviewId(null); setReviewForm({ subject: '', review: '', rating: '' }) }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <p className="text-muted">You've already reviewed this product. Use Edit on your review above to change it.</p>
          )}


        </div>

        <p className="footer-copy">© 2025 MyStore. All rights reserved.</p>

      </div>
    </div>
  )
}

export default ProductDetail
