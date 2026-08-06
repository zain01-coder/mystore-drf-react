import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './productcard.css'
import api from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import { showToast } from '../utils/toast'

const ProductCard = ({ product, isWishlisted = false, onRemove }) => {
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const navigate = useNavigate()

  const AddToWishlist = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    if (wishlisted) {

      try {

        await api.delete(`wishlist/${product.id}`)
        setWishlisted(false)
        showToast('Removed from wishlist', 'success')
        if (onRemove) onRemove(product.id)
      }
      catch (err) {
        const message = err.response?.data || 'Failed to remove from wishlist'
        showToast(message, 'error')

      }
    }
    else {
      try {
        await api.post('wishlist/', { 'product_id': product.id })
        setWishlisted(true)
        showToast('Added to wishlist', 'success')
      }
      catch (err) {
        const message = err.response?.data || 'Failed to add to wishlist'
        showToast(message, 'error')

      }
    }

  }



  const pro = product
  const productHref = `/store/category/${pro.category_slug}/${pro.slug}`
  const outOfStock = pro.stock <= 0

  return (
    <div className="catalog-product-card">
      <button
        className={`wishlist-btn-card${wishlisted ? ' wishlist-btn-active' : ''}`}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={AddToWishlist}
      >
        <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
      </button>
      <div className="catalog-product-img-wrap">
        <Link to={productHref}>
          <img src={pro.image} alt={pro.product_name} />
        </Link>
        {pro.is_sale && !outOfStock && <span className="product-badge">{pro.discount_percentage}% off</span>}
        {outOfStock && <span className="product-badge out-of-stock-badge">Out of Stock</span>}
      </div>
      <div className="product-body">
        <div className="product-category-tag">{pro.category_name}</div>
        <Link to={productHref}>
          <div className="product-name">{pro.product_name}</div>
        </Link>
        <div className="product-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <i
              key={i}
              className={`bi ${i < Math.round(pro.average_rating) ? 'bi-star-fill' : 'bi-star'}`}
            ></i>
          ))}
          <span>({pro.review_count})</span>
        </div>
        <div className="product-price-row">
          <div className="product-price-group">
            {pro.is_sale ? (
              <>
                <span className="card-price-current">Rs. {pro.sale_price}</span>
                <span className="card-price-old">Rs. {pro.price}</span>
              </>
            ) : (
              <span className="card-price-current">Rs. {pro.price}</span>
            )}
          </div>
          <Link
            to={productHref}
            className={`btn-view${outOfStock ? ' btn-view-disabled' : ''}`}
            aria-label={outOfStock ? `${pro.product_name} is out of stock` : `View ${pro.product_name}`}
          >
            <i className={`bi ${outOfStock ? 'bi-slash-circle' : 'bi-cart3'}`}></i>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
