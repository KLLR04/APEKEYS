import { useNavigate } from 'react-router'
import { useAuth } from './useAuth'
import { useCart } from './useCart'
import type { Producto } from '../types'

// Igual que addToCart() del original: sin sesión, manda al login.
export function useAgregarAlCarrito() {
  const { usuario } = useAuth()
  const { agregar } = useCart()
  const navigate = useNavigate()

  return (producto: Producto, cantidad = 1) => {
    if (!usuario) {
      navigate('/login?next=/catalogo')
      return
    }
    agregar(producto, cantidad)
  }
}
