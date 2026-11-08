import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from './CartContext'
import type { ItemCarrito, Producto } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

function leer(clave: string): ItemCarrito[] {
  try {
    const crudo = localStorage.getItem(clave)
    const datos: unknown = crudo ? JSON.parse(crudo) : []
    return Array.isArray(datos) ? (datos as ItemCarrito[]) : []
  } catch {
    return []
  }
}

// El carrito vive en localStorage (es del navegador, no del servidor) y es por usuario:
// un cliente no ve lo que agregó otro.
export default function CartProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const { mostrar } = useToast()
  const clave = `apekeys_carrito_${usuario ? usuario.id : 'invitado'}`

  // El estado recuerda a qué carrito (clave) pertenecen los items. Si cambia el usuario,
  // la clave ya no coincide y se vuelve a leer el carrito de ese usuario desde localStorage.
  const [guardado, setGuardado] = useState(() => ({ clave, items: leer(clave) }))
  const items = guardado.clave === clave ? guardado.items : leer(clave)

  const valor = useMemo(() => {
    function guardar(nuevos: ItemCarrito[]) {
      try {
        localStorage.setItem(clave, JSON.stringify(nuevos))
      } catch {
        /* almacenamiento lleno: el carrito no se guarda */
      }
      setGuardado({ clave, items: nuevos })
    }

    function agregar(producto: Producto, cantidad: number) {
      if (!producto.activo || producto.stock <= 0) {
        mostrar('Producto sin stock disponible', true)
        return
      }
      const unidades = Math.max(1, Math.min(Math.floor(Number(cantidad)) || 1, producto.stock))
      const existe = items.some((i) => i.productId === producto.id)
      guardar(
        existe
          ? items.map((i) =>
              i.productId === producto.id
                ? { ...i, cantidad: Math.min(i.cantidad + unidades, producto.stock) }
                : i,
            )
          : [...items, { productId: producto.id, cantidad: unidades }],
      )
      mostrar(`${producto.nombre} agregado al carrito`)
    }

    return {
      items,
      totalUnidades: items.reduce((suma, i) => suma + i.cantidad, 0),
      agregar,
      cambiarCantidad: (productId: number, cantidad: number) =>
        guardar(items.map((i) => (i.productId === productId ? { ...i, cantidad } : i))),
      quitar: (productId: number) => guardar(items.filter((i) => i.productId !== productId)),
      reemplazar: guardar,
      vaciar: () => guardar([]),
    }
  }, [clave, items, mostrar])

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>
}
