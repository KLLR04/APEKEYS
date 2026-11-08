import { createContext } from 'react'
import type { Sesion, Usuario } from '../types'

export type ResultadoAuth =
  | { ok: true; sesion: Sesion }
  | { ok: false; campo?: 'run' | 'email'; mensaje: string }

export interface AuthValor {
  usuario: Sesion | null
  // true mientras se confirma con la API quién es el usuario guardado en sessionStorage
  cargando: boolean
  // true si la persona acaba de cerrar sesión (para no mandarla a /login?next=<página protegida>)
  sesionCerrada: boolean
  iniciarSesion: (email: string, password: string) => Promise<ResultadoAuth>
  registrar: (datos: Omit<Usuario, 'id'>) => Promise<ResultadoAuth>
  cerrarSesion: () => void
}

export const AuthContext = createContext<AuthValor | null>(null)
