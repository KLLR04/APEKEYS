import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import Campo from '../components/Campo'
import { claseControl } from '../utils/formulario'
import { useAuth } from '../hooks/useAuth'
import { useCarga } from '../hooks/useCarga'
import { useFormulario } from '../hooks/useFormulario'
import { useTitulo } from '../hooks/useTitulo'
import { listarRegiones } from '../services/contenido'
import { destinoSeguro } from '../utils/navegacion'
import {
  fechaManualAIso,
  normalizarRun,
  validarCorreo,
  validarFechaManual,
  validarPassword,
  validarRun,
  validarTextoRequerido,
} from '../utils/validaciones'

// Pone las barras de DD/MM/AAAA solas mientras se escribe (solo hay que teclear números).
function formatearFecha(texto: string) {
  const n = texto.replace(/\D/g, '').slice(0, 8)
  return [n.slice(0, 2), n.slice(2, 4), n.slice(4, 8)].filter(Boolean).join('/')
}

export default function Registro() {
  useTitulo('Crear cuenta | APEKEYS')
  const { usuario, registrar } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const { datos: regiones } = useCarga(listarRegiones)
  const [mensaje, setMensaje] = useState('')

  const { valores, errores, cambiar, salir, ponerValor, validar, ponerError } = useFormulario(
    {
      run: '',
      fechaNacimiento: '',
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      password2: '',
      region: '',
      comuna: '',
      direccion: '',
    },
    {
      run: validarRun,
      nombre: (v) => validarTextoRequerido(v, 'El nombre', 50, 2),
      apellidos: (v) => validarTextoRequerido(v, 'Los apellidos', 100, 2),
      email: validarCorreo,
      password: validarPassword,
      password2: (v, todos) => {
        if (!v) return 'Repite la contraseña.'
        return v !== todos.password ? 'Las contraseñas no coinciden.' : null
      },
      fechaNacimiento: validarFechaManual,
      region: (v) => validarTextoRequerido(v, 'La región'),
      comuna: (v) => validarTextoRequerido(v, 'La comuna'),
      direccion: (v) => validarTextoRequerido(v, 'La dirección', 300),
    },
  )

  if (usuario) return <Navigate to={destinoSeguro(next, usuario.rol)} replace />

  const comunas = regiones?.find((r) => r.nombre === valores.region)?.comunas ?? []

  function cambiarRegion(e: ChangeEvent<HTMLSelectElement>) {
    cambiar(e)
    ponerValor('comuna', '') // al cambiar la región se vuelve a elegir la comuna
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (!validar()) {
      setMensaje('Revisa los campos marcados en rojo.')
      return
    }

    const resultado = await registrar({
      run: normalizarRun(valores.run),
      nombre: valores.nombre.trim(),
      apellidos: valores.apellidos.trim(),
      email: valores.email.trim().toLowerCase(),
      password: valores.password,
      rol: 'cliente', // el registro público siempre crea clientes
      fechaNacimiento: fechaManualAIso(valores.fechaNacimiento),
      region: valores.region,
      comuna: valores.comuna,
      direccion: valores.direccion.trim(),
      activo: true,
    })

    if (!resultado.ok) {
      if (resultado.campo) ponerError(resultado.campo, resultado.mensaje)
      else setMensaje(resultado.mensaje)
      return
    }
    navigate(destinoSeguro(next, 'cliente'), { replace: true })
  }

  return (
    <div className="contenedor narrow">
      <div className="section-head">
        <div>
          <span className="eyebrow">Únete a APEKEYS</span>
          <h1>Crear cuenta</h1>
          <p>Completa tus datos para comprar y recibir tus claves digitales.</p>
        </div>
      </div>

      <section className="card form-card">
        <form onSubmit={enviar} noValidate>
          {mensaje && (
            <div className="alert alert-danger" role="alert">
              {mensaje}
            </div>
          )}

          <fieldset className="form-fieldset">
            <legend>Datos personales</legend>
            <div className="form-grid">
              <Campo etiqueta="RUN" htmlFor="regRun" ayuda="Sin puntos ni guion. Ejemplo: 15675613K" error={errores.run}>
                <input
                  className={claseControl(errores.run)}
                  id="regRun"
                  type="text"
                  name="run"
                  maxLength={9}
                  placeholder="15675613K"
                  value={valores.run}
                  onChange={cambiar}
                  onBlur={salir}
                />
              </Campo>

              <Campo
                etiqueta="Fecha de nacimiento"
                htmlFor="regFecha"
                ayuda="Escríbela en formato DD/MM/AAAA."
                error={errores.fechaNacimiento}
              >
                <input
                  className={claseControl(errores.fechaNacimiento)}
                  id="regFecha"
                  type="text"
                  name="fechaNacimiento"
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={valores.fechaNacimiento}
                  onChange={(e) => ponerValor('fechaNacimiento', formatearFecha(e.target.value))}
                  onBlur={salir}
                />
              </Campo>

              <Campo etiqueta="Nombre" htmlFor="regNombre" error={errores.nombre}>
                <input
                  className={claseControl(errores.nombre)}
                  id="regNombre"
                  type="text"
                  name="nombre"
                  maxLength={50}
                  autoComplete="given-name"
                  value={valores.nombre}
                  onChange={cambiar}
                  onBlur={salir}
                />
              </Campo>

              <Campo etiqueta="Apellidos" htmlFor="regApellidos" error={errores.apellidos}>
                <input
                  className={claseControl(errores.apellidos)}
                  id="regApellidos"
                  type="text"
                  name="apellidos"
                  maxLength={100}
                  autoComplete="family-name"
                  value={valores.apellidos}
                  onChange={cambiar}
                  onBlur={salir}
                />
              </Campo>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Datos de acceso</legend>
            <div className="form-grid">
              <Campo etiqueta="Correo electrónico" htmlFor="regEmail" className="span-2" error={errores.email}>
                <input
                  className={claseControl(errores.email)}
                  id="regEmail"
                  type="email"
                  name="email"
                  maxLength={100}
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  value={valores.email}
                  onChange={cambiar}
                  onBlur={salir}
                />
              </Campo>

              <Campo etiqueta="Contraseña" htmlFor="regPassword" ayuda="Entre 4 y 10 caracteres." error={errores.password}>
                <input
                  className={claseControl(errores.password)}
                  id="regPassword"
                  type="password"
                  name="password"
                  minLength={4}
                  maxLength={10}
                  autoComplete="new-password"
                  value={valores.password}
                  onChange={cambiar}
                  onBlur={salir}
                />
              </Campo>

              <Campo etiqueta="Repetir contraseña" htmlFor="regPassword2" error={errores.password2}>
                <input
                  className={claseControl(errores.password2)}
                  id="regPassword2"
                  type="password"
                  name="password2"
                  minLength={4}
                  maxLength={10}
                  autoComplete="new-password"
                  value={valores.password2}
                  onChange={cambiar}
                  onBlur={salir}
                />
              </Campo>
            </div>
          </fieldset>

          <div className="form-grid mb-4">
            <Campo etiqueta="Región" htmlFor="regRegion" error={errores.region}>
              <select
                className={claseControl(errores.region, 'form-select')}
                id="regRegion"
                name="region"
                value={valores.region}
                onChange={cambiarRegion}
                onBlur={salir}
              >
                <option value="">Selecciona una región</option>
                {regiones?.map((r) => (
                  <option key={r.id} value={r.nombre}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Comuna" htmlFor="regComuna" error={errores.comuna}>
              <select
                className={claseControl(errores.comuna, 'form-select')}
                id="regComuna"
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
            <Campo etiqueta="Dirección" htmlFor="regDireccion" className="span-2" error={errores.direccion}>
              <input
                className={claseControl(errores.direccion)}
                id="regDireccion"
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
              Crear cuenta
            </button>
            <Link className="btn btn-secondary" to="/login">
              Ya tengo cuenta
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}
