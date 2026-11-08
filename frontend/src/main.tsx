import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App'
import AuthProvider from './context/AuthProvider'
import CartProvider from './context/CartProvider'
import ToastProvider from './context/ToastProvider'

// Orden de los "envoltorios": cada uno puede usar a los que tiene por fuera.
// Toast (avisos) > Auth (sesión) > Cart (carrito, necesita saber quién es el usuario).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
