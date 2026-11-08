import type { Producto } from '../types'
import { enviar, pedir } from './api'

export const listarProductos = () => pedir<Producto[]>('/productos')

export const obtenerProducto = (id: number | string) => pedir<Producto>(`/productos/${id}`)

export const crearProducto = (datos: Omit<Producto, 'id'>) =>
  enviar<Producto>('/productos', 'POST', datos)

export const actualizarProducto = (producto: Producto) =>
  enviar<Producto>(`/productos/${producto.id}`, 'PUT', producto)

// PATCH cambia solo los campos indicados (ej. { stock: 4 } o { activo: false }).
export const modificarProducto = (id: number, cambios: Partial<Producto>) =>
  enviar<Producto>(`/productos/${id}`, 'PATCH', cambios)

export const eliminarProducto = (id: number) => pedir<unknown>(`/productos/${id}`, { method: 'DELETE' })
