import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'
import { isAuthenticated } from '../utils/auth'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0)

  const refreshCart = async () => {
    if (!isAuthenticated()) {
      setCartCount(0)
      return
    }
    try {
      const response = await api.get('cart/')
      const count = response.data.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch {
      setCartCount(0)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
