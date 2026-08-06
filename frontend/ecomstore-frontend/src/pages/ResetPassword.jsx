import React from 'react'
import './resetpassword.css'
import '../assets/global/style.css'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { showToast } from '../utils/toast'


const ResetPassword = () => {
    const navigate = useNavigate()
    const { uid, token } = useParams()

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm()


    const onSubmit = async (data) => {
        const submitData = {
            uid,
            token,
            password: data.password,
            password2: data.password2,
        }
        try {

            const response = await api.post('accounts/reset-password/', submitData)

            console.log('Response:', response.data)
            showToast('Password changed successfully!', 'success')
            navigate('/login')
        }
        catch (err) {
            const serverErrors = err.response?.data

            if (serverErrors && typeof serverErrors === 'object') {
                Object.keys(serverErrors).forEach((fieldName) => {
                    const errorMessage = Array.isArray(serverErrors[fieldName])
                        ? serverErrors[fieldName][0]
                        : serverErrors[fieldName]

                    setError(fieldName === 'token' ? 'root' : fieldName, {
                        type: 'manual',
                        message: errorMessage
                    })
                })
            } else {
                setError('root', {
                    type: 'manual',
                    message: err.message || 'An error occurred'
                })
            }
        }
    }
    return (
        <>
            <main className="reset-page auth-page">
                <div className="container reset-shell px-3 px-md-4">
                    <div className="text-center mb-4 mb-md-5">
                        <div className="reset-kicker mb-2">Create New Password</div>
                        <h1 className="reset-title mb-2">Reset your password</h1>
                        <p className="reset-subtitle mb-0">Choose a strong new password for your account and confirm it below.</p>
                    </div>

                    <div className="reset-card p-4 p-md-5">

                        <div className="row g-4 align-items-center">
                            <div className="col-12 col-lg-5">
                                <div className="reset-info-panel">
                                    <div className="info-icon mb-3">
                                        <i className="bi bi-key-fill"></i>
                                    </div>
                                    <h2 className="info-title">Keep your account secure</h2>
                                    <p className="info-text">Your new password should be easy for you to remember and hard for others to
                                        guess.</p>

                                    <div className="tip-list">
                                        <div className="tip-item">
                                            <i className="bi bi-check2-circle"></i>
                                            <span>Use at least 8 characters</span>
                                        </div>
                                        <div className="tip-item">
                                            <i className="bi bi-check2-circle"></i>
                                            <span>Mix letters, numbers, and symbols when possible</span>
                                        </div>
                                        <div className="tip-item">
                                            <i className="bi bi-check2-circle"></i>
                                            <span>Avoid using old or commonly guessed passwords</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-7">
                                <form onSubmit={handleSubmit(onSubmit)} className="reset-form">
                                    {errors.root && <div className="text-danger text-center mb-3">{errors.root.message}</div>}

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label">New Password</label>
                                        <input {...register('password', { required: 'This field is required', minLength: { value: 8, message: 'Password should contain 8 characters' }, maxLength: { value: 12, message: "Password can't contain more than 12 characters" } })} type="password" className="form-control" id="password"
                                            placeholder="Enter your new password" required />
                                        {errors.password && <span className="text-danger">{errors.password.message}</span>}
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                                        <input {...register('password2', { required: 'This field is required', minLength: { value: 8, message: 'Password should contain 8 characters' }, maxLength: { value: 12, message: "Password can't contain more than 12 characters" }, validate: (value) => value === watch('password') || 'Passwords do not match' })} type="password" className="form-control" id="confirm_password" 
                                            placeholder="Confirm your new password" required />
                                        <div className="form-text">Make sure both fields match before submitting.</div>
                                        {errors.password2 && <span className="text-danger">{errors.password2.message}</span>}
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="btn reset-btn w-100 mb-3">
                                        {isSubmitting ? 'Updating...' : 'Update Password'}
                                    </button>

                                    <div className="back-row text-center">
                                        <span className="text-muted">Need to return?</span>
                                        <Link to={'/login'}  className="back-link ms-1">Back to login</Link>
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

export default ResetPassword
