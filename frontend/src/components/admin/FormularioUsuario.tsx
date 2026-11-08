import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Campo from '../Campo'
import { claseControl } from '../../utils/formulario'
import { useFormulario } from '../../hooks/useFormulario'
import type { Region, Rol, Usuario } from '../../types'
import {
  normalizarRun,
  validarCorreo,
  validarFechaNacimiento,
  validarPassword,
  validarRun,
  validarTextoRequerido,
} from '../../utils/validaciones'

interface Props {
  usuario: Usuario | null // null = usuario nuevo
  usuarios: Usuario[]
  regiones: Region[]
  sesionId: number
  esUltimoAdmin: (u: Usuario) => boolean
  onGuardar: (datos: Omit<Usuario, 'id'>) => Promise<boolean>
  onCancelar: () => void
}

export default function FormularioUsuario({
  usuario,
  usuarios,
  regiones,
  sesionId,
  esUltimoAdmin,
  onGuardar,
  onCancelar,
}: Props) {
  const panel = useRef<HTMLElement>(null)
  const [mensaje, setMensaje] = useState('')
  const editando = usuario !== null
  const otros = usuarios.filter((u) => u.id !== usuario?.id)

  const { valores, errores, cambiar, salir, ponerValor, validar, ponerError } = useFormulario(
    {
      run: usuario?.run ?? '',
      rol: usuario?.rol ?? 'cliente',
      nombre: usuario?.nombre ?? '',
      apellidos: usuario?.apellidos ?? '',
      email: usuario?.email ?? '',
      password: '',
      fechaNacimiento: usuario?.fechaNacimiento ?? '',
      activo: usuario?.activo ?? true,
      region: usuario?.region ?? '',
      comuna: usuario?.comuna ?? '',
      direccion: usuario?.direccion ?? '',
    },
    {
      run: (v) => {
        const base = validarRun(v)
        if (base) return base
        return otros.some((u) => normalizarRun(u.run) === normalizarRun(v))
          ? 'Ya existe otro usuario con ese RUN.'
          : null
      },
      nombre: (v) => validarTextoRequerido(v, 'El nombre', 50, 2),
      apellidos: (v) => validarTextoRequerido(v, 'Los apellidos', 100, 2),
      email: (v) => {
        const base = validarCorreo(v)
        if (base) return base
        return otros.some((u) => u.email.toLowerCase() === v.trim().toLowerCase())
          ? 'Ya existe otro usuario con ese correo.'
          : null
      },
      // Al editar se puede dejar en blanco para conservar la contraseña actual.
      password: (v) => (editando && !v ? null : validarPassword(v)),
      rol: (v) => (v ? null : 'Selecciona el tipo de usuario.'),
      fechaNacimiento: validarFechaNacimiento,
      region: (v) => (v ? null : 'Selecciona una región.'),
      comuna: (v) => (v ? null : 'Selecciona una comuna.'),
      direccion: (v) => validarTextoRequerido(v, 'La dirección', 300, 5),
    },
  )

  useEffect(() => {
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('usrRun')?.focus()
  }, [])

  const comunas = regiones.find((r) => r.nombre === valores.region)?.comunas ?? []

  function cambiarRegion(e: ChangeEvent<HTMLSelectElement>) {
    cambiar(e)
    ponerValor('comuna', '')
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (!validar()) {
      setMensaje('Revisa los campos marcados en rojo.')
      return
    }

    // Protecciones para no quedarse sin administradores.
    if (usuario && usuario.id === sesionId && (!valores.activo || valores.rol !== 'admin')) {
      ponerError('rol', 'Conserva tu propia cuenta activa como administrador.')
      return
    }
    if (usuario && esUltimoAdmin(usuario) && !valores.activo) {
      ponerError('rol', 'Debe quedar un administrador activo.')
      return
    }
    if (usuario && usuario.rol === 'admin' && valores.rol !== 'admin' && esUltimoAdmin(usuario)) {
      ponerError('rol', 'Debe quedar al menos un administrador activo.')
      return
    }

    await onGuardar({
      run: normalizarRun(valores.run),
      nombre: valores.nombre.trim(),
      apellidos: valores.apellidos.trim(),
      email: valores.email.trim().toLowerCase(),
      password: valores.password || usuario?.password || '',
      rol: valores.rol as Rol,
      fechaNacimiento: valores.fechaNacimiento || '',
      region: valores.region,
      comuna: valores.comuna,
      direccion: valores.direccion.trim(),
      activo: valores.activo,
    })
  }

  return (
    <section className="card form-card" ref={panel} aria-labelledby="userFormTitle">
      <h2 id="userFormTitle">{editando ? 'Editar usuario' : 'Nuevo usuario'}</h2>
      <form onSubmit={enviar} noValidate>
        {mensaje && (
          <div className="alert alert-danger" role="alert">
            {mensaje}
          </div>
        )}

        <div className="form-grid">
          <Campo
            etiqueta="RUN"
            htmlFor="usrRun"
            ayuda="Sin puntos ni guion, entre 7 y 9 caracteres."
            error={errores.run}
          >
            <input
              className={claseControl(errores.run)}
              id="usrRun"
              type="text"
              name="run"
              maxLength={9}
              placeholder="15675613K"
              value={valores.run}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo etiqueta="Tipo de usuario" htmlFor="usrRol" error={errores.rol}>
            <select
              className={claseControl(errores.rol, 'form-select')}
              id="usrRol"
              name="rol"
              value={valores.rol}
              onChange={cambiar}
              onBlur={salir}
            >
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </Campo>

          <Campo etiqueta="Nombre" htmlFor="usrNombre" error={errores.nombre}>
            <input
              className={claseControl(errores.nombre)}
              id="usrNombre"
              type="text"
              name="nombre"
              maxLength={50}
              value={valores.nombre}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo etiqueta="Apellidos" htmlFor="usrApellidos" error={errores.apellidos}>
            <input
              className={claseControl(errores.apellidos)}
              id="usrApellidos"
              type="text"
              name="apellidos"
              maxLength={100}
              value={valores.apellidos}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo etiqueta="Correo electrónico" htmlFor="usrEmail" error={errores.email}>
            <input
              className={claseControl(errores.email)}
              id="usrEmail"
              type="email"
              name="email"
              maxLength={100}
              value={valores.email}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo
            etiqueta="Contraseña"
            htmlFor="usrPassword"
            ayuda={editando ? 'Déjala en blanco para conservar la contraseña actual.' : 'Entre 4 y 10 caracteres.'}
            error={errores.password}
          >
            <input
              className={claseControl(errores.password)}
              id="usrPassword"
              type="password"
              name="password"
              maxLength={10}
              autoComplete="new-password"
              value={valores.password}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo
            etiqueta={
              <>
                Fecha de nacimiento <span className="muted">(opcional)</span>
              </>
            }
            htmlFor="usrFecha"
            error={errores.fechaNacimiento}
          >
            <input
              className={claseControl(errores.fechaNacimiento)}
              id="usrFecha"
              type="date"
              name="fechaNacimiento"
              value={valores.fechaNacimiento}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'end' }}>
            <input type="checkbox" name="activo" checked={valores.activo} onChange={cambiar} /> Cuenta activa
          </label>

          <Campo etiqueta="Región" htmlFor="usrRegion" error={errores.region}>
            <select
              className={claseControl(errores.region, 'form-select')}
              id="usrRegion"
              name="region"
              value={valores.region}
              onChange={cambiarRegion}
              onBlur={salir}
            >
              <option value="">Selecciona una región</option>
              {regiones.map((r) => (
                <option key={r.id} value={r.nombre}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Comuna" htmlFor="usrComuna" error={errores.comuna}>
            <select
              className={claseControl(errores.comuna, 'form-select')}
              id="usrComuna"
              name="comuna"
              value={valores.comuna}
              disabled={!valores.region}
              onChange={cambiar}
              onBlur={salir}
            >
              <option value="">{valores.region ? 'Selecciona una comuna' : 'Primero elige una región'}</option>
              {comunas.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Dirección" htmlFor="usrDireccion" className="span-2" error={errores.direccion}>
            <input
              className={claseControl(errores.direccion)}
              id="usrDireccion"
              type="text"
              name="direccion"
              maxLength={300}
              value={valores.direccion}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            Guardar usuario
          </button>
          <button className="btn btn-secondary" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}
