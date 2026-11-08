import { Link } from 'react-router'
import type { Producto } from '../types'
import ImagenProducto from './ImagenProducto'
import { formatearCLP } from '../utils/formato'
import { useAgregarAlCarrito } from '../hooks/useAgregarAlCarrito'

// Tarjeta de producto del catálogo. La imagen y el título llevan a la ficha;
// el botón "Agregar" está fuera de los enlaces, por eso no navega.
export default function TarjetaProducto({ producto: p }: { producto: Producto }) {
  const agregarAlCarrito = useAgregarAlCarrito()

  return (
    <article className="card product-card h-full">
      <Link to={`/ficha/${p.id}`} className="product-link" aria-label={`Ver detalle de ${p.nombre}`}>
        <div className="product-image">
          <ImagenProducto src={p.imagen} alt={`Portada de ${p.nombre}`} loading="lazy" />
          {p.stock <= 0 && <span className="stock-ribbon">Agotado</span>}
        </div>
      </Link>
      <div className="card-body flex flex-col">
        <span className="badge text-bg-secondary self-start mb-2">{p.categoria}</span>
        <Link to={`/ficha/${p.id}`} className="product-title-link">
          <h3 className="h5">{p.nombre}</h3>
        </Link>
        <div className="product-meta">
          {p.plataforma} · {p.stock > 0 ? `${p.stock} disponibles` : 'Sin stock'}
        </div>
        <div className="flex justify-between items-center mt-auto">
          <strong className="price">{formatearCLP(p.precio)}</strong>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={p.stock <= 0}
            onClick={() => agregarAlCarrito(p, 1)}
          >
            {p.stock > 0 ? 'Agregar' : 'Agotado'}
          </button>
        </div>
      </div>
    </article>
  )
}
