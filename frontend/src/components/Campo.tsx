import type { ReactNode } from 'react'

interface Props {
  etiqueta: ReactNode
  htmlFor?: string
  ayuda?: ReactNode
  error?: string
  className?: string
  children: ReactNode
}

// Etiqueta + control + ayuda + mensaje de error. Es el "field" del HTML original.
export default function Campo({ etiqueta, htmlFor, ayuda, error, className = '', children }: Props) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={htmlFor}>
      {etiqueta}
      {children}
      {ayuda && <span className="field-hint muted">{ayuda}</span>}
      <span className="field-error">{error}</span>
    </label>
  )
}
