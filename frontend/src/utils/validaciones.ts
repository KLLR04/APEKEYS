// Reglas de validación compartidas (puerto de js/validaciones.js del proyecto original).
// Cada función devuelve null si el valor es válido, o el mensaje de error si no lo es.

export function normalizarRun(valor: string) {
  return String(valor || '').trim().toUpperCase().replace(/[.\-\s]/g, '')
}

// RUN chileno: 7 a 9 caracteres, sin puntos ni guion, con dígito verificador (módulo 11).
export function validarRun(valor: string): string | null {
  const run = normalizarRun(valor)
  if (!run) return 'El RUN es obligatorio.'
  if (run.length < 7 || run.length > 9)
    return 'El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion.'
  if (!/^[0-9]+[0-9K]$/.test(run))
    return 'El RUN solo admite números y una K final como dígito verificador.'

  const cuerpo = run.slice(0, -1)
  const dv = run.slice(-1)
  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  const resto = 11 - (suma % 11)
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === esperado ? null : 'El RUN ingresado no es válido (dígito verificador incorrecto).'
}

export function validarCorreo(valor: string): string | null {
  const correo = String(valor || '').trim().toLowerCase()
  if (!correo) return 'El correo es obligatorio.'
  if (correo.length > 100) return 'El correo admite un máximo de 100 caracteres.'
  if (!/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/.test(correo))
    return 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com'
  return null
}

export function validarPassword(valor: string): string | null {
  if (!valor) return 'La contraseña es obligatoria.'
  if (valor.length < 4 || valor.length > 10) return 'La contraseña debe tener entre 4 y 10 caracteres.'
  return null
}

export function validarTextoRequerido(
  valor: string,
  etiqueta: string,
  maximo?: number,
  minimo = 1,
): string | null {
  const texto = String(valor || '').trim()
  if (!texto) return `${etiqueta} es obligatorio.`
  if (texto.length < minimo) return `${etiqueta} debe tener al menos ${minimo} caracteres.`
  if (maximo && texto.length > maximo) return `${etiqueta} admite un máximo de ${maximo} caracteres.`
  return null
}

export function validarTextoOpcional(valor: string, etiqueta: string, maximo: number): string | null {
  const texto = String(valor || '').trim()
  return texto && texto.length > maximo ? `${etiqueta} admite un máximo de ${maximo} caracteres.` : null
}

// Ojo: el 0 es un número válido de stock, por eso se compara el texto y no el "falsy".
const estaVacio = (valor: string) => String(valor ?? '').trim() === ''

export function validarPrecio(valor: string): string | null {
  if (estaVacio(valor)) return 'El precio es obligatorio.'
  const precio = Number(valor)
  if (!Number.isFinite(precio)) return 'El precio debe ser un número.'
  if (precio <= 0) return 'El precio debe ser mayor a cero.'
  return null
}

export function validarStock(valor: string, etiqueta = 'El stock'): string | null {
  if (estaVacio(valor)) return `${etiqueta} es obligatorio.`
  const stock = Number(valor)
  if (!Number.isInteger(stock)) return `${etiqueta} debe ser un número entero.`
  if (stock < 0) return `${etiqueta} no puede ser negativo.`
  return null
}

// Fecha opcional en formato ISO (aaaa-mm-dd), usada en el mantenedor de usuarios.
export function validarFechaNacimiento(valor: string): string | null {
  if (!valor) return null
  const fecha = new Date(valor)
  if (isNaN(fecha.getTime())) return 'La fecha de nacimiento no es válida.'
  if (fecha > new Date()) return 'La fecha de nacimiento no puede ser futura.'
  if (fecha.getFullYear() < 1900) return 'Revisa el año de la fecha de nacimiento.'
  return null
}

// Fecha escrita a mano como DD/MM/AAAA (registro público).
export function validarFechaManual(valor: string): string | null {
  const texto = String(valor || '').trim()
  if (!texto) return null
  const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!partes) return 'Escribe la fecha en formato DD/MM/AAAA. Ejemplo: 25/07/2002'

  const dia = Number(partes[1])
  const mes = Number(partes[2])
  const anio = Number(partes[3])
  if (mes < 1 || mes > 12) return 'El mes debe estar entre 01 y 12.'
  if (dia < 1 || dia > 31) return 'El día debe estar entre 01 y 31.'

  const fecha = new Date(anio, mes - 1, dia)
  // Si el día no existe (31/02), JavaScript lo corre al mes siguiente: lo detectamos.
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes - 1 || fecha.getFullYear() !== anio)
    return 'Esa fecha no existe en el calendario.'
  if (fecha > new Date()) return 'La fecha de nacimiento no puede ser futura.'
  if (anio < 1900) return 'Revisa el año de la fecha de nacimiento.'
  return null
}

export function fechaManualAIso(valor: string) {
  const partes = String(valor || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : ''
}

export function validarUrlImagen(valor: string): string | null {
  const url = String(valor || '').trim()
  if (!url) return null
  if (url.startsWith('data:image/')) return null
  // Imágenes guardadas dentro del proyecto (carpeta public/img), ej. /img/productos/juego.webp
  if (/^\/img\/[\w./-]+\.(png|jpe?g|webp|gif)$/i.test(url)) return null
  if (url.length > 500) return 'La URL admite un máximo de 500 caracteres.'
  if (!/^https?:\/\/.+/i.test(url))
    return 'La imagen debe ser una URL que empiece con http:// o https://, una ruta /img/... o un archivo subido.'
  return null
}
