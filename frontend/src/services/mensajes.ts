import type { Mensaje } from '../types'
import { enviar } from './api'

export const crearMensaje = (datos: Omit<Mensaje, 'id'>) =>
  enviar<Mensaje>('/mensajes', 'POST', datos)
