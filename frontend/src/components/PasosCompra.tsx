const PASOS = ['Carrito', 'Datos y entrega', 'Confirmación']

// Indicador de en qué paso de la compra va el cliente (1, 2 o 3).
export default function PasosCompra({ actual }: { actual: 1 | 2 | 3 }) {
  return (
    <ol className="pasos-compra" aria-label="Pasos de la compra">
      {PASOS.map((nombre, i) => {
        const numero = i + 1
        const estado = numero === actual ? 'actual' : numero < actual ? 'hecho' : ''
        return (
          <li key={nombre} className={estado} aria-current={numero === actual ? 'step' : undefined}>
            {numero}. {nombre}
          </li>
        )
      })}
    </ol>
  )
}
