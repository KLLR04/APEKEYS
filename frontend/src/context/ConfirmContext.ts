import { createContext } from 'react'

export interface OpcionesConfirmacion {
  titulo: string
  mensaje: string
  textoConfirmar?: string
  peligroso?: boolean
}

// confirmar() abre el modal y devuelve una promesa: true si el usuario acepta.
export interface ConfirmValor {
  confirmar: (opciones: OpcionesConfirmacion) => Promise<boolean>
}

export const ConfirmContext = createContext<ConfirmValor | null>(null)
