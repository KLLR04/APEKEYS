// Pruebas del servicio de la API externa SteamGridDB, con "fetch" simulado (no sale a internet).
import { imagenesDeJuego } from '../src/services/steamgriddb'

const respuesta = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 })

describe('servicio SteamGridDB', () => {
  it('busca el juego por nombre y luego pide sus imágenes a través de /steamgriddb', async () => {
    const espia = spyOn(window, 'fetch').and.callFake(async (url) => {
      if (String(url).includes('/search/autocomplete/')) return respuesta([{ id: 7, name: 'Juego' }])
      return respuesta([1, 2, 3, 4, 5].map((n) => ({ id: n, url: `u${n}`, thumb: `t${n}` })))
    })
    const imagenes = await imagenesDeJuego('Hollow Knight', 4)
    expect(espia.calls.argsFor(0)[0]).toBe('/steamgriddb/search/autocomplete/Hollow%20Knight')
    expect(espia.calls.argsFor(1)[0]).toBe('/steamgriddb/heroes/game/7?types=static')
    expect(imagenes.length).toBe(4)
  })

  it('si no encuentra el juego devuelve una lista vacía', async () => {
    spyOn(window, 'fetch').and.callFake(async () => respuesta([]))
    expect(await imagenesDeJuego('No existe')).toEqual([])
  })

  it('si la API rechaza la clave lanza un error (la galería se oculta)', async () => {
    spyOn(window, 'fetch').and.callFake(async () => new Response('', { status: 401 }))
    await expectAsync(imagenesDeJuego('Juego')).toBeRejectedWithError(/401/)
  })
})
