// Pruebas de estado y eventos: componentes que cambian al interactuar con ellos.
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import TarjetaProducto from '../src/components/TarjetaProducto'
import Campo from '../src/components/Campo'
import { AuthContext } from '../src/context/AuthContext'
import type { AuthValor } from '../src/context/AuthContext'
import { CartContext } from '../src/context/CartContext'
import type { CartValor } from '../src/context/CartContext'
import { useFormulario } from '../src/hooks/useFormulario'
import { listarProductos } from '../src/services/productos'
import { claseControl } from '../src/utils/formulario'
import { validarCorreo } from '../src/utils/validaciones'
import type { Producto, Sesion } from '../src/types'

afterEach(cleanup)

const producto: Producto = {
  id: 1, codigo: 'G-001', nombre: 'Juego de prueba', categoria: 'Acción', plataforma: 'Steam',
  precio: 39990, precioOferta: 19990, stock: 5, stockCritico: 2, descripcion: '', imagen: '', activo: true,
}

// Envuelve la tarjeta con sesión y carrito "falsos" para controlar lo que ve.
function dibujarTarjeta(p: Producto, usuario: Sesion | null, agregar = jasmine.createSpy('agregar')) {
  const auth = { usuario, cargando: false, sesionCerrada: false } as AuthValor
  const carrito = { items: [], totalUnidades: 0, agregar } as unknown as CartValor
  render(
    <MemoryRouter initialEntries={['/catalogo']}>
      <AuthContext.Provider value={auth}>
        <CartContext.Provider value={carrito}>
          <Routes>
            <Route path="/catalogo" element={<TarjetaProducto producto={p} />} />
            <Route path="/login" element={<h1>Página de login</h1>} />
          </Routes>
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
  return agregar
}

describe('<TarjetaProducto />', () => {
  const cliente: Sesion = { id: 7, nombre: 'Ana', apellidos: 'Pérez', email: 'ana@duoc.cl', rol: 'cliente' }

  it('muestra nombre, descuento y enlace a la ficha', () => {
    dibujarTarjeta(producto, cliente)
    expect(screen.getByText('Juego de prueba')).toBeTruthy()
    expect(screen.getByText('-50%')).toBeTruthy()
    expect(screen.getByLabelText('Ver detalle de Juego de prueba').getAttribute('href')).toBe('/ficha/1')
  })

  it('con sesión, el botón Agregar suma 1 unidad al carrito', () => {
    const agregar = dibujarTarjeta(producto, cliente)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))
    expect(agregar).toHaveBeenCalledOnceWith(producto, 1)
  })

  it('sin sesión, Agregar lleva al login', () => {
    const agregar = dibujarTarjeta(producto, null)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))
    expect(agregar).not.toHaveBeenCalled()
    expect(screen.getByText('Página de login')).toBeTruthy()
  })

  it('sin stock muestra "Agotado" y desactiva el botón', () => {
    dibujarTarjeta({ ...producto, stock: 0 }, cliente)
    const boton = screen.getByRole('button', { name: 'Agotado' }) as HTMLButtonElement
    expect(boton.disabled).toBeTrue()
  })
})

// Formulario mínimo que usa el mismo hook que Login, Registro y Checkout.
function FormCorreo({ onEnviar }: { onEnviar: (email: string) => void }) {
  const { valores, errores, cambiar, salir, validar } = useFormulario({ email: '' }, { email: validarCorreo })
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (validar()) onEnviar(String(valores.email))
      }}
    >
      <Campo etiqueta="Correo" htmlFor="email" error={errores.email}>
        <input id="email" name="email" className={claseControl(errores.email)}
          value={String(valores.email)} onChange={cambiar} onBlur={salir} />
      </Campo>
      <button type="submit">Enviar</button>
    </form>
  )
}

describe('useFormulario (estado del formulario)', () => {
  it('muestra el error al salir del campo y lo quita al corregir', () => {
    render(<FormCorreo onEnviar={() => {}} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ana@hotmail.com' } })
    fireEvent.blur(input)
    expect(input.className).toContain('is-invalid')
    expect(screen.getByText(/Usa un correo/)).toBeTruthy()

    fireEvent.change(input, { target: { value: 'ana@duoc.cl' } })
    expect(input.className).not.toContain('is-invalid')
  })

  it('no envía si hay errores y sí envía cuando todo es válido', () => {
    const onEnviar = jasmine.createSpy('onEnviar')
    render(<FormCorreo onEnviar={onEnviar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onEnviar).not.toHaveBeenCalled()
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ana@gmail.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onEnviar).toHaveBeenCalledOnceWith('ana@gmail.com')
  })
})

describe('servicios de la API (fetch simulado)', () => {
  it('listarProductos pide /api/productos y devuelve el JSON', async () => {
    const espia = spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify([producto]), { status: 200 }))
    const lista = await listarProductos()
    expect(espia.calls.mostRecent().args[0]).toBe('/api/productos')
    expect(lista[0].nombre).toBe('Juego de prueba')
  })

  it('traduce un error de conexión a un mensaje claro', async () => {
    spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))
    await expectAsync(listarProductos()).toBeRejectedWithError(/npm run api/)
  })
})
