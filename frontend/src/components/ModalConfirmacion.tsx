import { useEffect, useRef } from 'react'

export interface PropsModal {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  peligroso?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

// Modal de Bootstrap controlado por React (no necesita el JavaScript de Bootstrap).
// Reemplaza a window.confirm(): se ve igual que el resto del sitio y se puede probar.
export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligroso = false,
  onConfirmar,
  onCancelar,
}: PropsModal) {
  const botonCancelar = useRef<HTMLButtonElement>(null)

  // Al abrir: foco en "Cancelar" (la opción segura) y Escape cierra.
  useEffect(() => {
    if (!abierto) return
    botonCancelar.current?.focus()
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [abierto, onCancelar])

  if (!abierto) return null

  return (
    <>
      <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="modalTitulo" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5" id="modalTitulo">
                {titulo}
              </h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCancelar} />
            </div>
            <div className="modal-body">
              <p className="mb-0">{mensaje}</p>
            </div>
            <div className="modal-footer">
              <button ref={botonCancelar} type="button" className="btn btn-secondary" onClick={onCancelar}>
                Cancelar
              </button>
              <button
                type="button"
                className={`btn ${peligroso ? 'btn-danger' : 'btn-primary'}`}
                onClick={onConfirmar}
              >
                {textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" onClick={onCancelar} />
    </>
  )
}
