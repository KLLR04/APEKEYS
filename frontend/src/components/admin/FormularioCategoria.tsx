import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Campo from '../Campo'
import { claseControl } from '../../utils/formulario'
import { useFormulario } from '../../hooks/useFormulario'
import { SIN_CATEGORIA } from '../../services/categorias'
import { validarTextoRequerido } from '../../utils/validaciones'
import type { Categoria } from '../../types'

// "Acción" y "accion " deben contar como el mismo nombre.
const clave = (texto: string) =>
  texto
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

interface Props {
  categoria: Categoria | null // null = categoría nueva
  categorias: Categoria[] // para comprobar que el nombre no se repita
  onGuardar: (datos: Omit<Categoria, 'id'>) => Promise<boolean>
  onCancelar: () => void
}

export default function FormularioCategoria({ categoria, categorias, onGuardar, onCancelar }: Props) {
  const panel = useRef<HTMLElement>(null)
  const [mensaje, setMensaje] = useState('')
  const editando = categoria !== null
  const otras = categorias.filter((c) => c.id !== categoria?.id)

  const { valores, errores, cambiar, salir, validar } = useFormulario(
    { nombre: categoria?.nombre ?? '' },
    {
      nombre: (v) => {
        const base = validarTextoRequerido(v, 'El nombre', 40, 2)
        if (base) return base
        if (clave(v) === clave(SIN_CATEGORIA)) return `"${SIN_CATEGORIA}" es un nombre reservado por el sistema.`
        return otras.some((c) => clave(c.nombre) === clave(v)) ? 'Ya existe una categoría con ese nombre.' : null
      },
    },
  )

  useEffect(() => {
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('catNombre')?.focus()
  }, [])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (!validar()) {
      setMensaje('Revisa los campos marcados en rojo.')
      return
    }
    await onGuardar({ nombre: valores.nombre.trim() })
  }

  return (
    <section className="card form-card mb-4" ref={panel} aria-labelledby="catFormTitle">
      <h2 id="catFormTitle">{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
      <form onSubmit={enviar} noValidate>
        {mensaje && (
          <div className="alert alert-danger" role="alert">
            {mensaje}
          </div>
        )}

        <div className="form-grid">
          <Campo
            etiqueta="Nombre"
            htmlFor="catNombre"
            ayuda={editando ? 'Si lo cambias, los productos de esta categoría se actualizan solos.' : undefined}
            error={errores.nombre}
          >
            <input
              className={claseControl(errores.nombre)}
              id="catNombre"
              type="text"
              name="nombre"
              maxLength={40}
              placeholder="Ej: Estrategia"
              value={valores.nombre}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            Guardar categoría
          </button>
          <button className="btn btn-secondary" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}
