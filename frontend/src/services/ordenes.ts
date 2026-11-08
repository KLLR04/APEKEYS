import type { Orden } from '../types'
import { enviar, pedir } from './api'

export const listarOrdenes = () => pedir<Orden[]>('/ordenes')

export const crearOrden = (datos: Omit<Orden, 'id'>) => enviar<Orden>('/ordenes', 'POST', datos)

export const obtenerOrden = (id: number | string) => pedir<Orden>(`/ordenes/${id}`)
