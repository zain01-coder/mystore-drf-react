import React, { useState } from 'react'
import '../assets/global/style.css'
import './forgotpassword.css'
import { Link } from 'react-router-dom'
import api from '../utils/api'


const ForgotPassword = () => {
    const [loading, setloading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [form, setform] = useState({
        email: ''
    })

    const handle_form_input = (e) => {
        setError('')
        setSuccess('')
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setloading(true)
            setError('')
            setSuccess('')
            const response = await api.post('accounts/forgot-password/', { email: form.email })
            console.log(response.data)
            setSuccess(response.data.message || 'Password reset link has been sent to your email.')
        }
        catch (err) {
            console.error('Resend Error:', err.response?.data || err.message)
            const message =
                err.response?.data?.email?.[0] ||
                err.response?.data?.email ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'Failed to send OTP. Please try again.'

            setError(message)
        }
        finally {
            setloading(false)
        }

    }

    return (
        <>
            <main className="forgot-page auth-page">
                <div className="container forgot-shell px-3 px-md-4">
                    <div className="text-center mb-4 mb-md-5">
                        <div className="forgot-kicker mb-2">Account Recovery</div>
                        <h1 className="forgot-title mb-2">Forgot your password?</h1>
                        <p className="forgot-subtitle mb-0">Enter your email address and we will help you reset access to your account.
                        </p>
                    </div>

                    <div className="forgot-card p-4 p-md-5">

                        <div className="row g-4 align-items-center">
                            <div className="col-12 col-lg-5">
                                <div className="forgot-info-panel">
                                    <div className="info-icon mb-3">
                                        <i className="bi bi-shield-lock"></i>
                                    </div>
                                    <h2 className="info-title">Secure password reset</h2>
                                    <p className="info-text">We will send a recovery link to your inbox so you can create a new password
                                        safely.</p>

                                    <div className="info-points">
                                        <div className="info-point">
                                            <i className="bi bi-envelope-paper"></i>
                                            <span>Use the email address connected to your account</span>
                                        </div>
                                        <div className="info-point">
                                            <i className="bi bi-clock-history"></i>
                                            <span>Recovery emails usually arrive within a few minutes</span>
                                        </div>
                                        <div className="info-point">
                                            <i className="bi bi-check2-circle"></i>
                                            <span>Your account stays protected during the reset process</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-7">

                                <form onSubmit={handleSubmit} className="forgot-form">

                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label">Email Address</label>
                                        {error && <div className="otp-error text-center mb-3 text-danger">{error}</div>}
                                        {success && <div className="otp-error text-center mb-3 text-success">{success}</div>}
                                        <input type="email" className="form-control" id="email" name="email"
                                            placeholder="Enter your registered email" value={form.email} required onChange={handle_form_input} />
                                        <div className="form-text">We will send a reset link only if an account exists for this email.
                                        </div>
                                    </div>

                                    <button disabled={loading} type="submit" className="btn forgot-btn w-100 mb-3">
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>

                                    <div className="back-row text-center">
                                        <span className="text-muted">Remembered your password?</span>
                                        <Link to="/login" className="back-link ms-1">Back to login</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default ForgotPassword
