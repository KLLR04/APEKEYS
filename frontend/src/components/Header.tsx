import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import logo from '../img/logo.png'
import iconoUsuario from '../img/Cart y User/user.png'
import iconoCarrito from '../img/Cart y User/cart.png'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { esPersonal } from '../utils/formato'

const CATEGORIAS = [
  ['Acción', 'Acción'],
  ['Mundo Abierto', 'Mundo abierto'],
  ['Plataformas', 'Plataformas'],
  ['Terror', 'Terror'],
]

export default function Header() {
  const { usuario, cerrarSesion } = useAuth()
  const { totalUnidades } = useCart()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cierra el menú "Categorías" al hacer clic afuera o al apretar Escape.
  useEffect(() => {
    if (!menuAbierto) return
    const fuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAbierto(false)
    }
    const escape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('click', fuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('click', fuera)
      document.removeEventListener('keydown', escape)
    }
  }, [menuAbierto])

  const personal = esPersonal(usuario?.rol)
  const destinoCuenta = personal ? '/admin' : usuario ? '/catalogo' : '/login'
  const claseNav = (activo: boolean) =>
    `btn ${activo ? 'btn-outline-success' : 'btn-outline-secondary'} me-2`

  function buscar(e: KeyboardEvent<HTMLInputElement>) {
    const texto = e.currentTarget.value.trim()
    if (e.key === 'Enter' && texto) navigate(`/catalogo?buscar=${encodeURIComponent(texto)}`)
  }

  function salir() {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <header>
      <div className="header-top">
        <Link className="logo-box" to="/">
          <img src={logo} alt="Logo APEKEYS" />
          <span>APEKEYS</span>
        </Link>
        <input
          id="headerSearch"
          type="search"
          className="form-control barra-busqueda"
          placeholder="Buscar..."
          onKeyDown={buscar}
        />
        <div className="header-actions">
          <Link to={destinoCuenta}>
            <img src={iconoUsuario} alt="Cuenta" />
          </Link>
          <Link className="cart-icon" to="/carrito">
            <img src={iconoCarrito} alt="Carrito" />
            <span className="badge text-bg-danger">{totalUnidades}</span>
          </Link>
          {usuario && <span className="small text-white">{usuario.nombre}</span>}
        </div>
      </div>
      <nav className="navbar bg-body-tertiary">
        <div className="contenedor-fluido justify-start gap-2">
          <Link className={claseNav(pathname === '/')} to="/">
            Inicio
          </Link>
          <Link className={claseNav(pathname === '/catalogo')} to="/catalogo">
            Productos
          </Link>
          <div className="dropdown me-2" ref={menuRef}>
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              Categorías
            </button>
            <ul className={`dropdown-menu ${menuAbierto ? 'show' : ''}`}>
              {CATEGORIAS.map(([valor, texto]) => (
                <li key={valor}>
                  <Link
                    className="dropdown-item"
                    to={`/catalogo?categoria=${encodeURIComponent(valor)}`}
                    onClick={() => setMenuAbierto(false)}
                  >
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {personal && (
            <Link className="btn btn-outline-secondary me-2" to="/admin">
              Administración
            </Link>
          )}
          <Link className="btn btn-outline-secondary" to="/software">
            Software
          </Link>
          <Link className="btn btn-outline-secondary" to="/noticias">
            Blogs
          </Link>
          <Link className="btn btn-outline-secondary" to="/nosotros">
            Nosotros
          </Link>
          <Link className="btn btn-outline-secondary" to="/contacto">
            Contacto
          </Link>
          {usuario && (
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={salir}>
              Cerrar sesión
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}
