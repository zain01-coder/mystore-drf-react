import React from 'react'
import { Link } from 'react-router-dom'
import './footer.css'
import "../assets/global/style.css";
import { useCategories } from '../context/CategoryContext';




const Footer = () => {
  const { categories } = useCategories()
  return (
    <footer className="site-footer mt-2 pt-5 pb-0" aria-label="Site footer">
      <div className="footer-container">
        <div className="row gy-4 pb-5">

          {/* Brand Column */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand">
              <i className="bi bi-bag-heart-fill me-2 footer-accent-icon"></i>
              MyStore<span className="footer-brand-dot">.</span>
            </div>
            <p className="footer-tagline">
              Your destination for the best products at the best prices. Quality, speed, and trust — guaranteed.
            </p>
            <div className="footer-social">
              <a href="#" className="social-btn" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" className="social-btn" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-btn" aria-label="Twitter / X"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="social-btn" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
              <a href="#" className="social-btn" aria-label="Pinterest"><i className="bi bi-pinterest"></i></a>
            </div>
            <div className="footer-ssl mt-3">
              <i className="bi bi-shield-check me-1 ssl-icon"></i>
              Secured by 256-bit SSL encryption
            </div>
          </div>

          {/* Shop Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <div className="footer-heading">Shop</div>
            <ul className="footer-links">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/store/category/${cat.slug}`}>{cat.category_name}</Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Company Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <div className="footer-heading">Company</div>
            <ul className="footer-links">
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/">Careers</Link></li>
              <li><Link to="/">Press</Link></li>
              <li><Link to="/">Blog</Link></li>
              <li><Link to="/">Contact Us</Link></li>
              <li><Link to="/">Sell on MyStore</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <div className="footer-heading">Support</div>
            <ul className="footer-links">
              <li><Link to="/">Help Center</Link></li>
              <li><Link to="/-order">Track Order</Link></li>
              <li><Link to="/">Returns</Link></li>
              <li><Link to="/">Shipping Info</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Payment & App */}
          <div className="col-6 col-md-3 col-lg-2">
            <div className="footer-heading">We Accept</div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <div className="payment-badge">Visa</div>
              <div className="payment-badge">Mastercard</div>
              <div className="payment-badge">PayPal</div>
              <div className="payment-badge">Stripe</div>
            </div>

            <div className="footer-heading mt-3">Download App</div>
            <a href="#" className="app-store-btn mb-2">
              <i className="bi bi-apple"></i> App Store
            </a>
            <a href="#" className="app-store-btn">
              <i className="bi bi-google-play"></i> Google Play
            </a>
          </div>

        </div>

        <hr className="footer-divider" />

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-4 footer-bottom">
          <p className="mb-0">&copy; {new Date().getFullYear()} MyStore. All rights reserved.</p>
          <div className="d-flex flex-wrap gap-3">
            <Link to="/" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/" className="footer-bottom-link">Terms of Service</Link>
            <Link to="/" className="footer-bottom-link">Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer