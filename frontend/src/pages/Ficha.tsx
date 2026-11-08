import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import ImagenProducto from '../components/ImagenProducto'
import GaleriaJuego from '../components/GaleriaJuego'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { useAgregarAlCarrito } from '../hooks/useAgregarAlCarrito'
import { listarProductos, obtenerProducto } from '../services/productos'
import Precio from '../components/Precio'
import type { Producto } from '../types'

export default function Ficha() {
  const { id } = useParams()
  // useCallback mantiene la misma función mientras no cambie el id (ver useCarga).
  const cargarProducto = useCallback(() => obtenerProducto(id ?? ''), [id])
  const { datos: producto, cargando, error } = useCarga(cargarProducto)
  const { datos: todos } = useCarga(listarProductos)

  useTitulo(producto ? `${producto.nombre} | APEKEYS` : 'Detalle del producto | APEKEYS')

  // 404 de la API = no existe. Otro error (ej. API apagada) se muestra como error.
  const noExiste = error !== undefined && /404/.test(error)
  const noEncontrado = noExiste || (producto !== undefined && !producto.activo)

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span>›</span>
        <Link to="/catalogo">Productos</Link>
        <span>›</span>
        <Link to={producto ? `/catalogo?categoria=${encodeURIComponent(producto.categoria)}` : '/catalogo'}>
          {producto ? producto.categoria : 'Categoría'}
        </Link>
      </nav>

      {cargando && <Cargando />}
      {error && !noExiste && <ErrorApiMensaje mensaje={error} />}

      {noEncontrado && (
        <div className="card empty-state">
          <h1>Producto no encontrado</h1>
          <p>Puede que el enlace esté mal escrito o que el producto ya no esté publicado.</p>
          <Link className="btn btn-primary" to="/catalogo">
            Volver al catálogo
          </Link>
        </div>
      )}

      {producto && producto.activo && (
        // key = id: al pasar a otro producto relacionado, el formulario de cantidad se reinicia.
        <DetalleProducto key={producto.id} producto={producto} todos={todos ?? []} />
      )}
    </div>
  )
}

function DetalleProducto({ producto, todos }: { producto: Producto; todos: Producto[] }) {
  const agregarAlCarrito = useAgregarAlCarrito()
  const [cantidad, setCantidad] = useState(producto.stock > 0 ? '1' : '0')

  // La cantidad nunca puede superar el stock ni bajar de 1.
  const ajustar = (texto: string) => {
    const valor = Math.floor(Number(texto)) || 1
    return Math.max(1, Math.min(valor, producto.stock))
  }

  const relacionados = todos
    .filter((p) => p.activo && p.categoria === producto.categoria && p.id !== producto.id)
    .slice(0, 4)

  let claseStock = 'badge text-bg-success'
  let textoStock = `${producto.stock} unidades disponibles`
  if (producto.stock <= 0) {
    claseStock = 'badge text-bg-secondary'
    textoStock = 'Sin stock disponible'
  } else if (producto.stock <= producto.stockCritico) {
    claseStock = 'badge text-bg-warning'
    textoStock = `¡Últimas ${producto.stock} unidades!`
  }

  return (
    <>
      <article className="detail-layout">
        <div>
          <figure className="card detail-image">
            <ImagenProducto src={producto.imagen} alt={`Portada de ${producto.nombre}`} />
          </figure>
        </div>

        <aside className="card detail-panel">
          <span className="tag">{producto.categoria}</span>
          <h1>{producto.nombre}</h1>

          <dl className="detail-specs">
            <div>
              <dt>Plataforma de la clave</dt>
              <dd>{producto.plataforma}</dd>
            </div>
            <div>
              <dt>Código del producto</dt>
              <dd>{producto.codigo}</dd>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd>
                <span className={claseStock}>{textoStock}</span>
              </dd>
            </div>
          </dl>

          <p className="muted">{producto.descripcion}</p>

          <Precio producto={producto} className="price detail-price" />

          <div className="qty-row">
            <label className="field" htmlFor="detailQty">
              Cantidad
              <input
                className="form-control"
                id="detailQty"
                type="number"
                min={1}
                max={Math.max(1, producto.stock)}
                step={1}
                value={cantidad}
                disabled={producto.stock <= 0}
                onChange={(e) => setCantidad(e.target.value)}
                onBlur={() => setCantidad(String(ajustar(cantidad)))}
              />
            </label>
            <button
              className="btn btn-primary"
              type="button"
              disabled={producto.stock <= 0}
              onClick={() => agregarAlCarrito(producto, ajustar(cantidad))}
            >
              {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>
          </div>

          <p className="muted detail-note">
            Compra de demostración: requiere iniciar sesión. No se realiza un cobro real.
          </p>
        </aside>
      </article>

      {/* Capturas de gameplay: tienda de Steam o capturas propias (si nada responde, no se muestra) */}
      <GaleriaJuego producto={producto} />

      {relacionados.length > 0 && (
        <section className="section" aria-labelledby="relacionados-titulo">
          <div className="section-head">
            <div>
              <span className="eyebrow">También te puede gustar</span>
              <h2 id="relacionados-titulo">Productos relacionados</h2>
            </div>
          </div>
          <div className="cuadricula related-grid">
            {relacionados.map((p) => (
              <Link key={p.id} className="card related-card" to={`/ficha/${p.id}`}>
                <ImagenProducto src={p.imagen} alt={`Portada de ${p.nombre}`} loading="lazy" />
                <div className="related-body">
                  <strong>{p.nombre}</strong>
                  <Precio producto={p} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
