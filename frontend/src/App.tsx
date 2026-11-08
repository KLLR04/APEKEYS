import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import AdminPanel from './pages/AdminPanel'
import AdminUsuarios from './pages/AdminUsuarios'
import Articulo from './pages/Articulo'
import Carrito from './pages/Carrito'
import Catalogo from './pages/Catalogo'
import Checkout from './pages/Checkout'
import Categorias from './pages/Categorias'
import Contacto from './pages/Contacto'
import Ficha from './pages/Ficha'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import NoEncontrada from './pages/NoEncontrada'
import Nosotros from './pages/Nosotros'
import Noticias from './pages/Noticias'
import Proximamente from './pages/Proximamente'
import Registro from './pages/Registro'
import { CompraExitosa, CompraFallida } from './pages/ResultadoCompra'

// Tabla de rutas de la aplicación: qué página se dibuja para cada URL.
function App() {
  return (
    <Routes>
      {/* El login no lleva encabezado ni pie, por eso va fuera del Layout */}
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/software" element={<Catalogo categoriaFija="Software" />} />
        <Route path="/ofertas" element={<Catalogo soloOfertas />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/ficha/:id" element={<Ficha />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticias/:id" element={<Articulo />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/proximamente/:juego" element={<Proximamente />} />

        {/* Solo con sesión iniciada */}
        <Route element={<RutaProtegida />}>
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra/exitosa/:id" element={<CompraExitosa />} />
          <Route path="/compra/fallida" element={<CompraFallida />} />
        </Route>

        {/* Solo administrador y vendedor (el vendedor ve todo en modo consulta) */}
        <Route element={<RutaProtegida roles={['admin', 'vendedor']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Solo administrador */}
        <Route element={<RutaProtegida roles={['admin']} />}>
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        </Route>

        {/* Enlaces de las páginas antiguas */}
        <Route path="/acceso-tienda" element={<Navigate to="/catalogo" replace />} />
        <Route path="/inventario" element={<Navigate to="/admin#inventario" replace />} />

        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
