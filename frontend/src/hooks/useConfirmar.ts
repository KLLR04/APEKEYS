import { useContext } from 'react'
import { ConfirmContext } from '../context/ConfirmContext'

export function useConfirmar() {
  const valor = useContext(ConfirmContext)
  if (!valor) throw new Error('useConfirmar debe usarse dentro de <ConfirmProvider>')
  return valor.confirmar
}
