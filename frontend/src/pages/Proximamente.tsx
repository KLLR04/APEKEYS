import { Link, useParams } from 'react-router'
import ContadorLanzamiento from '../components/ContadorLanzamiento'
import { LANZAMIENTOS, buscarLanzamiento } from '../data/lanzamientos'
import { useTitulo } from '../hooks/useTitulo'

export default function Proximamente() {
  const { juego: clave } = useParams()
  // Si la clave no existe se muestra GTA VI, igual que en el original.
  const juego = buscarLanzamiento(clave) ?? LANZAMIENTOS[0]
  useTitulo(`${juego.nombre} | Próximamente`)

  return (
    <div className="container" style={{ maxWidth: 1000 }}>
      {/* El mismo componente del inicio, ahora con los datos del juego de la URL */}
      <ContadorLanzamiento
        nombre={juego.nombre}
        fechaLanzamiento={juego.fechaLanzamiento}
        imagen={juego.imagen}
        descripcion={juego.descripcion}
      />
      <Link className="btn btn-outline-success mt-3" to="/">
        Volver al inicio
      </Link>
    </div>
  )
}
