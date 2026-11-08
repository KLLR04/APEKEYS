import type { Usuario } from '../types'
import { enviar, pedir } from './api'

export const listarUsuarios = () => pedir<Usuario[]>('/usuarios')

export const obtenerUsuario = (id: number | string) => pedir<Usuario>(`/usuarios/${id}`)

// json-server filtra con ?campo=valor (coincidencia exacta).
export const buscarUsuarioPorEmail = (email: string) =>
  pedir<Usuario[]>(`/usuarios?email=${encodeURIComponent(email)}`)

export const crearUsuario = (datos: Omit<Usuario, 'id'>) =>
  enviar<Usuario>('/usuarios', 'POST', datos)

export const actualizarUsuario = (usuario: Usuario) =>
  enviar<Usuario>(`/usuarios/${usuario.id}`, 'PUT', usuario)

export const modificarUsuario = (id: number, cambios: Partial<Usuario>) =>
  enviar<Usuario>(`/usuarios/${id}`, 'PATCH', cambios)

export const eliminarUsuario = (id: number) => pedir<unknown>(`/usuarios/${id}`, { method: 'DELETE' })
