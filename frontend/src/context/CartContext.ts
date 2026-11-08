import { createContext } from 'react'
import type { ItemCarrito, Producto } from '../types'

export interface CartValor {
  items: ItemCarrito[]
  totalUnidades: number
  agregar: (producto: Producto, cantidad: number) => void
  cambiarCantidad: (productId: number, cantidad: number) => void
  quitar: (productId: number) => void
  reemplazar: (items: ItemCarrito[]) => void
  vaciar: () => void
}

export const CartContext = createContext<CartValor | null>(null)
