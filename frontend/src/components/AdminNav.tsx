import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export default function AdminNav({ activo }: { activo: 'resumen' | 'usuarios' }) {
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin'

  return (
    <aside className="card admin-nav" aria-label="Menú administrativo">
      <strong>Opciones</strong>
      <Link className={activo === 'resumen' ? 'active' : ''} to="/admin">
        Resumen
      </Link>
      {esAdmin && <Link to="/admin#inventario">Mantenedor de productos</Link>}
      {esAdmin && (
        <Link className={activo === 'usuarios' ? 'active' : ''} to="/admin/usuarios">
          Mantenedor de usuarios
        </Link>
      )}
      <Link to="/">Ver tienda</Link>
    </aside>
  )
}
