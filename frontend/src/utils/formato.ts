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
