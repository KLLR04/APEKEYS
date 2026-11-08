import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './ToastContext'

// Mensaje flotante abajo a la derecha (era showToast en js/app.js).
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ texto: string; esError: boolean } | null>(null)
  const temporizador = useRef<number | undefined>(undefined)

  const mostrar = useCallback((texto: string, esError = false) => {
    window.clearTimeout(temporizador.current)
    setToast({ texto, esError })
    temporizador.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const valor = useMemo(() => ({ mostrar }), [mostrar])

  return (
    <ToastContext.Provider value={valor}>
      {children}
      {toast && (
        <div className={`app-message alert ${toast.esError ? 'alert-danger' : 'alert-success'}`}>
          {toast.texto}
        </div>
      )}
    </ToastContext.Provider>
  )
}
