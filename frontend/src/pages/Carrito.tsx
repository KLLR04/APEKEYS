import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import ImagenProducto from '../components/ImagenProducto'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useAuth } from '../hooks/useAuth'
import { useCarga } from '../hooks/useCarga'
import { useCart } from '../hooks/useCart'
import { useTitulo } from '../hooks/useTitulo'
import { useToast } from '../hooks/useToast'
import { crearOrden } from '../services/ordenes'
import { listarProductos, modificarProducto } from '../services/productos'
import { formatearCLP } from '../utils/formato'
import type { ItemCarrito, LineaOrden, Producto } from '../types'

export default function Carrito() {
  useTitulo('Carrito | APEKEYS')
  const { usuario } = useAuth()
  const { items, quitar, cambiarCantidad, reemplazar, vaciar } = useCart()
  const { mostrar } = useToast()
  const { datos: productos, cargando, error, recargar } = useCarga(listarProductos)
  const [procesando, setProcesando] = useState(false)

  // Se "sanea" el carrito contra el catálogo actual: se quitan productos eliminados,
  // desactivados o sin stock y se recortan cantidades que ya no caben en el stock.
  const { limpio, ajustes } = useMemo(() => {
    const limpio: ItemCarrito[] = []
    const ajustes: string[] = []
    if (!productos) return { limpio: items, ajustes }
    for (const item of items) {
      const p = productos.find((x) => x.id === item.productId)
      if (!p || !p.activo) {
        ajustes.push('Quitamos un producto que ya no está disponible.')
        continue
      }
      if (p.stock <= 0) {
        ajustes.push(`${p.nombre} se quedó sin stock y fue retirado del carrito.`)
        continue
      }
      let cantidad = item.cantidad
      if (!Number.isInteger(cantidad) || cantidad < 1) {
        ajustes.push('Se corrigió una cantidad inválida.')
        cantidad = 1
      }
      if (cantidad > p.stock) {
        ajustes.push(`Ajustamos ${p.nombre} a ${p.stock} unidades por stock disponible.`)
        cantidad = p.stock
      }
      limpio.push({ productId: p.id, cantidad })
    }
    return { limpio, ajustes }
  }, [items, productos])

  // Si hubo ajustes, se guarda el carrito corregido y se avisa una vez.
  useEffect(() => {
    if (ajustes.length) {
      reemplazar(limpio)
      mostrar(ajustes[0], true)
    }
    // reemplazar/mostrar cambian de identidad con el carrito; basta reaccionar a los ajustes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ajustes])

  const filas = limpio.flatMap((item) => {
    const producto = productos?.find((x) => x.id === item.productId)
    return producto ? [{ item, producto }] : []
  })
  const total = filas.reduce((suma, { item, producto }) => suma + producto.precio * item.cantidad, 0)

  async function finalizarCompra() {
    if (!usuario || !productos || procesando) return
    const ok = window.confirm(
      `Confirmar compra\nCompra de demostración por ${formatearCLP(total)}. Se descontará el stock; no se realizan cobros ni envíos.`,
    )
    if (!ok) return

    setProcesando(true)
    try {
      // Revisión final con el stock REAL de la API (otro cliente pudo comprar antes).
      const actuales = await listarProductos()
      const detalle: LineaOrden[] = []
      for (const { item, producto } of filas) {
        const p = actuales.find((x) => x.id === producto.id)
        if (!p || !p.activo || p.precio !== producto.precio || item.cantidad > p.stock) {
          mostrar('El catálogo cambió. Revisa el carrito.', true)
          recargar()
          return
        }
        detalle.push({
          productId: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: item.cantidad,
          subtotal: p.precio * item.cantidad,
        })
      }

      // Se descuenta el stock de cada producto y luego se registra la orden.
      // Si algo falla a mitad de camino, se devuelve el stock que ya se había descontado.
      const descontados: Producto[] = []
      try {
        for (const linea of detalle) {
          const p = actuales.find((x) => x.id === linea.productId)!
          await modificarProducto(p.id, { stock: p.stock - linea.cantidad })
          descontados.push(p)
        }
        await crearOrden({
          usuarioId: usuario.id,
          usuario: usuario.email,
          fecha: new Date().toISOString(),
          total: detalle.reduce((suma, l) => suma + l.subtotal, 0),
          estado: 'Simulada',
          detalle,
        })
      } catch {
        for (const p of descontados) await modificarProducto(p.id, { stock: p.stock }).catch(() => {})
        mostrar('No se pudo guardar la compra.', true)
        recargar()
        return
      }

      vaciar()
      recargar()
      mostrar('Compra simulada. Stock actualizado y orden registrada.')
    } catch (e) {
      mostrar(e instanceof Error ? e.message : 'No se pudo guardar la compra.', true)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="contenedor">
      <div className="section-head">
        <div>
          <span className="eyebrow">Tu selección</span>
          <h1>Carrito de compras</h1>
          <p>
            Ajusta las cantidades antes de finalizar. Solo puedes comprar hasta el stock disponible.
          </p>
        </div>
        <Link className="btn btn-secondary btn-sm" to="/catalogo">
          Seguir comprando
        </Link>
      </div>

      {cargando && !productos && <Cargando />}
      {error && <ErrorApiMensaje mensaje={error} />}

      {productos && (
        <>
          <section className="cart-list" aria-label="Productos en el carrito">
            {filas.map(({ item, producto }) => (
              <FilaCarrito
                key={producto.id}
                producto={producto}
                cantidad={item.cantidad}
                onCantidad={(n) => cambiarCantidad(producto.id, n)}
                onQuitar={() => {
                  quitar(producto.id)
                  mostrar(`${producto.nombre} se quitó del carrito`)
                }}
              />
            ))}
            {filas.length === 0 && (
              <div className="card empty-state">
                <h2>Tu carrito está vacío</h2>
                <p>Explora el catálogo y agrega tu próxima aventura.</p>
                <Link className="btn btn-primary" to="/catalogo">
                  Ver productos
                </Link>
              </div>
            )}
          </section>

          {filas.length > 0 && (
            <section className="card cart-summary">
              <div>
                <span className="muted">Total de la compra</span>
                <br />
                <strong>{formatearCLP(total)}</strong>
              </div>
              <button className="btn btn-primary" type="button" disabled={procesando} onClick={finalizarCompra}>
                Finalizar compra
              </button>
            </section>
          )}
        </>
      )}
    </div>
  )
}

interface PropsFila {
  producto: Producto
  cantidad: number
  onCantidad: (n: number) => void
  onQuitar: () => void
}

function FilaCarrito({ producto: p, cantidad, onCantidad, onQuitar }: PropsFila) {
  // "borrador" es lo que el usuario está escribiendo; null = mostrar la cantidad guardada.
  const [borrador, setBorrador] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  function escribir(texto: string) {
    setBorrador(texto)
    const n = Number(texto)
    if (Number.isInteger(n) && n >= 1 && n <= p.stock) {
      setAviso('')
      onCantidad(n)
    }
  }

  function confirmar() {
    if (borrador === null) return
    let n = Number(borrador)
    if (!Number.isInteger(n) || n < 1) {
      setAviso('Ingresa una cantidad entera de al menos 1.')
      n = 1
    } else if (n > p.stock) {
      setAviso(`Solo quedan ${p.stock} unidades.`)
      n = p.stock
    } else {
      setAviso('')
    }
    onCantidad(n)
    setBorrador(null)
  }

  return (
    <article className="card cart-item">
      <ImagenProducto src={p.imagen} alt={`Portada de ${p.nombre}`} />
      <div>
        <Link to={`/ficha/${p.id}`}>
          <strong>{p.nombre}</strong>
        </Link>
        <div className="muted">
          {p.plataforma} · {formatearCLP(p.precio)} c/u
        </div>
        <label className="field" style={{ maxWidth: 130, marginTop: 8 }}>
          Cantidad
          <input
            className="form-control"
            type="number"
            min={1}
            max={p.stock}
            step={1}
            value={borrador ?? String(cantidad)}
            onChange={(e) => escribir(e.target.value)}
            onBlur={confirmar}
          />
          <span className="field-error">{aviso}</span>
        </label>
      </div>
      <div className="cart-item-right">
        <strong className="price">{formatearCLP(p.precio * cantidad)}</strong>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onQuitar}>
          Quitar
        </button>
      </div>
    </article>
  )
}
