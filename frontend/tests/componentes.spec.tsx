// Pruebas de componentes: se dibujan en un navegador real (Karma) y se revisa el resultado.
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Precio from '../src/components/Precio'
import PasosCompra from '../src/components/PasosCompra'
import Campo from '../src/components/Campo'
import ModalConfirmacion from '../src/components/ModalConfirmacion'

afterEach(cleanup)

describe('<Precio /> (props y renderizado condicional)', () => {
  it('sin oferta muestra solo el precio normal', () => {
    const { container } = render(<Precio producto={{ precio: 25990, precioOferta: null }} />)
    expect(container.querySelector('del')).toBeNull()
    expect(container.textContent?.replace(/\s/g, '')).toBe('$25.990')
  })

  it('con oferta tacha el precio original y muestra el rebajado', () => {
    const { container } = render(<Precio producto={{ precio: 39990, precioOferta: 19990 }} />)
    expect(container.querySelector('del')?.textContent?.replace(/\s/g, '')).toBe('$39.990')
    expect(container.querySelector('strong')?.textContent?.replace(/\s/g, '')).toBe('$19.990')
  })

  it('usa la clase recibida por props', () => {
    const { container } = render(<Precio producto={{ precio: 1000 }} className="precio-grande" />)
    expect(container.querySelector('strong')?.className).toBe('precio-grande')
  })
})

describe('<PasosCompra />', () => {
  it('marca el paso actual y los anteriores como hechos', () => {
    render(<PasosCompra actual={2} />)
    const pasos = screen.getAllByRole('listitem')
    expect(pasos.length).toBe(3)
    expect(pasos[0].className).toBe('hecho')
    expect(pasos[1].className).toBe('actual')
    expect(pasos[1].getAttribute('aria-current')).toBe('step')
    expect(pasos[2].className).toBe('')
  })
})

describe('<Campo />', () => {
  it('muestra la ayuda solo si se entrega y siempre muestra el error recibido', () => {
    const { container, rerender } = render(
      <Campo etiqueta="Correo" htmlFor="c">
        <input id="c" />
      </Campo>,
    )
    expect(container.querySelector('.field-hint')).toBeNull()
    rerender(
      <Campo etiqueta="Correo" htmlFor="c" ayuda="Usa tu correo Duoc" error="Correo inválido">
        <input id="c" />
      </Campo>,
    )
    expect(screen.getByText('Usa tu correo Duoc')).toBeTruthy()
    expect(container.querySelector('.field-error')?.textContent).toBe('Correo inválido')
  })
})

describe('<ModalConfirmacion /> (eventos)', () => {
  const base = { titulo: 'Eliminar producto', mensaje: '¿Seguro?', textoConfirmar: 'Eliminar' }

  it('no dibuja nada cuando está cerrado', () => {
    const { container } = render(
      <ModalConfirmacion {...base} abierto={false} onConfirmar={() => {}} onCancelar={() => {}} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('llama a onConfirmar al pulsar el botón principal', () => {
    const onConfirmar = jasmine.createSpy('onConfirmar')
    const onCancelar = jasmine.createSpy('onCancelar')
    render(<ModalConfirmacion {...base} abierto peligroso onConfirmar={onConfirmar} onCancelar={onCancelar} />)
    const boton = screen.getByRole('button', { name: 'Eliminar' })
    expect(boton.className).toContain('btn-danger')
    fireEvent.click(boton)
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onCancelar).not.toHaveBeenCalled()
  })

  it('cancela con el botón Cancelar y con la tecla Escape, y enfoca Cancelar al abrir', () => {
    const onCancelar = jasmine.createSpy('onCancelar')
    render(<ModalConfirmacion {...base} abierto onConfirmar={() => {}} onCancelar={onCancelar} />)
    const cancelar = screen.getByRole('button', { name: 'Cancelar' })
    expect(document.activeElement).toBe(cancelar)
    fireEvent.click(cancelar)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancelar).toHaveBeenCalledTimes(2)
  })
})
