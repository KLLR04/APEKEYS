import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import TarjetaProducto from '../components/TarjetaProducto'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { listarProductos } from '../services/productos'
import { enOferta, precioFinal } from '../utils/formato'

interface Props {
  // Si se indica, la página es un listado fijo de esa categoría (ej. "Software").
  categoriaFija?: string
  // Si es true, solo muestra productos con precio de oferta (vista /ofertas).
  soloOfertas?: boolean
}

// Una sola página para /catalogo y /software. Los filtros viven en la URL
// (?buscar=...&categoria=...&orden=...), así se pueden compartir y el buscador del
// encabezado funciona navegando a /catalogo?buscar=texto.
export default function Catalogo({ categoriaFija, soloOfertas = false }: Props) {
  const esSoftware = categoriaFija === 'Software'
  useTitulo(soloOfertas ? 'Ofertas | APEKEYS' : esSoftware ? 'Software | APEKEYS' : 'Productos | APEKEYS')

  const [params, setParams] = useSearchParams()
  const buscar = params.get('buscar') ?? ''
  const categoria = params.get('categoria') ?? ''
  const orden = params.get('orden') ?? 'nombre'

  const { datos, cargando, error } = useCarga(listarProductos)

  // El catálogo público solo muestra productos activos.
  const base = useMemo(
    () => (datos ?? []).filter((p) => p.activo && (!categoriaFija || p.categoria === categoriaFija) && (!soloOfertas || enOferta(p))),
    [datos, categoriaFija, soloOfertas],
  )
  const categorias = useMemo(
    () => Array.from(new Set(base.map((p) => p.categoria))).sort((a, b) => a.localeCompare(b, 'es')),
    [base],
  )

  const termino = buscar.trim().toLowerCase()
  const visibles = base
    .filter((p) => {
      const coincideCategoria = !categoria || p.categoria === categoria
      const coincideTexto =
        !termino ||
        [p.nombre, p.codigo, p.categoria, p.plataforma].join(' ').toLowerCase().includes(termino)
      return coincideCategoria && coincideTexto
    })
    .sort((a, b) => {
      if (orden === 'precio-asc') return precioFinal(a) - precioFinal(b)
      if (orden === 'precio-desc') return precioFinal(b) - precioFinal(a)
      return a.nombre.localeCompare(b.nombre, 'es')
    })

  // Cambia un parámetro de la URL; si queda vacío se elimina.
  function cambiarParam(nombre: string, valor: string) {
    const nuevos = new URLSearchParams(params)
    if (valor) nuevos.set(nombre, valor)
    else nuevos.delete(nombre)
    setParams(nuevos, { replace: true })
  }

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">{soloOfertas ? 'Precios rebajados' : esSoftware ? 'Licencias digitales' : 'Catálogo'}</span>
          <h1>{soloOfertas ? 'Ofertas' : esSoftware ? 'Software' : 'Productos'}</h1>
          <p>
            {soloOfertas
              ? 'Juegos con descuento por tiempo limitado.'
              : esSoftware
                ? 'Suscripciones y herramientas para completar tu equipo.'
                : 'Juegos y software para PC, PlayStation, Xbox y Nintendo.'}
          </p>
        </div>
      </div>

      <section className="card toolbar" aria-label={esSoftware ? 'Filtros de software' : 'Filtros del catálogo'}>
        <label className="field" htmlFor="catalogSearch">
          Buscar
          <input
            className="form-control"
            id="catalogSearch"
            type="search"
            maxLength={60}
            placeholder={esSoftware ? 'Buscar software' : 'Nombre, código o plataforma'}
            value={buscar}
            onChange={(e) => cambiarParam('buscar', e.target.value)}
          />
        </label>
        {!esSoftware && (
          <label className="field" htmlFor="catalogCategory">
            Categoría
            <select
              className="form-select"
              id="catalogCategory"
              value={categoria}
              onChange={(e) => cambiarParam('categoria', e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="field" htmlFor="catalogSort">
          Ordenar por
          <select
            className="form-select"
            id="catalogSort"
            value={orden}
            onChange={(e) => cambiarParam('orden', e.target.value === 'nombre' ? '' : e.target.value)}
          >
            <option value="nombre">Nombre (A-Z)</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </label>
      </section>

      {cargando && <Cargando />}
      {error && <ErrorApiMensaje mensaje={error} />}
      {datos && (
        <>
          <p className="muted" aria-live="polite">
            {visibles.length === 1 ? '1 producto encontrado' : `${visibles.length} productos encontrados`}
          </p>
          <section
            className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3"
            aria-label={esSoftware ? 'Listado de software' : 'Listado de productos'}
          >
            {visibles.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-light mb-0">No encontramos productos con esos filtros.</div>
              </div>
            ) : (
              visibles.map((p) => (
                <div className="col" key={p.id}>
                  <TarjetaProducto producto={p} />
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  )
}
