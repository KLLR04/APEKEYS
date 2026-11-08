import { Link } from 'react-router'
import ImagenProducto from '../components/ImagenProducto'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { listarBlogs } from '../services/contenido'
import { formatearFechaLarga } from '../utils/formato'

export default function Noticias() {
  useTitulo('Blog | APEKEYS')
  const { datos, cargando, error } = useCarga(listarBlogs)

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Noticias importantes</span>
          <h1>Blog APEKEYS</h1>
          <p>Guías cortas y datos curiosos para aprovechar mejor tu biblioteca digital.</p>
        </div>
      </div>
      {cargando && <Cargando />}
      {error && <ErrorApiMensaje mensaje={error} />}
      <section className="blog-list" aria-label="Artículos del blog">
        {datos?.map((b) => (
          <article key={b.id} className="card blog-card">
            <ImagenProducto src={b.imagen} alt={`Imagen del artículo ${b.titulo}`} loading="lazy" />
            <div className="blog-body">
              <span className="eyebrow">{formatearFechaLarga(b.fecha)}</span>
              <h2>{b.titulo}</h2>
              <p className="muted">{b.resumen}</p>
              <Link className="btn btn-secondary btn-sm" to={`/noticias/${b.id}`}>
                Ver caso
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
