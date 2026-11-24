import { useState } from 'react'
import { useNavigate } from 'react-router'
import AdminNav from '../components/AdminNav'
import FormularioCategoria from '../components/admin/FormularioCategoria'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useAuth } from '../hooks/useAuth'
import { useCarga } from '../hooks/useCarga'
import { useConfirmar } from '../hooks/useConfirmar'
import { useTitulo } from '../hooks/useTitulo'
import { useToast } from '../hooks/useToast'
import {
  actualizarCategoria,
  CATEGORIA_PROTEGIDA,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  reasignarProductos,
  SIN_CATEGORIA,
} from '../services/categorias'
import { listarProductos } from '../services/productos'
import type { Categoria } from '../types'

export default function AdminCategorias() {
  useTitulo('Mantenedor de categorías | APEKEYS')
  const { cerrarSesion } = useAuth()
  const { mostrar } = useToast()
  const confirmar = useConfirmar()
  const navigate = useNavigate()
  const categoriasQ = useCarga(listarCategorias)
  const productosQ = useCarga(listarProductos)
  const categorias = categoriasQ.datos ?? []
  const productos = productosQ.datos ?? []

  const [edicion, setEdicion] = useState<{ categoria: Categoria | null; clave: number } | null>(null)
  const [texto, setTexto] = useState('')

  // Cuántos productos usan cada categoría (el producto guarda el nombre, no el id).
  const conteo: Record<string, number> = {}
  for (const p of productos) conteo[p.categoria] = (conteo[p.categoria] ?? 0) + 1
  const sinCategoria = conteo[SIN_CATEGORIA] ?? 0

  async function ejecutar(accion: () => Promise<unknown>, exito: string) {
    try {
      await accion()
      categoriasQ.recargar()
      productosQ.recargar()
      mostrar(exito)
      return true
    } catch (e) {
      mostrar(e instanceof Error ? e.message : 'No se pudo completar la acción.', true)
      return false
    }
  }

  async function guardar(datos: Omit<Categoria, 'id'>) {
    const editando = edicion?.categoria
    const ok = await ejecutar(async () => {
      if (!editando) return crearCategoria(datos)
      // Primero los productos, después la categoría (ver comentario en services/categorias.ts).
      if (editando.nombre !== datos.nombre) await reasignarProductos(editando.nombre, datos.nombre)
      return actualizarCategoria({ ...datos, id: editando.id })
    }, editando ? 'Categoría actualizada' : 'Categoría creada')
    if (ok) setEdicion(null)
    return ok
  }

  async function eliminar(c: Categoria) {
    const cantidad = conteo[c.nombre] ?? 0
    const ok = await confirmar({
      titulo: 'Eliminar categoría',
      mensaje:
        cantidad === 0
          ? `¿Eliminar la categoría "${c.nombre}"?`
          : `¿Eliminar la categoría "${c.nombre}"? Sus ${cantidad} producto(s) NO se eliminan: quedarán como "${SIN_CATEGORIA}" hasta que les asignes otra categoría.`,
      textoConfirmar: 'Eliminar',
      peligroso: true,
    })
    if (!ok) return
    if (edicion?.categoria?.id === c.id) setEdicion(null)
    ejecutar(async () => {
      await reasignarProductos(c.nombre, SIN_CATEGORIA)
      await eliminarCategoria(c.id)
    }, 'Categoría eliminada')
  }

  const termino = texto.trim().toLowerCase()
  const visibles = categorias
    .filter((c) => !termino || c.nombre.toLowerCase().includes(termino))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  const error = categoriasQ.error || productosQ.error

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Administración</span>
          <h1>Mantenedor de categorías</h1>
          <p>Crea, renombra o elimina las categorías que se pueden asignar a los productos.</p>
        </div>
        <div className="admin-actions">
          <button
            className="btn btn-primary"
            type="button"
            disabled={!categoriasQ.datos}
            onClick={() => setEdicion({ categoria: null, clave: Date.now() })}
          >
            Nueva categoría
          </button>
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
      </div>

      {error && <ErrorApiMensaje mensaje={error} />}
      {categoriasQ.cargando && !categoriasQ.datos && <Cargando />}

      <div className="admin-shell">
        <AdminNav activo="categorias" />

        <section>
          {edicion && categoriasQ.datos && (
            <FormularioCategoria
              key={edicion.clave}
              categoria={edicion.categoria}
              categorias={categorias}
              onGuardar={guardar}
              onCancelar={() => setEdicion(null)}
            />
          )}

          <section className="section">
            <div className="section-head">
              <div>
                <h2>Listado de categorías</h2>
                <p className="muted">
                  {visibles.length === 1 ? '1 categoría listada' : `${visibles.length} categorías listadas`}
                  {sinCategoria > 0 && ` · ${sinCategoria} producto(s) sin categoría`}
                </p>
              </div>
            </div>

            <div className="card toolbar toolbar-admin">
              <label className="field" htmlFor="catSearch">
                Buscar
                <input
                  className="form-control"
                  id="catSearch"
                  type="search"
                  maxLength={40}
                  placeholder="Nombre de la categoría"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </label>
            </div>

            <div className="card table-responsive">
              <table className="table table-hover align-middle mb-0">
                <caption className="visually-hidden">Categorías registradas</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Productos</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.length === 0 && (
                    <tr>
                      <td colSpan={3} className="empty-state">
                        Ninguna categoría coincide con el filtro.
                      </td>
                    </tr>
                  )}
                  {visibles.map((c) => {
                    const protegida = c.nombre === CATEGORIA_PROTEGIDA
                    const motivo = protegida ? 'La ruta /software depende de esta categoría' : ''
                    return (
                      <tr key={c.id}>
                        <td>{c.nombre}</td>
                        <td>{conteo[c.nombre] ?? 0}</td>
                        <td className="actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={protegida}
                            title={motivo}
                            onClick={() => setEdicion({ categoria: c, clave: Date.now() })}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={protegida}
                            title={motivo}
                            onClick={() => eliminar(c)}
                          >
                            Eliminar
                          </button>
                        </td>
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
