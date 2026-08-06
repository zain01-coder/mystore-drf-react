import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import '../assets/global/style.css'
import './signup.css'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { showToast } from '../utils/toast'

/*
error = {

    message: "Request failed with status code 401",

    config: {
        ...
    },

    response: {
        status: 401,

        data: {
            ...
        }
    }
}
*/

const Signup = () => {
  // const [form, setform] = useState({
  //   first_name:"",
  //   last_name:"",
  //   email:"",
  //   phonenumber:"",
  //   password:"",
  //   password2:"",
  // }) 

  // const {first_name, last_name, email, phonenumber, password, password2} = form

  // const handleChange = (e) => { 
  //   setform({...form, [e.target.name]:e.target.value})
  //  }

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm()


  const onSubmit = async (data) => {

    try {
      clearErrors()

      // Extract username from email (part before @)
      const username = data.email.split('@')[0]

      // Add username to the data object
      const submitData = {
        ...data,
        username: username
      }

      console.log('Form data:', submitData)

      const response = await api.post('accounts/register/', submitData)

      console.log('Response:', response.data)
      showToast('Account created successfully! Please verify your email.', 'success')
      navigate('/verify-email', { state: { email: data.email, from: 'signup' } })


    } catch (error) {
      console.error('Error:', error.response?.data || error.message)

      // Handle server-side validation errors
      if (error.response?.data) {
        const serverErrors = error.response.data

        // Check if errors is an object with field-specific errors
        Object.keys(serverErrors).forEach((fieldName) => {
          const errorMessage = Array.isArray(serverErrors[fieldName])
            ? serverErrors[fieldName][0]
            : serverErrors[fieldName]

          const formField = fieldName === 'username' ? 'email' : fieldName

          setError(formField, {
            type: 'manual',
            message: errorMessage
          })
        })
      } else {
        // Fallback for general errors
        setError('submit', {
          type: 'manual',
          message: error.message || 'An error occurred'
        })
      }
    }
  }

  return (
    <>
      <main className="registration-page auth-page">
        <div className="container registration-shell px-3 px-md-4">
          <div className="text-center mb-4 mb-md-5">
            <div className="registration-kicker mb-2">Welcome</div>
            <h1 className="page-heading mb-2">Create Account</h1>
            <p className="page-subtext mb-0">Register to start shopping</p>
          </div>

          <div className="registration-card p-4 p-md-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <input type="text" {...register('first_name', { required: 'This field is required' })} id="first_name" className="form-control" placeholder="Enter your first name" />
                  {errors.first_name && <span className="text-danger">{errors.first_name.message}</span>}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <input type="text" {...register('last_name', { required: 'This field is required' })} id="last_name" className="form-control" placeholder="Enter your last name" />
                  {errors.last_name && <span className="text-danger">{errors.last_name.message}</span>}
                </div>

                <div className="col-12">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" {...register('email', { required: 'This field is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }, onChange: () => clearErrors(['email', 'username']) })} id="email" className="form-control" placeholder="you@example.com" />
                  {errors.email && <span className="text-danger">{errors.email.message}</span>}
                </div>


                <div className="col-12">
                  <label htmlFor="phonenumber" className="form-label">Phone Number</label>
                  <input type="text" {...register('phonenumber', { required: 'This field is required' })} id="phonenumber" className="form-control" placeholder="(123) 456-7890" />
                  {errors.phonenumber && <span className="text-danger">{errors.phonenumber.message}</span>}
                </div>


                <div className="col-12 col-md-6">
                  <label htmlFor="password" className="form-label">Create Password</label>
                  <input type="password" {...register('password', { required: 'This field is required', minLength: { value: 8, message: 'Password should contain 8 characters' }, maxLength: { value: 12, message: "Password can't contain more than 12 characters" } })} id="password" className="form-control" placeholder="Create a strong password" />
                  {errors.password && <span className="text-danger">{errors.password.message}</span>}
                  <div className="password-hint mt-2">Use a strong password with letters, numbers, and symbols.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="password2" className="form-label">Confirm Password</label>
                  <input type="password" {...register('password2', { required: 'This field is required', validate: (value) => value === watch('password') || 'Passwords do not match' })} id="password2" className="form-control" placeholder="Confirm your password" />
                  {errors.password2 && <span className="text-danger">{errors.password2.message}</span>}
                </div>

                <div className="col-12 pt-2">
                  <button type="submit" disabled={isSubmitting} className="btn register-btn w-100">{isSubmitting ? 'Registering...' : 'Register'}</button>
                </div>
              </div>
            </form>

            <p className="login-text text-center mt-4 mb-0">
              Already have an account?
              <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

export default Signup
