import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/global/tokens.css'
import './assets/global/style.css'
import './index.css'
import router from './router/router.jsx'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CategoryProvider } from './context/CategoryContext'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      containerStyle={{ top: 90 }}   // clears the sticky navbar, same offset as before
      gutter={12}                    // matches --space-3 gap between stacked toasts
    />
    <CategoryProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </CategoryProvider>
  </StrictMode>,
)
