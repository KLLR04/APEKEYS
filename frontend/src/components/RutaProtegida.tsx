import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '../types'
import { useAuth } from '../hooks/useAuth'
import { Cargando } from './MensajeEstado'

// Protege un grupo de rutas.
//  - sin sesión            -> /login?next=<página que quería>
//  - sesión con otro rol   -> /catalogo
// Si no se indican roles, basta con tener sesión (ej. el carrito).
export default function RutaProtegida({ roles }: { roles?: Rol[] }) {
  const { usuario, cargando, sesionCerrada } = useAuth()
  const { pathname } = useLocation()

  if (cargando)
    return (
      <div className="contenedor">
        <Cargando />
      </div>
    )
  if (!usuario) {
    // Si la persona acaba de cerrar sesión no se recuerda la página protegida.
    const destino = sesionCerrada ? '/login' : `/login?next=${encodeURIComponent(pathname)}`
    return <Navigate to={destino} replace />
  }
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/catalogo" replace />
  return <Outlet />
}
