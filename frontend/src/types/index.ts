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
  stock: number
  stockCritico: number
  descripcion: string
  imagen: string
  activo: boolean
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
