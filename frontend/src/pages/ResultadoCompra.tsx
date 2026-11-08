import { useCallback } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import PasosCompra from '../components/PasosCompra'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { obtenerOrden } from '../services/ordenes'
import { formatearCLP, formatearFechaLarga } from '../utils/formato'

// Paso 3 (éxito): resumen de la orden recién creada.
export function CompraExitosa() {
  useTitulo('Compra exitosa | APEKEYS')
  const { id = '' } = useParams()
  const cargar = useCallback(() => obtenerOrden(id), [id])
  const { datos: orden, cargando, error } = useCarga(cargar)

  return (
    <div className="container narrow">
      <PasosCompra actual={3} />
      {cargando && <Cargando />}
      {error && <ErrorApiMensaje mensaje="No encontramos esa orden." />}
      {orden && (
        <section className="card form-card">
          <span className="eyebrow">Orden #{orden.id}</span>
          <h1 className="text-success">¡Compra exitosa!</h1>
          <p>
            {orden.comprador
              ? <>Enviaremos tus claves a <strong>{orden.comprador.email}</strong>.</>
              : 'Tu compra quedó registrada.'}
          </p>
          <dl className="row mb-3">
            <dt className="col-sm-4">Fecha</dt>
            <dd className="col-sm-8">{formatearFechaLarga(orden.fecha)}</dd>
            {orden.entrega && (
              <>
                <dt className="col-sm-4">Entrega</dt>
                <dd className="col-sm-8">{orden.entrega}</dd>
              </>
            )}
            {orden.comprador && (
              <>
                <dt className="col-sm-4">Facturación</dt>
                <dd className="col-sm-8">
                  {orden.comprador.nombre} · {orden.comprador.direccion}, {orden.comprador.comuna}
                </dd>
              </>
            )}
          </dl>
          <div className="table-responsive">
            <table className="table align-middle">
              <caption className="visually-hidden">Detalle de la orden</caption>
              <thead className="table-light">
                <tr><th>Producto</th><th>Cant.</th><th className="text-end">Subtotal</th></tr>
              </thead>
              <tbody>
                {orden.detalle.map((d) => (
                  <tr key={d.productId}>
                    <td>{d.nombre}</td>
                    <td>{d.cantidad}</td>
                    <td className="text-end">{formatearCLP(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th colSpan={2}>Total</th><th className="text-end">{formatearCLP(orden.total)}</th></tr>
              </tfoot>
            </table>
          </div>
          <Link className="btn btn-primary" to="/catalogo">Seguir comprando</Link>
        </section>
      )}
    </div>
  )
}

// Paso 3 (error): el pago no se pudo realizar; el carrito se conserva.
export function CompraFallida() {
  useTitulo('Pago no realizado | APEKEYS')
  const { state } = useLocation() as { state: { motivo?: string } | null }

  return (
    <div className="container narrow">
      <PasosCompra actual={3} />
      <section className="card empty-state">
        <h1 className="text-danger">No se pudo realizar el pago</h1>
        <p>{state?.motivo ?? 'Ocurrió un problema al procesar el pago.'}</p>
        <p className="muted">Tu carrito sigue guardado. Revisa tus datos o intenta nuevamente.</p>
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link className="btn btn-primary" to="/checkout">Reintentar pago</Link>
          <Link className="btn btn-secondary" to="/carrito">Volver al carrito</Link>
        </div>
      </section>
    </div>
  )
}
