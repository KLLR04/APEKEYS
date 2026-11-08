// Capa base de acceso a la API. Todos los servicios usan esta función.
// "/api" lo reenvía Vite a json-server (ver vite.config.ts).

const BASE = '/api'

export class ErrorApi extends Error {
  estado: number
  constructor(mensaje: string, estado: number) {
    super(mensaje)
    this.estado = estado
  }
}

export async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  let respuesta: Response
  try {
    respuesta = await fetch(BASE + ruta, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    })
  } catch {
    // fetch solo lanza error cuando no hay conexión con el servidor.
    throw new ErrorApi('No se pudo conectar con la API. ¿Está corriendo "npm run api"?', 0)
  }
  if (!respuesta.ok) {
    throw new ErrorApi(`La API respondió ${respuesta.status} en ${ruta}`, respuesta.status)
  }
  return (await respuesta.json()) as T
}

export function enviar<T>(ruta: string, metodo: 'POST' | 'PUT' | 'PATCH', datos: unknown) {
  return pedir<T>(ruta, { method: metodo, body: JSON.stringify(datos) })
}
