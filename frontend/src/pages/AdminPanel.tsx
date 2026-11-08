import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import AdminNav from '../components/AdminNav'
import FormularioProducto from '../components/admin/FormularioProducto'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useAuth } from '../hooks/useAuth'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { useToast } from '../hooks/useToast'
import { useConfirmar } from '../hooks/useConfirmar'
import { listarOrdenes } from '../services/ordenes'
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
  modificarProducto,
} from '../services/productos'
import { listarUsuarios } from '../services/usuarios'
import { etiquetaRol, formatearCLP } from '../utils/formato'
import type { Producto } from '../types'

export default function AdminPanel() {
  useTitulo('Panel de control | APEKEYS')
  const { usuario, cerrarSesion } = useAuth()
  const { mostrar } = useToast()
  const confirmar = useConfirmar()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const esAdmin = usuario?.rol === 'admin'

  const productosQ = useCarga(listarProductos)
  const ordenesQ = useCarga(listarOrdenes)
  // El vendedor solo consulta: no necesita descargar los usuarios.
  const cargarUsuarios = useCallback(() => (esAdmin ? listarUsuarios() : Promise.resolve([])), [esAdmin])
  const usuariosQ = useCarga(cargarUsuarios)

  const productos = productosQ.datos ?? []
  const ordenes = ordenesQ.datos ?? []

  // edicion = null (cerrado) | { producto: null } (nuevo) | { producto } (editando)
  const [edicion, setEdicion] = useState<{ producto: Producto | null; clave: number } | null>(null)
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('')

  // El enlace "Mantenedor de productos" apunta a /admin#inventario.
  const listo = productosQ.datos !== undefined
  useEffect(() => {
    if (hash && listo) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [hash, listo])

  async function ejecutar(accion: () => Promise<unknown>, exito: string) {
    try {
      await accion()
      productosQ.recargar()
      mostrar(exito)
      return true
    } catch (e) {
      mostrar(e instanceof Error ? e.message : 'No se pudo guardar.', true)
      return false
    }
  }

  async function guardarProducto(datos: Omit<Producto, 'id'>) {
    const editando = edicion?.producto
    const ok = await ejecutar(
      // Al editar se parte del producto original: así se conservan los campos que el formulario
      // no muestra (precio de oferta, id de Steam, galería) y solo cambian los del formulario.
      () => (editando ? actualizarProducto({ ...editando, ...datos, id: editando.id }) : crearProducto(datos)),
      editando ? 'Producto actualizado' : 'Producto creado',
    )
    if (ok) setEdicion(null)
    return ok
  }

  async function eliminar(p: Producto) {
    const ok = await confirmar({
      titulo: 'Eliminar producto',
      mensaje: `¿Eliminar definitivamente "${p.nombre}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
      peligroso: true,
    })
    if (!ok) return
    if (edicion?.producto?.id === p.id) setEdicion(null)
    ejecutar(() => eliminarProducto(p.id), 'Producto eliminado')
  }

  const bajoStock = productos.filter((p) => p.stock <= p.stockCritico)
  const filasAlertas = bajoStock.length ? bajoStock : productos.slice(0, 5)
  const ventas = ordenes.reduce((suma, o) => suma + o.total, 0)
  const termino = texto.trim().toLowerCase()

  const visibles = productos
    .filter((p) => {
      const coincideTexto =
        !termino || [p.codigo, p.nombre, p.categoria, p.plataforma].join(' ').toLowerCase().includes(termino)
      const coincideEstado =
        estado === '' ||
        (estado === 'activo' && p.activo) ||
        (estado === 'inactivo' && !p.activo) ||
        (estado === 'critico' && p.stock <= p.stockCritico)
      return coincideTexto && coincideEstado
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  const error = productosQ.error || ordenesQ.error || usuariosQ.error

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Administración</span>
          <h1>Panel de control</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombre}</strong> · <span>{etiquetaRol(usuario?.rol ?? '')}</span>
          </p>
        </div>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            cerrarSesion()
            navigate('/login', { replace: true })
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {error && <ErrorApiMensaje mensaje={error} />}
      {productosQ.cargando && !productosQ.datos && <Cargando />}

      <div className="admin-shell">
        <AdminNav activo="resumen" />

        <section>
          {esAdmin && (
            <div id="inventario" className="mb-4">
              <button
                className="btn btn-primary mb-3"
                onClick={() => setEdicion({ producto: null, clave: Date.now() })}
              >
                Nuevo producto
              </button>

              {edicion && (
                // key distinta cada vez que se abre: el formulario arranca limpio.
                <FormularioProducto
                  key={edicion.clave}
                  producto={edicion.producto}
                  productos={productos}
                  onGuardar={guardarProducto}
                  onCancelar={() => setEdicion(null)}
                />
              )}

              <section className="section">
                <div className="section-head">
                  <div>
                    <h2>Listado de productos registrados</h2>
                    <p className="muted">
                      {visibles.length === 1 ? '1 producto listado' : `${visibles.length} productos listados`}
                    </p>
                  </div>
                </div>

                <div className="card toolbar toolbar-admin">
                  <label className="field" htmlFor="adminSearch">
                    Buscar
                    <input
                      className="form-control"
                      id="adminSearch"
                      type="search"
                      maxLength={60}
                      placeholder="Código, nombre, categoría o plataforma"
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                    />
                  </label>
                  <label className="field" htmlFor="adminEstado">
                    Estado
                    <select
                      className="form-select"
                      id="adminEstado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="activo">Solo activos</option>
                      <option value="inactivo">Solo inactivos</option>
                      <option value="critico">Con stock crítico</option>
                    </select>
                  </label>
                </div>

                <div className="card table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <caption className="visually-hidden">Inventario de productos</caption>
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Código</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Categoría</th>
                        <th scope="col">Precio</th>
                        <th scope="col">Stock</th>
                        <th scope="col">Activo</th>
                        <th scope="col" style={{ textAlign: 'right' }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibles.length === 0 && (
                        <tr>
                          <td colSpan={7} className="empty-state">
                            {productos.length
                              ? 'Ningún producto coincide con el filtro.'
                              : 'Todavía no hay productos. Crea el primero con el botón Nuevo producto.'}
                          </td>
                        </tr>
                      )}
                      {visibles.map((p) => (
                        <tr key={p.id}>
                          <td>{p.codigo}</td>
                          <td>{p.nombre}</td>
                          <td>{p.categoria}</td>
                          <td>{formatearCLP(p.precio)}</td>
                          <td className={p.stock <= 0 ? 'stock-cero' : p.stock <= p.stockCritico ? 'stock-bajo' : ''}>
                            {p.stock}
                          </td>
                          <td>
                            <span className={`badge ${p.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                              {p.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="actions">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEdicion({ producto: p, clave: Date.now() })}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                ejecutar(
                                  () => modificarProducto(p.id, { activo: !p.activo }),
                                  p.activo ? 'Producto desactivado' : 'Producto activado',
                                )
                              }
                            >
                              {p.activo ? 'Desactivar' : 'Activar'}
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminar(p)}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          <div className="cuadricula kpi-grid">
            <article className="card kpi">
              <span>Productos registrados</span>
              <strong>{productos.length}</strong>
            </article>
            <article className="card kpi">
              <span>Productos activos</span>
              <strong>{productos.filter((p) => p.activo).length}</strong>
            </article>
            <article className="card kpi">
              <span>Stock crítico</span>
              <strong>{bajoStock.length}</strong>
            </article>
            {esAdmin && (
              <article className="card kpi">
                <span>Usuarios registrados</span>
                <strong>{(usuariosQ.datos ?? []).length}</strong>
              </article>
            )}
            <article className="card kpi">
              <span>Compras realizadas</span>
              <strong>{ordenes.length}</strong>
            </article>
            <article className="card kpi">
              <span>Total vendido</span>
              <strong>{formatearCLP(ventas)}</strong>
            </article>
          </div>

          <section className="section">
            <div className="section-head">
              <div>
                <h2>Alertas de inventario</h2>
                <p>Productos que llegaron a su stock crítico o se quedaron sin unidades.</p>
              </div>
              {esAdmin && (
                <Link className="btn btn-primary" to="/admin#inventario">
                  Ir al mantenedor
                </Link>
              )}
            </div>
            <div className="card table-responsive">
              <table className="table table-hover align-middle mb-0">
                <caption className="visually-hidden">Productos con stock bajo</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Categoría</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Stock crítico</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filasAlertas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        Todavía no hay productos registrados.
                      </td>
                    </tr>
                  )}
                  {filasAlertas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td>{p.categoria}</td>
                      <td>{p.stock}</td>
                      <td>{p.stockCritico}</td>
                      <td>
                        {p.stock <= 0 ? (
                          <span className="badge text-bg-danger">Sin stock</span>
                        ) : p.stock <= p.stockCritico ? (
                          <span className="badge text-bg-warning">Stock crítico</span>
                        ) : (
                          <span className="badge text-bg-success">Disponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <h2>Últimas compras</h2>
                <p>Cada compra descuenta automáticamente el stock del inventario.</p>
              </div>
            </div>
            <div className="card table-responsive">
              <table className="table table-hover align-middle mb-0">
                <caption className="visually-hidden">Últimas órdenes registradas</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">Orden</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Productos</th>
                    <th scope="col">Unidades</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        Aún no se registran compras. Haz una desde la tienda para verla aquí.
                      </td>
                    </tr>
                  )}
                  {[...ordenes].reverse().map((o) => {
                    const unidades = o.detalle.reduce((suma, d) => suma + d.cantidad, 0)
                    return (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{new Date(o.fecha).toLocaleString('es-CL')}</td>
                        <td>{o.usuario}</td>
                        <td>
                          <ul className="orden-productos">
                            {o.detalle.map((linea) => (
                              <li key={linea.productId}>
                                <strong>{linea.nombre}</strong> × {linea.cantidad}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>{unidades === 1 ? '1 unidad' : `${unidades} unidades`}</td>
                        <td>{formatearCLP(o.total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
