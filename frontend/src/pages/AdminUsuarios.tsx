import { useState } from 'react'
import { useNavigate } from 'react-router'
import AdminNav from '../components/AdminNav'
import FormularioUsuario from '../components/admin/FormularioUsuario'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useAuth } from '../hooks/useAuth'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { useToast } from '../hooks/useToast'
import { useConfirmar } from '../hooks/useConfirmar'
import { listarRegiones } from '../services/contenido'
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  modificarUsuario,
} from '../services/usuarios'
import { etiquetaRol } from '../utils/formato'
import type { Usuario } from '../types'

export default function AdminUsuarios() {
  useTitulo('Mantenedor de usuarios | APEKEYS')
  const { usuario: sesion, cerrarSesion } = useAuth()
  const { mostrar } = useToast()
  const confirmar = useConfirmar()
  const navigate = useNavigate()
  const usuariosQ = useCarga(listarUsuarios)
  const regionesQ = useCarga(listarRegiones)
  const usuarios = usuariosQ.datos ?? []

  const [edicion, setEdicion] = useState<{ usuario: Usuario | null; clave: number } | null>(null)
  const [texto, setTexto] = useState('')
  const [rol, setRol] = useState('')

  async function ejecutar(accion: () => Promise<unknown>, exito: string) {
    try {
      await accion()
      usuariosQ.recargar()
      mostrar(exito)
      return true
    } catch (e) {
      mostrar(e instanceof Error ? e.message : 'No se pudo guardar el usuario.', true)
      return false
    }
  }

  async function guardar(datos: Omit<Usuario, 'id'>) {
    const editando = edicion?.usuario
    const ok = await ejecutar(
      () => (editando ? actualizarUsuario({ ...datos, id: editando.id }) : crearUsuario(datos)),
      editando ? 'Usuario actualizado' : 'Usuario creado',
    )
    if (ok) setEdicion(null)
    return ok
  }

  // Nadie puede dejar al sistema sin administradores activos.
  function esUltimoAdmin(u: Usuario) {
    if (u.rol !== 'admin') return false
    return usuarios.filter((x) => x.rol === 'admin' && x.activo).length <= 1
  }

  function alternar(u: Usuario) {
    if (u.activo && esUltimoAdmin(u)) {
      mostrar('Debe quedar al menos un administrador activo.', true)
      return
    }
    ejecutar(() => modificarUsuario(u.id, { activo: !u.activo }), u.activo ? 'Usuario desactivado' : 'Usuario activado')
  }

  async function eliminar(u: Usuario) {
    if (esUltimoAdmin(u)) {
      mostrar('Debe quedar al menos un administrador activo.', true)
      return
    }
    const ok = await confirmar({
      titulo: 'Eliminar usuario',
      mensaje: `¿Eliminar la cuenta de ${u.nombre} ${u.apellidos}? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
      peligroso: true,
    })
    if (!ok) return
    if (edicion?.usuario?.id === u.id) setEdicion(null)
    ejecutar(() => eliminarUsuario(u.id), 'Usuario eliminado')
  }

  const termino = texto.trim().toLowerCase()
  const visibles = usuarios
    .filter((u) => {
      const coincideTexto =
        !termino || [u.run, u.nombre, u.apellidos, u.email, u.comuna].join(' ').toLowerCase().includes(termino)
      return coincideTexto && (!rol || u.rol === rol)
    })
    .sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es'))

  const error = usuariosQ.error || regionesQ.error

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Administración</span>
          <h1>Mantenedor de usuarios</h1>
          <p>Gestiona las cuentas de administradores, vendedores y clientes.</p>
        </div>
        <div className="admin-actions">
          <button
            className="btn btn-primary"
            type="button"
            disabled={!regionesQ.datos}
            onClick={() => setEdicion({ usuario: null, clave: Date.now() })}
          >
            Nuevo usuario
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
      {usuariosQ.cargando && !usuariosQ.datos && <Cargando />}

      <div className="admin-shell">
        <AdminNav activo="usuarios" />

        <section>
          {edicion && regionesQ.datos && sesion && (
            <FormularioUsuario
              key={edicion.clave}
              usuario={edicion.usuario}
              usuarios={usuarios}
              regiones={regionesQ.datos}
              sesionId={sesion.id}
              esUltimoAdmin={esUltimoAdmin}
              onGuardar={guardar}
              onCancelar={() => setEdicion(null)}
            />
          )}

          <section className="section">
            <div className="section-head">
              <div>
                <h2>Listado de usuarios registrados</h2>
                <p className="muted">
                  {visibles.length === 1 ? '1 usuario listado' : `${visibles.length} usuarios listados`}
                </p>
              </div>
            </div>

            <div className="card toolbar toolbar-admin">
              <label className="field" htmlFor="userSearch">
                Buscar
                <input
                  className="form-control"
                  id="userSearch"
                  type="search"
                  maxLength={60}
                  placeholder="RUN, nombre, correo o comuna"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </label>
              <label className="field" htmlFor="userRol">
                Tipo de usuario
                <select className="form-select" id="userRol" value={rol} onChange={(e) => setRol(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="cliente">Clientes</option>
                  <option value="vendedor">Vendedores</option>
                  <option value="admin">Administradores</option>
                </select>
              </label>
            </div>

            <div className="card table-responsive">
              <table className="table table-hover align-middle mb-0">
                <caption className="visually-hidden">Usuarios registrados</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">RUN</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Ubicación</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Estado</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        Ningún usuario coincide con el filtro.
                      </td>
                    </tr>
                  )}
                  {visibles.map((u) => {
                    const esYo = sesion?.id === u.id
                    return (
                      <tr key={u.id}>
                        <td>{u.run}</td>
                        <td>
                          {u.nombre} {u.apellidos}
                        </td>
                        <td>{u.email}</td>
                        <td>{[u.comuna, u.region].filter(Boolean).join(', ') || 'Sin registrar'}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.rol === 'admin'
                                ? 'text-bg-warning'
                                : u.rol === 'vendedor'
                                  ? 'text-bg-info'
                                  : 'text-bg-secondary'
                            }`}
                          >
                            {etiquetaRol(u.rol)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEdicion({ usuario: u, clave: Date.now() })}
                            disabled={!regionesQ.datos}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={esYo}
                            title={esYo ? 'No puedes desactivar tu propia cuenta' : ''}
                            onClick={() => alternar(u)}
                          >
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={esYo}
                            title={esYo ? 'No puedes eliminar tu propia cuenta' : ''}
                            onClick={() => eliminar(u)}
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
