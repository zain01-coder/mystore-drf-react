import React from 'react'
import { data, Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import './login.css'
import api from '../utils/api'
import { setTokens } from '../utils/auth'
import { showToast } from '../utils/toast'
import { useCart } from '../context/CartContext'


/*
response = {
  data: {
    message: "Quantity increased successfully"
  },
  status: 200,
  statusText: "OK",
  headers: {...},
  config: {...},
  request: {...}
}


error = {
  message: "Request failed with status code 404",
  response: {
    data: {
      error: "Item not found"
    },
    status: 404,
    statusText: "Not Found",
    headers: {...},
    config: {...},
    request: {...}
  },
  config: {...},
  request: {...}
}
*/

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit,setError, formState: { errors, isSubmitting } } = useForm()
  const { refreshCart } = useCart()

  const onSubmit = async (data) => {
    try {
      const response = await api.post('accounts/login/', {
        email: data.email,
        password: data.password,
      })

      setTokens(response.data.access_token, response.data.refresh_token)
      showToast('Logged in successfully', 'success')
      refreshCart()
      navigate(location.state?.from || '/')
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Login failed. Please check your email and password.'

      setError('root', {
        type: 'manual',
        message,
      })
    }
  }

  return (
    <main className="login-page auth-page">
      <div className="container login-shell px-3 px-md-4">

        <div className="text-center mb-4 mb-md-5">
          <div className="login-kicker mb-2">Welcome Back</div>
          <h1 className="page-heading mb-2">Login</h1>
          <p className="page-subtext mb-0">Sign in to continue shopping</p>
        </div>

        <div className="login-card p-4 p-md-5">
          <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="alert alert-danger">
                {errors.root.message}
              </div>
            )}
            <div className="col-12">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                placeholder="Enter your email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Enter a valid email'
                  }
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                <label htmlFor="password" className="form-label mb-0">Password</label>
                <Link to="/forgotpassword" className="helper-link small">Forgot Password?</Link>
              </div>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>

            <div className="col-12 pt-2">
              <button
                type="submit"
                className="btn login-btn w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="col-12">
              <div className="security-note p-3 text-center">
                Secure login protected with encrypted authentication.
              </div>
            </div>

          </form>

          <p className="register-text text-center mt-4 mb-0">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>

      </div>
    </main>
  )
}

export default Login
