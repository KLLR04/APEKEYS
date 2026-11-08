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
    <main className="login-page">
      <div className="row g-0 min-vh-100">
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center p-4 bg-login">
          <div className="card shadow p-4 w-100" style={{ maxWidth: 450 }}>
            <Link to="/" className="logo-box text-body mb-3">
              <img src={logo} alt="Logo APEKEYS" />
              <span>APEKEYS</span>
            </Link>
            <h1 className="h3 text-center mb-4">Iniciar sesión</h1>
            <form onSubmit={enviar} noValidate>
              {mensaje && <div className="alert alert-danger">{mensaje}</div>}
              <div className="field mb-3">
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
              <div className="field mb-3">
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
              <button className="btn btn-primary w-100" type="submit">
                Iniciar sesión
              </button>
            </form>
            <Link
              className="btn btn-outline-secondary w-100 mt-2"
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
        <div className="col-md-6 d-none d-md-block">
          <img src={banner} alt="Banner APEKEYS" className="w-100 h-100 object-fit-cover" />
        </div>
      </div>
    </main>
  )
}
