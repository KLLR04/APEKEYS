// Pruebas del servicio de capturas de Steam, con "fetch" simulado (no sale a internet).
import { capturasDeSteam, quitarRepetidas } from '../src/services/steam'

const captura = (n: number, t = 1) => ({
  id: n,
  path_thumbnail: `https://cdn/ss_${n}.600x338.jpg?t=${t}`,
  path_full: `https://cdn/ss_${n}.1920x1080.jpg?t=${t}`,
})

describe('servicio de capturas de Steam', () => {
  it('pide las capturas a través de /steam-tienda y respeta la cantidad', async () => {
    const espia = spyOn(window, 'fetch').and.callFake(
      async () =>
        new Response(
          JSON.stringify({ '367520': { success: true, data: { screenshots: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => captura(n)) } } }),
          { status: 200 },
        ),
    )
    const capturas = await capturasDeSteam(367520, 6)
    expect(espia.calls.argsFor(0)[0]).toBe('/steam-tienda/appdetails?appids=367520&filters=screenshots')
    expect(capturas.length).toBe(6)
  })

  it('quita las imágenes repetidas aunque cambie el ?t= del final', () => {
    const lista = [1, 2, 1, 3, 2].map((n, i) => ({
      miniatura: captura(n, i).path_thumbnail,
      completa: captura(n, i).path_full,
    }))
    expect(quitarRepetidas(lista).length).toBe(3)
  })

  it('si Steam no conoce el juego devuelve una lista vacía', async () => {
    spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify({ '1': { success: false } }), { status: 200 }))
    expect(await capturasDeSteam(1)).toEqual([])
  })
})
