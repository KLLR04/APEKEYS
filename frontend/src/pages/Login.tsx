import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { claseControl } from '../utils/formulario'
import logo from '../img/logo.png'
import banner from '../img/banner_holder.jpg'
import { useAuth } from '../hooks/useAuth'
import { useFormulario } from '../hooks/useFormulario'
import { useTitulo } from '../hooks/useTitulo'
import { destinoSeguro } from '../utils/navegacion'
import { validarCorreo, validarPassword } from '../utils/validaciones'

export default function Login() {
  useTitulo('Iniciar sesión | APEKEYS')
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const [mensaje, setMensaje] = useState('')

  const { valores, errores, cambiar, salir, validar, ponerValor } = useFormulario(
    { email: '', password: '' },
    { email: validarCorreo, password: validarPassword },
  )

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (usuario) return <Navigate to={destinoSeguro(next, usuario.rol)} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (!validar()) return

    const resultado = await iniciarSesion(valores.email, valores.password)
    if (!resultado.ok) {
      setMensaje(resultado.mensaje)
      ponerValor('password', '')
      document.getElementById('password')?.focus()
      return
    }
    navigate(destinoSeguro(next, resultado.sesion.rol), { replace: true })
  }

  return (
    <main className="h-screen overflow-auto md:overflow-hidden">
      <div className="grid h-full grid-rows-1 md:grid-cols-2">
        <div className="flex justify-center items-center p-6 bg-login h-full">
          <div className="card sombra p-6 w-full" style={{ maxWidth: 450 }}>
            <Link to="/" className="logo-box text-body mb-4">
              <img src={logo} alt="Logo APEKEYS" />
              <span>APEKEYS</span>
            </Link>
            <h1 className="h3 text-center mb-6">Iniciar sesión</h1>
            <form onSubmit={enviar} noValidate>
              {mensaje && <div className="alert alert-danger">{mensaje}</div>}
              <div className="field mb-4">
                <label className="form-label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  className={claseControl(errores.email)}
                  id="email"
                  type="email"
                  name="email"
                  maxLength={100}
                  autoComplete="username"
                  value={valores.email}
                  onChange={cambiar}
                  onBlur={salir}
                />
                <span className="field-error">{errores.email}</span>
              </div>
              <div className="field mb-4">
                <label className="form-label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  className={claseControl(errores.password)}
                  id="password"
                  type="password"
                  name="password"
                  minLength={4}
                  maxLength={10}
                  autoComplete="current-password"
                  value={valores.password}
                  onChange={cambiar}
                  onBlur={salir}
                />
                <span className="field-error">{errores.password}</span>
              </div>
              <button className="btn btn-primary w-full" type="submit">
                Iniciar sesión
              </button>
            </form>
            <Link
              className="btn btn-outline-secondary w-full mt-2"
              to={next ? `/registro?next=${encodeURIComponent(next)}` : '/registro'}
            >
              Crear cuenta
            </Link>
            <hr />
            <p className="small text-secondary mb-0">
              Administrador: <code>admin@duoc.cl / Admin123</code>
              <br />
              Cliente: <code>cliente@gmail.com / Cliente123</code>
            </p>
          </div>
        </div>
        <div className="hidden md:block h-full">
          <img src={banner} alt="Banner APEKEYS" className="w-full h-full" style={{ objectFit: 'cover' }} />
        </div>
      </div>
    </main>
  )
}
