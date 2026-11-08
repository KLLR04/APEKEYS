import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import ImagenProducto from '../components/ImagenProducto'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { obtenerBlog } from '../services/contenido'
import { formatearFechaLarga } from '../utils/formato'

export default function Articulo() {
  const { id } = useParams()
  const cargarBlog = useCallback(() => obtenerBlog(id ?? ''), [id])
  const { datos: blog, cargando, error } = useCarga(cargarBlog)
  useTitulo(blog ? `${blog.titulo} | APEKEYS` : 'Artículo | APEKEYS')

  const noExiste = error !== undefined && /404/.test(error)

  return (
    <div className="contenedor narrow">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span>›</span>
        <Link to="/noticias">Blog</Link>
      </nav>
      <article className="card card-body">
        {cargando && <Cargando />}
        {error && !noExiste && <ErrorApiMensaje mensaje={error} />}
        {noExiste && (
          <div className="card empty-state">
            <h2>Artículo no encontrado</h2>
            <p>Puede que el enlace esté mal escrito.</p>
            <Link className="btn btn-primary" to="/noticias">
              Volver al blog
            </Link>
          </div>
        )}
        {blog && (
          <>
            <ImagenProducto className="blog-hero" src={blog.imagen} alt={`Imagen del artículo ${blog.titulo}`} />
            <span className="eyebrow">{formatearFechaLarga(blog.fecha)}</span>
            <h1>{blog.titulo}</h1>
            <div className="prose">
              {blog.contenido.map((parrafo) => (
                <p key={parrafo}>{parrafo}</p>
              ))}
            </div>
          </>
        )}
      </article>
      <p className="back-home">
        <Link className="btn btn-secondary btn-sm" to="/noticias">
          Volver al blog
        </Link>
      </p>
    </div>
  )
}
