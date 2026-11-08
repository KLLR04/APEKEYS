// API externa SteamGridDB (https://www.steamgriddb.com/api/v2): imágenes de videojuegos.
// El navegador llama a /steamgriddb/... y Vite lo reenvía agregando la clave (ver vite.config.ts).
// Así la clave nunca queda escrita en el código que descarga el visitante.

const BASE = '/steamgriddb'

export interface ImagenSteamGridDB {
  id: number
  url: string // imagen en tamaño completo
  thumb: string // versión liviana para mostrar en la galería
}

interface Respuesta<T> {
  success: boolean
  data: T
}

async function pedirSGDB<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(BASE + ruta)
  if (!respuesta.ok) throw new Error(`SteamGridDB respondió ${respuesta.status}`)
  const cuerpo = (await respuesta.json()) as Respuesta<T>
  if (!cuerpo.success) throw new Error('SteamGridDB no pudo responder')
  return cuerpo.data
}

// Paso 1: buscar el juego por nombre para obtener su id en SteamGridDB.
export async function buscarJuego(nombre: string): Promise<{ id: number; name: string } | undefined> {
  const resultados = await pedirSGDB<{ id: number; name: string }[]>(
    `/search/autocomplete/${encodeURIComponent(nombre)}`,
  )
  // Se prefiere el que tenga exactamente el mismo nombre (si no, el primero),
  // así "Ocarina of Time" no trae imágenes de un mod con nombre parecido.
  const exacto = resultados.find((j) => j.name.toLowerCase() === nombre.trim().toLowerCase())
  return exacto ?? resultados[0]
}

// Paso 2: con el id, pedir las imágenes "hero" (banners anchos) del juego.
export async function imagenesDeJuego(nombre: string, cantidad = 4): Promise<ImagenSteamGridDB[]> {
  const juego = await buscarJuego(nombre)
  if (!juego) return []
  const heroes = await pedirSGDB<ImagenSteamGridDB[]>(`/heroes/game/${juego.id}?types=static`)
  return heroes.slice(0, cantidad)
}
