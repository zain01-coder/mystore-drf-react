import React from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const CheckoutForm = ({ formId, orderNumber, onProcessingChange, onErrorChange }) => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    onProcessingChange(true)
    onErrorChange('')

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success/${orderNumber}`,
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      onErrorChange(stripeError.message)
      onProcessingChange(false)
      return
    }

    // No redirect happened (e.g. card payments) — only now is it safe to navigate.
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      window.location.href = `${window.location.origin}/order-success/${orderNumber}`
    } else {
      onErrorChange('Payment was not completed. Please try again.')
      onProcessingChange(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <PaymentElement />
    </form>
  )
}

export default CheckoutForm
