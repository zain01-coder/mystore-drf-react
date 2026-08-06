import React, { useState } from 'react'
import '../index.css'
import './verifyemail.css'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'
import { showToast } from '../utils/toast'

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()


    const email = location.state?.email

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return
        if (!/^[0-9]*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setError('') // Clear error when user types

        // Auto-focus next input
        if (value !== '' && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const otpString = otp.join('')
        if (otpString.length != 6) {
            setError("Please enter a 6 digit code")
            return
        }
        const payload = {
            email: email,
            otp: otpString
        }
        try {
            setLoading(true)
            await api.post('accounts/verify-email/', payload)
            navigate('/login')
        }
        catch (err) {
            const msg = err.response?.data?.message || 'Invalid or expired OTP. Try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }

    }

    const handleResend = async () => {
        try {
            setLoading(true)
            // Call resend OTP API
            const response = await api.post('accounts/resend-otp/', { email: email })
            console.log('OTP Resent:', response.data)
            showToast('OTP has been resent to your email', 'success')
            setOtp(['', '', '', '', '', ''])
            setError('')
        } catch (err) {
            console.error('Resend Error:', err.response?.data || err.message)
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <main className="verify-page auth-page">
                <div className="container verify-shell px-3 px-md-4">
                    <div className="text-center mb-4 mb-md-5">
                        <div className="verify-kicker mb-2">Email Verification</div>
                        <h1 className="page-heading mb-2">Verify Your Email</h1>
                        <p className="page-subtext mb-0">Enter the 6-digit code sent to your email</p>
                    </div>

                    <div className="verify-card p-4 p-md-5">
                        <form onSubmit={handleSubmit}>
                            <div className="otp-container mb-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="otp-input"
                                        placeholder="-"
                                        disabled={loading}
                                    />
                                ))}
                            </div>

                            {error && <div className="otp-error text-center mb-3 text-danger">{error}</div>}

                            <button type="submit" disabled={loading} className="btn verify-btn w-100 mb-3">
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>

                            <p className="resend-text text-center mb-0">
                                Didn't receive the code?
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="resend-link"
                                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Resend
                                </button>
                            </p>
                        </form>

                        <p className="back-text text-center mt-4 mb-0">
                            <Link to="/login" className="back-link">Back to Login</Link>
                        </p>
                    </div>
                </div>
            </main>
        </>
    )
}

export default VerifyEmail
