import { Link } from 'react-router'
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva'

interface Props {
  nombre: string
  fechaLanzamiento: string // ISO, ej. "2026-11-19T00:00:00-03:00"
  imagen: string
  descripcion?: string
  enlace?: string // a dónde lleva el botón (si no se indica, no hay botón)
  textoEnlace?: string
}

const fechaLarga = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

// Banner con cuenta regresiva para el lanzamiento de un videojuego.
// Es reutilizable: todo lo que cambia entre juegos llega por props.
export default function ContadorLanzamiento({
  nombre,
  fechaLanzamiento,
  imagen,
  descripcion,
  enlace,
  textoEnlace = 'Ver detalles',
}: Props) {
  const { dias, horas, minutos, segundos, terminado } = useCuentaRegresiva(fechaLanzamiento)

  const unidades = [
    { valor: dias, etiqueta: dias === 1 ? 'Día' : 'Días' },
    { valor: horas, etiqueta: 'Horas' },
    { valor: minutos, etiqueta: 'Min' },
    { valor: segundos, etiqueta: 'Seg' },
  ]

  return (
    <section className="contador-lanzamiento" aria-label={`Lanzamiento de ${nombre}`}>
      <img className="contador-fondo" src={imagen} alt="" aria-hidden="true" />
      <div className="contador-contenido">
        <span className="contador-etiqueta">{terminado ? 'Ya disponible' : 'Próximo lanzamiento'}</span>
        <h2 className="contador-titulo">{nombre}</h2>
        {descripcion && <p className="contador-descripcion">{descripcion}</p>}
        <p className="contador-fecha">Sale el {fechaLarga.format(new Date(fechaLanzamiento))}</p>

        {terminado ? (
          <p className="contador-listo">¡Ya salió! Búscalo en el catálogo.</p>
        ) : (
          // role="timer": los lectores de pantalla entienden que es un reloj que cambia.
          <div className="contador-unidades" role="timer" aria-live="off">
            {unidades.map((u) => (
              <div className="contador-caja" key={u.etiqueta}>
                <span className="contador-numero">{String(u.valor).padStart(2, '0')}</span>
                <span className="contador-texto">{u.etiqueta}</span>
              </div>
            ))}
          </div>
        )}

        {enlace && (
          <Link className="btn btn-primary mt-3" to={enlace}>
            {textoEnlace}
          </Link>
        )}
      </div>
    </section>
  )
}
