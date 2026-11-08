const formatoCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export const formatearCLP = (valor: number) => formatoCLP.format(valor)

export const formatearFechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

export const etiquetaRol = (rol: string) =>
  ({ admin: 'Administrador', cliente: 'Cliente', vendedor: 'Vendedor' })[rol] ?? rol

export const esPersonal = (rol?: string) => rol === 'admin' || rol === 'vendedor'

// Ofertas: el precio que realmente se cobra es el de oferta cuando existe y es menor.
export const enOferta = (p: { precio: number; precioOferta?: number | null }) =>
  typeof p.precioOferta === 'number' && p.precioOferta > 0 && p.precioOferta < p.precio

export const precioFinal = (p: { precio: number; precioOferta?: number | null }) =>
  enOferta(p) ? (p.precioOferta as number) : p.precio

export const porcentajeDescuento = (p: { precio: number; precioOferta?: number | null }) =>
  enOferta(p) ? Math.round((1 - (p.precioOferta as number) / p.precio) * 100) : 0
