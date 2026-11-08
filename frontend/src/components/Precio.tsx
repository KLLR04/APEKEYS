import type { Producto } from '../types'
import { enOferta, formatearCLP, precioFinal } from '../utils/formato'

interface Props {
  producto: Pick<Producto, 'precio' | 'precioOferta'>
  className?: string
}

// Muestra el precio de un producto. Si está en oferta, el precio original va tachado
// al lado del precio rebajado. Una sola pieza para tarjeta, ficha y carrito.
export default function Precio({ producto, className = 'price' }: Props) {
  return (
    <span>
      {enOferta(producto) && (
        <del className="precio-original" aria-label={`Antes ${formatearCLP(producto.precio)}`}>
          {formatearCLP(producto.precio)}
        </del>
      )}
      <strong className={className}>{formatearCLP(precioFinal(producto))}</strong>
    </span>
  )
}
