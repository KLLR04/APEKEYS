import { useCallback } from 'react'
import { useCarga } from '../hooks/useCarga'
import { capturasDeSteam, quitarRepetidas } from '../services/steam'
import type { Captura } from '../services/steam'
import type { Producto } from '../types'

// Junta las capturas de gameplay de un producto:
//  - las de la tienda de Steam, si el juego tiene steamAppId;
//  - las propias guardadas en public/img (campo "galeria"), para juegos que no están en Steam.
// Si Steam no responde (sin internet), se muestran igual las capturas propias.
// Todas las fichas muestran la misma cantidad (cuadrícula 2x2).
const CAPTURAS_POR_JUEGO = 4

async function cargarCapturas(producto: Producto): Promise<Captura[]> {
  const propias = (producto.galeria ?? []).map((url) => ({ miniatura: url, completa: url }))
  let deSteam: Captura[] = []
  if (producto.steamAppId) {
    try {
      deSteam = await capturasDeSteam(producto.steamAppId, CAPTURAS_POR_JUEGO)
    } catch {
      deSteam = [] // sin conexión con Steam: la ficha sigue funcionando
    }
  }
  return quitarRepetidas([...propias, ...deSteam]).slice(0, CAPTURAS_POR_JUEGO)
}

export default function GaleriaJuego({ producto }: { producto: Producto }) {
  const cargar = useCallback(() => cargarCapturas(producto), [producto])
  const { datos: capturas, cargando } = useCarga(cargar)

  if (cargando) return <p className="muted small mt-3">Cargando capturas…</p>
  if (!capturas || capturas.length === 0) return null

  return (
    <section className="section" aria-labelledby="galeria-titulo">
      <div className="section-head">
        <div>
          <span className="eyebrow">Gameplay</span>
          <h2 id="galeria-titulo">Capturas del juego</h2>
        </div>
        {producto.steamAppId && (
          <p className="muted small">
            Fuente:{' '}
            <a href={`https://store.steampowered.com/app/${producto.steamAppId}`} target="_blank" rel="noreferrer">
              Steam
            </a>
          </p>
        )}
      </div>
      <div className="galeria-juego">
        {capturas.map((c, i) => (
          <a key={c.completa} href={c.completa} target="_blank" rel="noreferrer" className="galeria-item">
            <img src={c.miniatura} alt={`Captura ${i + 1} de ${producto.nombre}`} loading="lazy" />
          </a>
        ))}
      </div>
    </section>
  )
}
