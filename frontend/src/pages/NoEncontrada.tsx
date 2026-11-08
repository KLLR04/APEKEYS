import { Link } from 'react-router'
import { useTitulo } from '../hooks/useTitulo'

// Ruta comodín (path="*"): cualquier URL que ninguna otra ruta reconoce.
export default function NoEncontrada() {
  useTitulo('Página no encontrada | APEKEYS')

  return (
    <div className="contenedor">
      <div className="card empty-state">
        <h1>Página no encontrada</h1>
        <p>La dirección no existe o fue movida.</p>
        <Link className="btn btn-primary" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
