import { createContext } from 'react'

export interface ToastValor {
  mostrar: (texto: string, esError?: boolean) => void
}

export const ToastContext = createContext<ToastValor | null>(null)
