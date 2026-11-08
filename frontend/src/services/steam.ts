// API pública de la tienda de Steam: capturas de pantalla (gameplay) de un juego.
// No necesita clave. El navegador llama a /steam-tienda/... y Vite lo reenvía a
// https://store.steampowered.com/api/... (ver vite.config.ts).

export interface Captura {
  miniatura: string // versión liviana (600x338) para la galería
  completa: string // tamaño completo (1920x1080) al hacer clic
}

interface CapturaSteam {
  id: number
  path_thumbnail: string
  path_full: string
}

type RespuestaSteam = Record<string, { success: boolean; data?: { screenshots?: CapturaSteam[] } }>

// Quita el "?t=..." del final: así dos URLs de la misma imagen se reconocen como iguales.
const sinParametros = (url: string) => url.split('?')[0]

// Deja solo imágenes distintas (compara por la dirección de la imagen completa).
export function quitarRepetidas(capturas: Captura[]): Captura[] {
  const vistas = new Set<string>()
  return capturas.filter((c) => {
    const clave = sinParametros(c.completa)
    if (vistas.has(clave)) return false
    vistas.add(clave)
    return true
  })
}

export async function capturasDeSteam(appId: number, cantidad = 6): Promise<Captura[]> {
  const respuesta = await fetch(`/steam-tienda/appdetails?appids=${appId}&filters=screenshots`)
  if (!respuesta.ok) throw new Error(`Steam respondió ${respuesta.status}`)
  const cuerpo = (await respuesta.json()) as RespuestaSteam
  const juego = cuerpo[String(appId)]
  if (!juego?.success) return []
  const capturas = (juego.data?.screenshots ?? []).map((s) => ({
    miniatura: s.path_thumbnail,
    completa: s.path_full,
  }))
  return quitarRepetidas(capturas).slice(0, cantidad)
}
