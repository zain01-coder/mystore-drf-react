import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { isAuthenticated, removeTokens } from '../utils/auth'
import { showToast } from '../utils/toast'
import './navbar.css'
import { useCategories } from '../context/CategoryContext'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)
  const navRef = useRef(null)
  const { categories } = useCategories()
  const { cartCount } = useCart()


  const navigate = useNavigate()



  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    navigate(`/store?search=${encodeURIComponent(query)}`)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    removeTokens()
    showToast('Logged out successfully', 'success')
    setMobileOpen(false)
    navigate('/login')
  }




  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCatsOpen(false)
      }

      // Clicking anywhere outside the navbar closes the mobile slider. The
      // hamburger lives inside the nav, so it can still toggle normally.
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileOpen(false)
        setMobileCatsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close the dropdown and the mobile slider whenever the page changes, so
  // following any link inside them dismisses the menu.
  useEffect(() => {
    setCatsOpen(false)
    setMobileOpen(false)
    setMobileCatsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  // Categories will come from API later


  // Auth state will come from context later

  return (
    <nav ref={navRef} className={`site-navbar ${scrolled ? 'is-scrolled' : ''}`} aria-label="Main navigation">

      {/* Top Row */}
      <div className="navbar-top">

        {/* Logo */}
        <Link to="/" className="navbar-brand-custom" aria-label="MyStore homepage">
          <i className="bi bi-bag-heart-fill navbar-brand-icon"></i>
          MyStore<span className="brand-dot">.</span>
        </Link>

        {/* Search */}
        <div className="search-wrapper">
          <form className="input-group" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control"
              placeholder="Search products, brands and categories…"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-search" type="submit" aria-label="Search">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>


        {/* Home Link */}
        <Link
          to="/"
          className={`btn-category ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>

        {/* All Categories Dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="cat-dropdown-btn"
            type="button"
            onClick={() => setCatsOpen(!catsOpen)}
            aria-expanded={catsOpen}
          >
            <i className="bi bi-grid-3x3-gap-fill cat-btn-icon"></i>
            All Categories
            <i className="bi bi-chevron-down cat-chevron"></i>
          </button>
          {catsOpen && (
            <ul className="dropdown-menu-cats">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    className="dropdown-item"
                    to={`/store/category/${cat.slug}`}
                    onClick={() => setCatsOpen(false)}
                  >
                    <span className="cat-icon">
                      <i className="bi bi-grid"></i>
                    </span>
                    {cat.category_name}
                  </Link>
                </li>
              ))}
              <li><hr className="dropdown-divider cat-divider" /></li>
              <li>
                <Link
                  className="dropdown-item dropdown-item-browse"
                  to="/store"
                  onClick={() => setCatsOpen(false)}
                >
                  <span className="cat-icon cat-icon-blue">
                    <i className="bi bi-grid-fill"></i>
                  </span>
                  Browse All
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Store Link */}
        <Link
          to="/store"
          className={`btn-category ${location.pathname === '/store' ? 'active' : ''}`}
        >
          <i className="bi bi-shop cat-btn-icon"></i> Store
        </Link>

        {/* Nav Actions */}
        <div className="nav-actions ms-auto">

          {
            isAuthenticated() ? (
              <>
                <Link
                  to="/wishlist"
                  className={`nav-action-item ${location.pathname === '/wishlist' ? 'active' : ''}`}
                  aria-label="Wishlist"
                >
                  <i className="bi bi-heart"></i>
                  <span>Wishlist</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={`nav-action-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  aria-label="Account login"
                >
                  <i className="bi bi-person"></i>
                  <span>Account</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className={`navbar-signup-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Log in
              </Link>
            )
          }






          <Link to="/cart" className="btn-cart cart-link" aria-label="View cart">
            <i className="bi bi-cart3"></i>
            <span className="cart-label">Cart</span>
            {cartCount > 0 && (
              <span className="cart-badge" aria-hidden="true">{cartCount}</span>
            )}
          </Link>

          <button
            className={`btn-hamburger ${mobileOpen ? 'is-open' : ''}`}
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>

      </div>

      {/* Mobile Panel */}
      <div
        className={`mobile-panel ${mobileOpen ? 'open' : ''}`}
        aria-hidden={!mobileOpen}
      >

        <div className="search-wrapper">
          <form className="input-group" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control"
              placeholder="Search products…"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-search" type="submit" aria-label="Search">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>


        <ul className="mobile-links" role="list">
          {isAuthenticated() && (
            <>
              <li>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
                  <i className="bi bi-heart navbar-icon-blue"></i>
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <i className="bi bi-person navbar-icon-blue"></i>
                  Account
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/store" onClick={() => setMobileOpen(false)}>
              <i className="bi bi-person navbar-icon-blue"></i>
              Store
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
              aria-expanded={mobileCatsOpen}
            >
              <i className="bi bi-grid-3x3-gap-fill navbar-icon-blue"></i>
              All Categories
              <i className={`bi bi-chevron-down ms-auto cat-chevron ${mobileCatsOpen ? 'rotated' : ''}`}></i>
            </button>

            {mobileCatsOpen && (
              <ul className="mobile-links mobile-links-sub">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      to={`/store/category/${cat.slug}`}
                      className="mobile-sub-item"
                      onClick={() => setMobileOpen(false)}
                    >
                      <i className="bi bi-grid navbar-icon-orange"></i> {cat.category_name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/store"
                    className="mobile-sub-item"
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className="bi bi-shop navbar-icon-blue"></i> Browse All
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>

        <div className="mobile-actions">
          {isAuthenticated() ? (
            <button
              className="btn-nav-ghost navbar-mobile-logout"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <button className="btn-nav-ghost">
                  <i className="bi bi-person"></i> Log in
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <button className="btn-nav-primary">Sign up</button>
              </Link>
            </>
          )}
        </div>

      </div>

    </nav>
  )
}

export default Navbar
