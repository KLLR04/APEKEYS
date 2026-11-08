import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import ModalConfirmacion from '../components/ModalConfirmacion'
import { ConfirmContext } from './ConfirmContext'
import type { OpcionesConfirmacion } from './ConfirmContext'

// Un solo modal para toda la app. Cualquier página llama:
//   const ok = await confirmar({ titulo: 'Eliminar', mensaje: '¿Seguro?', peligroso: true })
export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opciones, setOpciones] = useState<OpcionesConfirmacion | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  const confirmar = useCallback(
    (nuevas: OpcionesConfirmacion) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve
        setOpciones(nuevas)
      }),
    [],
  )

  const responder = useCallback((ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setOpciones(null)
  }, [])

  const aceptar = useCallback(() => responder(true), [responder])
  const cancelar = useCallback(() => responder(false), [responder])
  const valor = useMemo(() => ({ confirmar }), [confirmar])

  return (
    <ConfirmContext.Provider value={valor}>
      {children}
      <ModalConfirmacion
        abierto={opciones !== null}
        titulo={opciones?.titulo ?? ''}
        mensaje={opciones?.mensaje ?? ''}
        textoConfirmar={opciones?.textoConfirmar}
        peligroso={opciones?.peligroso}
        onConfirmar={aceptar}
        onCancelar={cancelar}
      />
    </ConfirmContext.Provider>
  )
}
