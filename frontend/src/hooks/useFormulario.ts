import { useState } from 'react'
import type { ChangeEvent, FocusEvent } from 'react'

type Valores = Record<string, string | boolean>

// Una regla recibe el valor del campo (siempre como texto) y todos los valores del
// formulario (por si depende de otro campo) y devuelve el mensaje de error o null.
export type Reglas<T> = { [K in keyof T]?: (valor: string, valores: T) => string | null }
type Errores<T> = Partial<Record<keyof T, string>>

type CampoForm = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

// Equivalente en React de APEKEYS_VALIDA.enlazar + validarFormulario del proyecto original:
//  - valida un campo al salir de él (blur);
//  - si el campo ya tenía error, lo vuelve a validar en cada tecla;
//  - validar() revisa todo al enviar y deja el foco en el primer campo con error.
export function useFormulario<T extends Valores>(inicial: T, reglas: Reglas<T>) {
  const [valores, setValores] = useState<T>(inicial)
  const [errores, setErrores] = useState<Errores<T>>({})

  function revisar(campo: keyof T, todos: T) {
    const regla = reglas[campo]
    const mensaje = regla ? regla(String(todos[campo]), todos) : null
    setErrores((previos) => ({ ...previos, [campo]: mensaje ?? undefined }))
    return mensaje
  }

  // Se usa la forma "prev => ..." porque varias llamadas seguidas (por ejemplo, al cambiar la
  // región se cambia el campo y además se vacía la comuna) deben acumularse, no pisarse.
  function ponerValor(campo: keyof T, valor: string | boolean) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) revisar(campo, { ...valores, [campo]: valor })
  }

  function cambiar(e: ChangeEvent<CampoForm>) {
    const { name, type } = e.target
    const valor = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    ponerValor(name as keyof T, valor)
  }

  function salir(e: FocusEvent<CampoForm>) {
    revisar(e.target.name as keyof T, valores)
  }

  function validar() {
    const nuevos: Errores<T> = {}
    let primero: string | null = null
    for (const campo of Object.keys(reglas) as (keyof T)[]) {
      const mensaje = reglas[campo]?.(String(valores[campo]), valores) ?? null
      if (mensaje) {
        nuevos[campo] = mensaje
        if (!primero) primero = String(campo)
      }
    }
    setErrores(nuevos)
    if (primero) document.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus()
    return !primero
  }

  function ponerError(campo: keyof T, mensaje: string) {
    setErrores((previos) => ({ ...previos, [campo]: mensaje }))
    document.querySelector<HTMLElement>(`[name="${String(campo)}"]`)?.focus()
  }

  function reiniciar(nuevos: T) {
    setValores(nuevos)
    setErrores({})
  }

  return { valores, errores, cambiar, salir, ponerValor, validar, ponerError, reiniciar }
}
