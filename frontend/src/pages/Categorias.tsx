import { Link } from 'react-router'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { listarProductos } from '../services/productos'

export default function Categorias() {
  useTitulo('Categorías | APEKEYS')
  const { datos, cargando, error } = useCarga(listarProductos)

  // Cuenta cuántos productos activos tiene cada categoría.
  const conteo: Record<string, number> = {}
  for (const p of datos ?? []) if (p.activo) conteo[p.categoria] = (conteo[p.categoria] ?? 0) + 1
  const nombres = Object.keys(conteo).sort((a, b) => a.localeCompare(b, 'es'))

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Encuentra tu estilo</span>
          <h1>Categorías</h1>
          <p>Explora el catálogo según el tipo de experiencia que buscas.</p>
        </div>
      </div>
      {cargando && <Cargando />}
      {error && <ErrorApiMensaje mensaje={error} />}
      <section className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" aria-label="Listado de categorías">
        {nombres.map((nombre) => (
          <div className="col" key={nombre}>
            <Link to={`/catalogo?categoria=${encodeURIComponent(nombre)}`} className="card card-body h-100">
              <strong>{nombre}</strong>
              <span>{conteo[nombre] === 1 ? '1 producto' : `${conteo[nombre]} productos`}</span>
            </Link>
          </div>
        ))}
      </section>
    </div>
  )
}
