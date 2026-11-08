import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import Campo from '../components/Campo'
import PasosCompra from '../components/PasosCompra'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useAuth } from '../hooks/useAuth'
import { useCarga } from '../hooks/useCarga'
import { useCart } from '../hooks/useCart'
import { useFormulario } from '../hooks/useFormulario'
import { useTitulo } from '../hooks/useTitulo'
import { listarRegiones } from '../services/contenido'
import { crearOrden } from '../services/ordenes'
import { listarProductos, modificarProducto } from '../services/productos'
import { obtenerUsuario } from '../services/usuarios'
import { claseControl } from '../utils/formulario'
import { formatearCLP, precioFinal } from '../utils/formato'
import { validarCorreo, validarTextoRequerido } from '../utils/validaciones'
import type { ItemCarrito, LineaOrden, Producto, Region, Usuario } from '../types'

// Paso 2 de la compra. Carga lo necesario y, cuando está todo, dibuja el formulario
// con los datos del usuario ya completados (requisito de la rúbrica).
export default function Checkout() {
  useTitulo('Checkout | APEKEYS')
  const { usuario } = useAuth()
  const { items } = useCart()
  const productos = useCarga(listarProductos)
  const regiones = useCarga(listarRegiones)
  const cargarPerfil = useCallback(() => obtenerUsuario(usuario!.id), [usuario])
  const perfil = useCarga(cargarPerfil)
  // Al pagar se vacía el carrito; esta bandera evita que la guardia de abajo nos mande
  // de vuelta a /carrito antes de llegar a la página de compra exitosa.
  const [pagado, setPagado] = useState(false)

  if (!items.length && !pagado) return <Navigate to="/carrito" replace />

  const error = productos.error ?? regiones.error ?? perfil.error
  const listo = productos.datos && regiones.datos && perfil.datos

  return (
    <div className="container">
      <PasosCompra actual={2} />
      <div className="section-head">
        <div>
          <span className="eyebrow">Paso 2 de 3</span>
          <h1>Datos de compra</h1>
          <p>Revisa tus datos y elige cómo recibir tus claves.</p>
        </div>
        <Link className="btn btn-secondary btn-sm" to="/carrito">
          Volver al carrito
        </Link>
      </div>
      {error && <ErrorApiMensaje mensaje={error} />}
      {!error && !listo && <Cargando />}
      {listo && (
        <FormularioCheckout
          perfil={perfil.datos!}
          regiones={regiones.datos!}
          productos={productos.datos!}
          items={items}
          onPagado={() => setPagado(true)}
        />
      )}
    </div>
  )
}

interface PropsFormulario {
  perfil: Usuario
  regiones: Region[]
  productos: Producto[]
  items: ItemCarrito[]
  onPagado: () => void
}

function FormularioCheckout({ perfil, regiones, productos, items, onPagado }: PropsFormulario) {
  const { vaciar } = useCart()
  const navigate = useNavigate()
  const [procesando, setProcesando] = useState(false)
  const [aviso, setAviso] = useState('')

  const { valores, errores, cambiar, salir, ponerValor, validar } = useFormulario(
    {
      nombre: `${perfil.nombre} ${perfil.apellidos}`.trim(),
      email: perfil.email,
      direccion: perfil.direccion ?? '',
      region: perfil.region ?? '',
      comuna: perfil.comuna ?? '',
      entrega: 'correo',
      simularRechazo: false,
    },
    {
      nombre: (v) => validarTextoRequerido(v, 'El nombre', 100, 2),
      email: validarCorreo,
      direccion: (v) => validarTextoRequerido(v, 'La dirección', 300),
      region: (v) => validarTextoRequerido(v, 'La región'),
      comuna: (v) => validarTextoRequerido(v, 'La comuna'),
    },
  )

  const comunas = regiones.find((r) => r.nombre === valores.region)?.comunas ?? []
  const lineas = items.flatMap((item) => {
    const producto = productos.find((p) => p.id === item.productId)
    return producto ? [{ item, producto }] : []
  })
  const total = lineas.reduce((s, { item, producto }) => s + precioFinal(producto) * item.cantidad, 0)

  async function pagar(e: FormEvent) {
    e.preventDefault()
    setAviso('')
    if (!validar() || procesando) return

    // Demo: permite mostrar la vista de pago rechazado sin tocar stock ni órdenes.
    if (valores.simularRechazo) {
      navigate('/compra/fallida', { state: { motivo: 'El banco rechazó la transacción (simulado).' } })
      return
    }

    setProcesando(true)
    try {
      // Revisión final con el stock y precio REALES de la API (otro cliente pudo comprar antes).
      const actuales = await listarProductos()
      const detalle: LineaOrden[] = []
      for (const { item, producto } of lineas) {
        const p = actuales.find((x) => x.id === producto.id)
        if (!p || !p.activo || precioFinal(p) !== precioFinal(producto) || item.cantidad > p.stock) {
          setAviso('El catálogo cambió mientras comprabas. Vuelve al carrito para revisarlo.')
          return
        }
        detalle.push({
          productId: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          precio: precioFinal(p),
          cantidad: item.cantidad,
          subtotal: precioFinal(p) * item.cantidad,
        })
      }

      // Se descuenta el stock y luego se registra la orden. Si algo falla a mitad de
      // camino, se devuelve el stock que ya se había descontado.
      const descontados: Producto[] = []
      try {
        for (const linea of detalle) {
          const p = actuales.find((x) => x.id === linea.productId)!
          await modificarProducto(p.id, { stock: p.stock - linea.cantidad })
          descontados.push(p)
        }
        const orden = await crearOrden({
          usuarioId: perfil.id,
          usuario: perfil.email,
          fecha: new Date().toISOString(),
          total: detalle.reduce((s, l) => s + l.subtotal, 0),
          estado: 'Pagada (simulada)',
          detalle,
          entrega: valores.entrega === 'cuenta' ? 'Clave en mi cuenta' : 'Clave por correo',
          comprador: {
            nombre: valores.nombre.trim(),
            email: valores.email.trim().toLowerCase(),
            direccion: valores.direccion.trim(),
            comuna: valores.comuna,
            region: valores.region,
          },
        })
        onPagado()
        vaciar()
        navigate(`/compra/exitosa/${orden.id}`, { replace: true })
      } catch {
        for (const p of descontados) await modificarProducto(p.id, { stock: p.stock }).catch(() => {})
        navigate('/compra/fallida', { state: { motivo: 'No pudimos registrar la compra. No se descontó stock.' } })
      }
    } catch (err) {
      setAviso(err instanceof Error ? err.message : 'No se pudo conectar con la API.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="row g-4">
      <form className="col-12 col-lg-7" onSubmit={pagar} noValidate>
        <section className="card form-card">
          {aviso && (
            <div className="alert alert-danger" role="alert">
              {aviso}
            </div>
          )}
          <h2 className="h5">Comprador</h2>
          <Campo etiqueta="Nombre completo" htmlFor="chkNombre" error={errores.nombre}>
            <input id="chkNombre" name="nombre" className={claseControl(errores.nombre)} maxLength={100}
              value={valores.nombre} onChange={cambiar} onBlur={salir} autoComplete="name" />
          </Campo>
          <Campo etiqueta="Correo (aquí llegan tus claves)" htmlFor="chkEmail" error={errores.email}>
            <input id="chkEmail" name="email" type="email" className={claseControl(errores.email)} maxLength={100}
              value={valores.email} onChange={cambiar} onBlur={salir} autoComplete="email" />
          </Campo>

          <h2 className="h5 mt-3">Dirección de facturación</h2>
          <div className="form-grid">
            <Campo etiqueta="Región" htmlFor="chkRegion" error={errores.region}>
              <select id="chkRegion" name="region" className={claseControl(errores.region, 'form-select')}
                value={valores.region} onBlur={salir}
                onChange={(e) => {
                  ponerValor('region', e.target.value)
                  ponerValor('comuna', '')
                }}>
                <option value="">Selecciona una región</option>
                {regiones.map((r) => (
                  <option key={r.id} value={r.nombre}>{r.nombre}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Comuna" htmlFor="chkComuna" error={errores.comuna}>
              <select id="chkComuna" name="comuna" className={claseControl(errores.comuna, 'form-select')}
                value={valores.comuna} onChange={cambiar} onBlur={salir} disabled={!comunas.length}>
                <option value="">{comunas.length ? 'Selecciona una comuna' : 'Primero elige una región'}</option>
                {comunas.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Dirección" htmlFor="chkDireccion" error={errores.direccion} className="span-2">
              <input id="chkDireccion" name="direccion" className={claseControl(errores.direccion)} maxLength={300}
                value={valores.direccion} onChange={cambiar} onBlur={salir} autoComplete="street-address" />
            </Campo>
          </div>

          <h2 className="h5 mt-3">Entrega</h2>
          <div className="radio-row mt-0 mb-3">
            <div className="form-check">
              <input className="form-check-input" type="radio" id="entregaCorreo" name="entrega" value="correo"
                checked={valores.entrega === 'correo'} onChange={cambiar} />
              <label className="form-check-label" htmlFor="entregaCorreo">Clave por correo</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" id="entregaCuenta" name="entrega" value="cuenta"
                checked={valores.entrega === 'cuenta'} onChange={cambiar} />
              <label className="form-check-label" htmlFor="entregaCuenta">Clave en mi cuenta APEKEYS</label>
            </div>
          </div>

          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="simularRechazo" name="simularRechazo"
              checked={Boolean(valores.simularRechazo)} onChange={cambiar} />
            <label className="form-check-label muted" htmlFor="simularRechazo">
              Demo: simular pago rechazado
            </label>
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={procesando}>
            {procesando ? 'Procesando...' : `Pagar ${formatearCLP(total)}`}
          </button>
        </section>
      </form>

      <aside className="col-12 col-lg-5">
        <section className="card form-card">
          <h2 className="h5">Tu pedido</h2>
          <ul className="list-unstyled mb-0">
            {lineas.map(({ item, producto }) => (
              <li key={producto.id} className="d-flex justify-content-between gap-2 py-1">
                <span>{producto.nombre} × {item.cantidad}</span>
                <span>{formatearCLP(precioFinal(producto) * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <hr />
          <p className="d-flex justify-content-between mb-0">
            <strong>Total</strong>
            <strong className="price">{formatearCLP(total)}</strong>
          </p>
          <p className="small muted mt-2 mb-0">Compra de demostración: no se realizan cobros reales.</p>
        </section>
      </aside>
    </div>
  )
}
