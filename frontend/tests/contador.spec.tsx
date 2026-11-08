// Pruebas del contador de lanzamientos: la cuenta (función pura) y el componente con props.
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ContadorLanzamiento from '../src/components/ContadorLanzamiento'
import { calcularTiempoRestante } from '../src/hooks/useCuentaRegresiva'

afterEach(cleanup)

describe('calcularTiempoRestante', () => {
  it('separa la diferencia en días, horas, minutos y segundos', () => {
    const ahora = new Date('2026-11-08T10:00:00Z')
    // 2 días, 3 horas, 4 minutos y 5 segundos después
    const r = calcularTiempoRestante('2026-11-10T13:04:05Z', ahora)
    expect(r).toEqual({ dias: 2, horas: 3, minutos: 4, segundos: 5, terminado: false })
  })

  it('marca terminado cuando la fecha ya pasó o no es válida', () => {
    const ahora = new Date('2026-11-08T10:00:00Z')
    expect(calcularTiempoRestante('2026-01-01T00:00:00Z', ahora).terminado).toBeTrue()
    expect(calcularTiempoRestante('no-es-fecha', ahora).terminado).toBeTrue()
  })
})

describe('<ContadorLanzamiento /> (props y renderizado condicional)', () => {
  function dibujar(fecha: string) {
    render(
      <MemoryRouter>
        <ContadorLanzamiento nombre="Juego X" fechaLanzamiento={fecha} imagen="" enlace="/proximamente/x" />
      </MemoryRouter>,
    )
  }

  it('muestra el nombre recibido, las 4 cajas del reloj y el botón', () => {
    dibujar('2999-01-01T00:00:00Z')
    expect(screen.getByRole('heading', { name: 'Juego X' })).toBeTruthy()
    expect(screen.getByRole('timer').children.length).toBe(4)
    expect(screen.getByRole('link', { name: 'Ver detalles' }).getAttribute('href')).toBe('/proximamente/x')
  })

  it('si la fecha ya pasó, oculta el reloj y avisa que ya salió', () => {
    dibujar('2000-01-01T00:00:00Z')
    expect(screen.queryByRole('timer')).toBeNull()
    expect(screen.getByText('Ya disponible')).toBeTruthy()
  })
})
