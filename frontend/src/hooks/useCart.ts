import { useContext } from 'react'
import { CartContext } from '../context/CartContext'

export function useCart() {
  const valor = useContext(CartContext)
  if (!valor) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return valor
}
