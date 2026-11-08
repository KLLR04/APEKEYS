import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
// Bootstrap primero; index.css después para que el tema de APEKEYS lo sobrescriba.
import 'bootstrap/dist/css/bootstrap.min.css'
// Fuentes instaladas con npm (vienen dentro del proyecto, no necesitan internet):
// Inter para el texto y Poppins para títulos, botones y precios.
import '@fontsource-variable/inter'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/800.css'
import './index.css'
import App from './App'
import AuthProvider from './context/AuthProvider'
import CartProvider from './context/CartProvider'
import ToastProvider from './context/ToastProvider'
import ConfirmProvider from './context/ConfirmProvider'

// Orden de los "envoltorios": cada uno puede usar a los que tiene por fuera.
// Toast (avisos) > Confirm (modal) > Auth (sesión) > Cart (carrito, necesita saber quién es el usuario).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
