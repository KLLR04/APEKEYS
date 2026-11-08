// Pruebas de funciones puras: no dibujan nada, solo entran datos y salen resultados.
import { validarCorreo, validarPassword, validarRun, validarTextoRequerido } from '../src/utils/validaciones'
import { enOferta, formatearCLP, porcentajeDescuento, precioFinal } from '../src/utils/formato'
import { claseControl } from '../src/utils/formulario'

describe('validaciones', () => {
  it('acepta un RUN con dígito verificador correcto', () => {
    expect(validarRun('190110222')).toBeNull()
    expect(validarRun('19.011.022-2')).toBeNull()
  })

  it('rechaza RUN vacío, corto o con dígito incorrecto', () => {
    expect(validarRun('')).toContain('obligatorio')
    expect(validarRun('123')).toContain('entre 7 y 9')
    expect(validarRun('190110221')).toContain('no es válido')
  })

  it('solo acepta correos duoc.cl, profesor.duoc.cl y gmail.com', () => {
    expect(validarCorreo('ana@duoc.cl')).toBeNull()
    expect(validarCorreo('profe@profesor.duoc.cl')).toBeNull()
    expect(validarCorreo('ana@gmail.com')).toBeNull()
    expect(validarCorreo('ana@hotmail.com')).not.toBeNull()
    expect(validarCorreo('')).toContain('obligatorio')
  })

  it('exige contraseña de 4 a 10 caracteres', () => {
    expect(validarPassword('abc')).not.toBeNull()
    expect(validarPassword('abcd')).toBeNull()
    expect(validarPassword('abcdefghijk')).not.toBeNull()
  })

  it('valida texto requerido con mínimo y máximo', () => {
    expect(validarTextoRequerido('  ', 'El nombre')).toBe('El nombre es obligatorio.')
    expect(validarTextoRequerido('A', 'El nombre', 10, 2)).toContain('al menos 2')
    expect(validarTextoRequerido('Hola mundo!', 'El nombre', 5)).toContain('máximo de 5')
  })
})

describe('formato y ofertas', () => {
  it('formatea pesos chilenos', () => {
    expect(formatearCLP(19990).replace(/\s/g, '')).toBe('$19.990')
  })

  it('detecta ofertas y calcula precio final y descuento', () => {
    const oferta = { precio: 39990, precioOferta: 19990 }
    expect(enOferta(oferta)).toBeTrue()
    expect(precioFinal(oferta)).toBe(19990)
    expect(porcentajeDescuento(oferta)).toBe(50)
  })

  it('sin oferta (o con oferta mayor al precio) usa el precio normal', () => {
    expect(enOferta({ precio: 10000, precioOferta: null })).toBeFalse()
    expect(precioFinal({ precio: 10000 })).toBe(10000)
    expect(enOferta({ precio: 10000, precioOferta: 12000 })).toBeFalse()
  })

  it('claseControl agrega is-invalid solo cuando hay error', () => {
    expect(claseControl()).toBe('form-control')
    expect(claseControl('Error', 'form-select')).toBe('form-select is-invalid')
  })
})
