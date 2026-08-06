import React, { useEffect, useState } from 'react'
import './addresses.css'
import '../assets/global/style.css'
import api from '../utils/api'
import Loader from '../components/Loader'
import { showToast } from '../utils/toast'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  country: '',
  state: '',
  city: '',
  is_default: false,
}

const Addresses = () => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await api.get('address/')
      setAddresses(response.data)
    } catch {
      setError('Unable to load your addresses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (address) => {
    setEditingId(address.id)
    setForm({
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      country: address.country,
      state: address.state,
      city: address.city,
      is_default: address.is_default,
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    try {
      if (editingId) {
        await api.put(`address/${editingId}/`, form)
        showToast('Address updated', 'success')
      } else {
        await api.post('address/', form)
        showToast('Address added', 'success')
      }
      closeForm()
      fetchAddresses()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Could not save this address. Please check the fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address? This cannot be undone.')) return

    try {
      await api.delete(`address/${id}/`)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      showToast('Address deleted', 'success')
    } catch {
      showToast('Could not delete this address. Please try again.', 'error')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await api.post(`address/${id}/set_default/`)
      showToast('Default address updated', 'success')
      fetchAddresses()
    } catch {
      showToast('Could not set this as default. Please try again.', 'error')
    }
  }

  if (loading) {
    return <Loader label="Loading your addresses..." />
  }

  return (
    <main className="addresses-page commerce-page">
      <div className="container-xl px-3 px-md-4 pt-4 my-5" style={{ maxWidth: '1060px' }}>

        <div className="addresses-header">
          <div>
            <h1 className="page-heading mb-1">My Addresses</h1>
            <p className="page-subtext mb-0">Save addresses for faster checkout and pick a default anytime.</p>
          </div>
          {!showForm && (
            <button className="addr-btn addr-btn-primary" onClick={openAddForm}>
              <i className="bi bi-plus-lg"></i> Add New Address
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <div className="addr-form-card">
            <h2 className="addr-form-title">{editingId ? 'Edit Address' : 'Add New Address'}</h2>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="first_name">First Name</label>
                  <input type="text" className="form-control" id="first_name" name="first_name"
                    value={form.first_name} onChange={handleChange} required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="last_name">Last Name</label>
                  <input type="text" className="form-control" id="last_name" name="last_name"
                    value={form.last_name} onChange={handleChange} required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input type="text" className="form-control" id="phone" name="phone"
                    value={form.phone} onChange={handleChange} required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="city">City</label>
                  <input type="text" className="form-control" id="city" name="city"
                    value={form.city} onChange={handleChange} required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="state">State</label>
                  <input type="text" className="form-control" id="state" name="state"
                    value={form.state} onChange={handleChange} required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="country">Country</label>
                  <input type="text" className="form-control" id="country" name="country"
                    value={form.country} onChange={handleChange} required />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="address_line_1">Address Line 1</label>
                  <textarea className="form-control" id="address_line_1" name="address_line_1" rows="3"
                    value={form.address_line_1} onChange={handleChange} required></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="address_line_2">Address Line 2</label>
                  <input type="text" className="form-control" id="address_line_2" name="address_line_2"
                    value={form.address_line_2} onChange={handleChange} />
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="is_default" name="is_default"
                      checked={form.is_default} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="is_default">
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className="col-12 addr-form-actions">
                  <button type="button" className="addr-btn addr-btn-ghost" onClick={closeForm} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="addr-btn addr-btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Address'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {!error && addresses.length === 0 && !showForm ? (
          <div className="addresses-empty">
            <div className="empty-icon-wrap">
              <i className="bi bi-geo-alt"></i>
            </div>
            <h2 className="page-heading mb-2">No saved addresses</h2>
            <p className="page-subtext mb-3">Add an address to speed up checkout next time.</p>
            <button className="addr-btn addr-btn-primary" onClick={openAddForm}>
              <i className="bi bi-plus-lg"></i> Add New Address
            </button>
          </div>
        ) : (
          <div className="addresses-grid">
            {addresses.map((address) => (
              <article className="address-card" key={address.id}>
                <div className="address-card-top">
                  <div className="address-icon"><i className="bi bi-house-fill"></i></div>
                  {address.is_default && (
                    <span className="addr-badge badge-default">
                      <i className="bi bi-check-circle-fill"></i> Default
                    </span>
                  )}
                </div>

                <div className="address-card-body">
                  <div className="address-name">{address.first_name} {address.last_name}</div>
                  <div className="address-text">
                    {address.address_line_1}
                    {address.address_line_2 ? `, ${address.address_line_2}` : ''}, {address.city}, {address.state}, {address.country}
                  </div>
                  <div className="address-phone"><i className="bi bi-telephone-fill"></i> {address.phone}</div>
                </div>

                <div className="address-card-actions">
                  {!address.is_default && (
                    <button className="addr-link-btn" onClick={() => handleSetDefault(address.id)}>
                      <i className="bi bi-check2-circle"></i> Set as Default
                    </button>
                  )}
                  <button className="addr-link-btn" onClick={() => openEditForm(address)}>
                    <i className="bi bi-pencil"></i> Edit
                  </button>
                  <button className="addr-link-btn addr-link-danger" onClick={() => handleDelete(address.id)}>
                    <i className="bi bi-trash"></i> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}

export default Addresses
