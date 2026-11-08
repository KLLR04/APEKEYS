import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Header from './Header'
import Footer from './Footer'

// Marco común de las páginas de la tienda: encabezado + contenido de la ruta + pie.
// <Outlet /> es el "hueco" donde react-router dibuja la página que corresponde a la URL.
export default function Layout() {
  const { pathname } = useLocation()

  // Al cambiar de página se vuelve arriba (el navegador lo hacía solo al recargar).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Header />
      <main className="page-main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
