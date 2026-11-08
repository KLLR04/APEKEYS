// Tipos que describen la forma de los datos de db.json.
// TypeScript solo los usa al escribir/compilar: en el navegador desaparecen.

export type Rol = 'admin' | 'cliente' | 'vendedor'

export interface Producto {
  id: number
  codigo: string
  nombre: string
  categoria: string
  plataforma: string
  precio: number
  // Precio rebajado (opcional). Si existe y es menor que precio, el producto está en oferta.
  precioOferta?: number | null
  stock: number
  stockCritico: number
  descripcion: string
  imagen: string
  activo: boolean
  // Id del juego en la tienda de Steam (para traer capturas de gameplay). null si no está en Steam.
  steamAppId?: number | null
  // Capturas propias guardadas en public/img (para juegos que no están en Steam, ej. Nintendo).
  galeria?: string[]
}

export interface Usuario {
  id: number
  run: string
  nombre: string
  apellidos: string
  email: string
  password: string
  rol: Rol
  fechaNacimiento?: string
  region: string
  comuna: string
  direccion: string
  activo: boolean
}

// Lo que se guarda como "usuario conectado": nunca incluye la contraseña.
export type Sesion = Pick<Usuario, 'id' | 'nombre' | 'apellidos' | 'email' | 'rol'>

export interface LineaOrden {
  productId: number
  codigo: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

export interface Orden {
  id: number
  usuarioId: number
  usuario: string
  fecha: string
  total: number
  estado: string
  detalle: LineaOrden[]
  // Datos que el cliente confirma en el checkout
  comprador?: { nombre: string; email: string; direccion: string; comuna: string; region: string }
  entrega?: string
}

export interface Mensaje {
  id: number
  nombre: string
  email: string
  comentario: string
  fecha: string
}

export interface Blog {
  id: number
  titulo: string
  resumen: string
  imagen: string
  fecha: string
  contenido: string[]
}

export interface Region {
  id: number
  nombre: string
  comunas: string[]
}

// El carrito solo guarda qué producto y cuántas unidades.
// El precio y el stock se leen siempre del producto actual.
export interface ItemCarrito {
  productId: number
  cantidad: number
}
