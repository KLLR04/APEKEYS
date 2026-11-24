import type { Categoria } from '../types'
import { enviar, pedir } from './api'
import { listarProductos, modificarProducto } from './productos'

// Texto que reciben los productos cuando se elimina su categoría (así no quedan en blanco).
export const SIN_CATEGORIA = 'Sin categoría'

// La ruta /software filtra por esta categoría, por eso no se puede renombrar ni eliminar.
export const CATEGORIA_PROTEGIDA = 'Software'

export const listarCategorias = () => pedir<Categoria[]>('/categorias')

export const crearCategoria = (datos: Omit<Categoria, 'id'>) =>
  enviar<Categoria>('/categorias', 'POST', datos)

export const actualizarCategoria = (categoria: Categoria) =>
  enviar<Categoria>(`/categorias/${categoria.id}`, 'PUT', categoria)

export const eliminarCategoria = (id: number) => pedir<unknown>(`/categorias/${id}`, { method: 'DELETE' })

// El producto guarda el NOMBRE de su categoría (texto), no un id. Por eso, al renombrar o
// eliminar una categoría hay que actualizar a mano los productos que la usaban.
// Se filtra en el cliente (===) para que la coincidencia sea exacta.
// Orden recomendado: llamar a esta función ANTES de tocar la categoría. Si se corta a la mitad,
// la categoría sigue intacta y basta con repetir la acción (los ya cambiados no se vuelven a tocar).
export async function reasignarProductos(anterior: string, nueva: string) {
  const productos = await listarProductos()
  const afectados = productos.filter((p) => p.categoria === anterior)
  for (const p of afectados) await modificarProducto(p.id, { categoria: nueva })
  return afectados.length
}
