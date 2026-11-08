// Pruebas de renderizado de listas y renderizado condicional sobre la página Catálogo.
// La API se simula con un "fetch" falso, así no hace falta levantar json-server.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Catalogo from '../src/pages/Catalogo'
import { AuthContext } from '../src/context/AuthContext'
import type { AuthValor } from '../src/context/AuthContext'
import { CartContext } from '../src/context/CartContext'
import type { CartValor } from '../src/context/CartContext'
import type { Producto } from '../src/types'

afterEach(cleanup)

function crear(id: number, nombre: string, extra: Partial<Producto> = {}): Producto {
  return {
    id, codigo: `G-00${id}`, nombre, categoria: 'Acción', plataforma: 'Steam',
    precio: 10000, stock: 5, stockCritico: 1, descripcion: '', imagen: '', activo: true, ...extra,
  }
}

const datos: Producto[] = [
  crear(1, 'Alfa'),
  crear(2, 'Beta', { precioOferta: 5000 }),
  crear(3, 'Gamma', { categoria: 'Aventura' }),
  crear(4, 'Oculto', { activo: false }),
]

function dibujarCatalogo(props: { soloOfertas?: boolean } = {}) {
  const auth = { usuario: null, cargando: false, sesionCerrada: false } as AuthValor
  const carrito = { items: [], totalUnidades: 0, agregar: () => {} } as unknown as CartValor
  render(
    <MemoryRouter initialEntries={['/catalogo']}>
      <AuthContext.Provider value={auth}>
        <CartContext.Provider value={carrito}>
          <Catalogo {...props} />
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('<Catalogo /> (renderizado de listas)', () => {
  it('dibuja una tarjeta por cada producto activo del conjunto de datos', async () => {
    spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify(datos), { status: 200 }))
    dibujarCatalogo()
    await screen.findByText('3 productos encontrados')
    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos).toEqual(['Alfa', 'Beta', 'Gamma'])
    expect(screen.queryByText('Oculto')).toBeNull()
  })

  it('la vista de ofertas solo lista los productos con precio rebajado', async () => {
    spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify(datos), { status: 200 }))
    dibujarCatalogo({ soloOfertas: true })
    await screen.findByText('1 producto encontrado')
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(screen.queryByText('Alfa')).toBeNull()
  })

  it('el buscador filtra la lista mientras el usuario escribe', async () => {
    spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify(datos), { status: 200 }))
    dibujarCatalogo()
    await screen.findByText('3 productos encontrados')
    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'gam' } })
    expect(screen.getByText('1 producto encontrado')).toBeTruthy()
    expect(screen.getByText('Gamma')).toBeTruthy()
  })
})

describe('<Catalogo /> (renderizado condicional del error)', () => {
  it('no muestra mensaje de error cuando la API responde bien', async () => {
    spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify(datos), { status: 200 }))
    dibujarCatalogo()
    await screen.findByText('3 productos encontrados')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('muestra el mensaje de error solo cuando la API falla', async () => {
    spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))
    dibujarCatalogo()
    const alerta = await screen.findByRole('alert')
    expect(alerta.textContent).toMatch(/npm run api/)
    await waitFor(() => expect(screen.queryByText(/productos encontrados/)).toBeNull())
  })
})
