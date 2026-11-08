// Mensajes de "cargando" y "error" que se repiten en varias páginas.
export function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return <p className="muted" role="status">{texto}</p>
}

export function ErrorApiMensaje({ mensaje }: { mensaje: string }) {
  return (
    <div className="alert alert-danger" role="alert">
      {mensaje}
    </div>
  )
}
