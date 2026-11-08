import { Link, useParams } from 'react-router'
import { useTitulo } from '../hooks/useTitulo'

const JUEGOS = {
  gta6: {
    nombre: 'Grand Theft Auto VI',
    imagen:
      'https://media-rockstargames-com.akamaized.net/mfe6/prod/__common/img/f7eab33a4989ce5f0cd89c70723909b3.jpg',
    descripcion: 'Una nueva aventura de mundo abierto ambientada en Vice City y Leonida.',
    fecha: 'Próximo lanzamiento. Todavía no está disponible en el catálogo de APEKEYS.',
  },
  fc27: {
    nombre: 'EA Sports FC 27',
    imagen:
      'https://drop-assets.ea.com/images/15VqAXZo2fThrwnnfx5cX7/5e8f03989e7dd09e7a150cb0ce784bec/fc-27-ultimate-plus-key-art-16x9.jpg?im=AspectCrop=(16,9),xPosition=0.4354166666666667,yPosition=0.4356481481481482',
    descripcion: 'La próxima entrega de la serie de fútbol de EA Sports.',
    fecha: 'Lanzamiento general anunciado para el 25 de septiembre de 2026.',
  },
}

export default function Proximamente() {
  const { juego: clave } = useParams()
  // Si la clave no existe se muestra GTA VI, igual que en el original.
  const juego = JUEGOS[clave as keyof typeof JUEGOS] ?? JUEGOS.gta6
  useTitulo(`${juego.nombre} | Próximamente`)

  return (
    <div className="contenedor">
      <article className="card coming-card">
        <img className="coming-image" src={juego.imagen} alt={`Imagen de ${juego.nombre}`} />
        <div className="coming-body">
          <span className="coming-label">Próximamente</span>
          <h1>{juego.nombre}</h1>
          <p className="muted">{juego.descripcion}</p>
          <p>{juego.fecha}</p>
          <Link className="btn btn-outline-success" to="/">
            Volver al inicio
          </Link>
        </div>
      </article>
    </div>
  )
}
