import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export interface Diapositiva {
  imagen: string
  alt: string
  titulo: string
  texto: ReactNode
}

// Carrusel que avanza solo cada 5 segundos (se pausa al pasar el mouse).
// Sustituye al componente "carousel" de Bootstrap, que necesitaba su JavaScript.
export default function Carrusel({ diapositivas }: { diapositivas: Diapositiva[] }) {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const total = diapositivas.length

  useEffect(() => {
    if (pausado) return
    const id = window.setInterval(() => setActual((i) => (i + 1) % total), 5000)
    return () => window.clearInterval(id)
  }, [pausado, total])

  const ir = (i: number) => setActual((i + total) % total)

  return (
    <div
      className="carousel carrusel-principal"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="carousel-indicators">
        {diapositivas.map((d, i) => (
          <button
            key={d.titulo}
            type="button"
            className={i === actual ? 'active' : ''}
            aria-current={i === actual}
            aria-label={d.titulo}
            onClick={() => ir(i)}
          />
        ))}
      </div>
      <div className="carousel-inner">
        <div className="carousel-pista" style={{ transform: `translateX(-${actual * 100}%)` }}>
          {diapositivas.map((d) => (
            <div className="carousel-item" key={d.titulo}>
              <img src={d.imagen} className="block w-full" alt={d.alt} />
              <div className="carousel-caption">
                <h2>{d.titulo}</h2>
                <p>{d.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-control-prev" type="button" onClick={() => ir(actual - 1)}>
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="sr-only">Anterior</span>
      </button>
      <button className="carousel-control-next" type="button" onClick={() => ir(actual + 1)}>
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="sr-only">Siguiente</span>
      </button>
    </div>
  )
}
