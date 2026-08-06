import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import './store.css'
import '../assets/global/style.css'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { isAuthenticated } from '../utils/auth'
import { useCategories } from '../context/CategoryContext'

const Store = () => {
    const [products, setProducts] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get('search') || ''
    const ratingParam = searchParams.get('min_rating')
    const currentPage = Number(searchParams.get('page')) || 1
    const minPriceParam = searchParams.get('min_price') || ''
    const maxPriceParam = searchParams.get('max_price') || ''
    const ordering = searchParams.get('ordering') || '-id'
    const [minPrice, setMinPrice] = useState(minPriceParam)
    const [maxPrice, setMaxPrice] = useState(maxPriceParam)
    const inStockOnly = searchParams.get('in_stock') === 'true'
    const [totalCount, setTotalCount] = useState(0)
    const [wishlistIds, setWishlistIds] = useState(new Set)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filtersOpen, setFiltersOpen] = useState(false)
    const pageSize = 12
    const totalPages = Math.ceil(totalCount / pageSize)
    const { slug } = useParams()
    const categorySlug = slug || null
    const { categories: category } = useCategories()

    // How many filters the user has actually applied, shown on the mobile
    // "Filters" button so they know something is narrowing the results.
    let activeFilterCount = 0
    if (categorySlug) activeFilterCount++
    if (minPriceParam || maxPriceParam) activeFilterCount++
    if (ratingParam) activeFilterCount++
    if (inStockOnly) activeFilterCount++




    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = ``
                if (categorySlug) {

                    url = `store/category/${categorySlug}/?page_num=${currentPage}`
                }
                else {
                    url = `store/?page_num=${currentPage}`
                }
                if (searchQuery) {
                    url += `&search=${encodeURIComponent(searchQuery)}`
                }
                if (minPriceParam) {
                    url += `&min_price=${minPriceParam}`
                }
                if (maxPriceParam) {
                    url += `&max_price=${maxPriceParam}`
                }
                if (inStockOnly) {
                    url += `&in_stock=true`
                }
                if (ordering) {
                    url += `&ordering=${ordering}`
                }
                if (ratingParam) {
                    url += `&min_rating=${ratingParam}`
                }
                const products = await api.get(url)
                setProducts(products.data.results)
                setTotalCount(products.data.count)

                if (isAuthenticated()) {
                    const wishlistRes = await api.get('wishlist/')
                    setWishlistIds(new Set(wishlistRes.data.map(item => item.product.id)))
                }
            }
            catch {
                setError('Failed to load data')
            }
            finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [currentPage, categorySlug, searchQuery, minPriceParam, maxPriceParam, inStockOnly, ordering, ratingParam])



    const applyRatingFilter = (value) => {
        const next = new URLSearchParams(searchParams)
        if (value) next.set('min_rating', value); else next.delete('min_rating')
        next.set('page', 1)
        setSearchParams(next)
    }


    const goToPage = (page) => {
        const next = new URLSearchParams(searchParams)
        next.set('page', page)
        setSearchParams(next)
    }

    const applyPriceFilter = () => {
        const next = new URLSearchParams(searchParams)
        if (minPrice) {
            next.set('min_price', minPrice)
        } else {
            next.delete('min_price')
        }


        if (maxPrice) {
            next.set('max_price', maxPrice)
        } else {
            next.delete('max_price')
        }

        next.set('page', 1)
        setSearchParams(next)
    }


    const toggleInStock = (e) => {
        const next = new URLSearchParams(searchParams)
        if (e.target.checked) next.set('in_stock', 'true'); else next.delete('in_stock')
        next.set('page', 1)
        setSearchParams(next)
    }



    const resetFilters = () => {
        setMinPrice('')
        setMaxPrice('')
        setSearchParams({})
    }


    return (
        <main className="store-page">

            {/* Page Header */}
            <div className="page-header">
                <div className="container-xl px-3 px-md-4">
                    <div className="store-header-content">
                        <div className="store-header-copy">
                            <nav aria-label="breadcrumb" className="mb-3">
                                <ol className="breadcrumb breadcrumb-custom mb-0">
                                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Store</li>
                                </ol>
                            </nav>
                            <h1>Our Store</h1>
                            <p>Browse all available products — new arrivals added weekly</p>
                        </div>
                        <div className="store-header-visual" aria-hidden="true">
                            <i className="bi bi-bag-fill store-bag store-bag-primary"></i>
                            <i className="bi bi-bag store-bag store-bag-secondary"></i>
                        </div>
                        <span className="product-count-badge">
                            <i className="bi bi-bag-check me-1"></i>
                            {' '}Found {totalCount} Product{totalCount === 1 ? '' : 's'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="container-xl px-3 px-md-4">

                {/* Active Filters */}
                {searchQuery && (
                    <div className="store-active-filters d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span className="active-filters-label">Active filters:</span>
                        <Link
                            to={categorySlug ? `/store/category/${categorySlug}` : '/store'}
                            className="filter-chip"
                        >
                            Search: {searchQuery} <i className="bi bi-x"></i>
                        </Link>
                    </div>
                )}

                <div className="row g-4 align-items-start">

                    {/* ── SIDEBAR ── */}
                    <div className="col-12 col-lg-3">

                        <button
                            className="filter-toggle-btn"
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            aria-expanded={filtersOpen}
                        >
                            <i className="bi bi-sliders"></i>
                            {filtersOpen ? 'Hide Filters' : 'Filters'}
                            {activeFilterCount > 0 && (
                                <span className="filter-count-badge">{activeFilterCount}</span>
                            )}
                        </button>

                        <div className={`card-white p-3 sidebar-collapse ${filtersOpen ? 'open' : ''}`}>

                            {/* Categories */}
                            <div className="sidebar-section">
                                <div className="sidebar-heading">
                                    Categories
                                    <Link to="/store" className="clear-link">All</Link>
                                </div>
                                <ul className="cat-list">
                                    {category.map((cat) => (
                                        <li key={cat.slug}>

                                            <Link to={`/store/category/${cat.slug}`} className={categorySlug === cat.slug ? 'active' : ''}>
                                                <span>
                                                    <i className="bi bi-bag cat-icon-orange"></i> {cat.category_name}
                                                </span>
                                                <span className="cat-count">{cat.product_count}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price Range */}
                            <div className="sidebar-section">
                                <div className="sidebar-heading">Price Range</div>
                                <div className="row g-2 mb-1">
                                    <div className="col-6">
                                        <div className="price-label">Min (Rs.)</div>
                                        <input type="number" className="price-input" placeholder="0"
                                            value={minPrice} onChange={(e) => {
                                                setMinPrice(e.target.value)
                                            }} min="0" />
                                    </div>
                                    <div className="col-6">
                                        <div className="price-label">Max (Rs.)</div>
                                        <input type="number" className="price-input" placeholder="9999" min="0" value={maxPrice} onChange={(e) => {
                                            setMaxPrice(e.target.value)
                                        }} />
                                    </div>
                                </div>
                                <button className="btn-apply" onClick={applyPriceFilter}>
                                    <i className="bi bi-check2 me-1"></i> Apply Price
                                </button>
                            </div>

                            {/* Rating */}
                            <div className="sidebar-section">
                                <div className="sidebar-heading">Rating</div>
                                <label className="rating-row">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value="4"
                                        checked={ratingParam === '4'}
                                        onChange={(e) => applyRatingFilter(e.target.value)}
                                    />
                                    <span className="stars">★★★★☆</span>
                                    <span className="rating-label">4 &amp; above</span>
                                </label>
                                <label className="rating-row">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value="3"
                                        checked={ratingParam === '3'}
                                        onChange={(e) => applyRatingFilter(e.target.value)}
                                    />
                                    <span className="stars">★★★☆☆</span>
                                    <span className="rating-label">3 &amp; above</span>
                                </label>
                                <label className="rating-row">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value="2"
                                        checked={ratingParam === '2'}
                                        onChange={(e) => applyRatingFilter(e.target.value)}
                                    />
                                    <span className="stars">★★☆☆☆</span>
                                    <span className="rating-label">2 &amp; above</span>
                                </label>
                            </div>


                            {/* Availability */}
                            <div className="sidebar-section">
                                <div className="sidebar-heading">Availability</div>
                                <div className="d-flex flex-column gap-2">
                                    <label className="availability-label">
                                        <input type="checkbox" checked={inStockOnly} onChange={toggleInStock} className="availability-checkbox" />
                                        In Stock
                                    </label>
                                </div>
                            </div>

                            {/* Reset */}
                            <button className="btn-reset" onClick={resetFilters}>
                                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset All Filters
                            </button>

                        </div>
                    </div>

                    {/* ── PRODUCTS ── */}
                    <div className="col-12 col-lg-9">

                        {/* Toolbar */}
                        <div className="toolbar">
                            <div className="toolbar-left">
                                {products.length > 0 ? (
                                    <>
                                        Showing <strong>
                                            {(currentPage - 1) * pageSize + 1}–{(currentPage - 1) * pageSize + products.length}
                                        </strong> of <strong>{totalCount}</strong> products
                                    </>
                                ) : (
                                    <>No products to show</>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <label className="sort-label">Sort by</label>
                                <select className="sort-select" aria-label="Sort products" value={ordering} onChange={(e) => {

                                    const next = new URLSearchParams(searchParams)
                                    next.set('ordering', e.target.value)
                                    next.set('page', 1)
                                    setSearchParams(next)
                                }}>
                                    <option value={'-id'}>Most Popular</option>
                                    <option value={'price'}>Price: Low to High</option>
                                    <option value={'-price'}>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <Loader label="Loading products..." />
                        ) : products.length === 0 ? (
                            <div className="store-empty">
                                <div className="empty-icon-wrap">
                                    <i className="bi bi-search"></i>
                                </div>
                                <h2 className="mb-2">
                                    {searchQuery ? 'No products found' : 'Nothing here yet'}
                                </h2>
                                <p className="mb-0">
                                    {searchQuery
                                        ? <>Nothing matched <strong>{searchQuery}</strong>. Try a different word.</>
                                        : 'There are no products available right now.'}
                                </p>
                                {searchQuery && (
                                    <Link
                                        to={categorySlug ? `/store/category/${categorySlug}` : '/store'}
                                        className="clear-all-link d-inline-block mt-3"
                                    >
                                        Clear search
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="row g-3">
                                {products.map((pro) => (
                                    <div className="col-6 col-md-4 col-lg-3" key={pro.id}>
                                        <ProductCard product={pro} isWishlisted={wishlistIds.has(pro.id)} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5">
                                <nav aria-label="Product pagination">
                                    <ul className="pagination pagination-custom mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={(e) => {
                                                e.preventDefault()
                                                if (currentPage > 1) goToPage(currentPage - 1)
                                            }}>
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <li
                                                key={page}
                                                className={`page-item ${currentPage === page ? 'active' : ''}`}
                                            >
                                                <a
                                                    className="page-link"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        goToPage(page)
                                                    }}
                                                >
                                                    {page}
                                                </a>
                                            </li>
                                        ))}

                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={(e) => {
                                                e.preventDefault()
                                                if (currentPage < totalPages) goToPage(currentPage + 1)
                                            }}>
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    )
}

export default Store
