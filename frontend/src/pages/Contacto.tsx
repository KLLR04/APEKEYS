import { useState } from 'react'
import type { FormEvent } from 'react'
import Campo from '../components/Campo'
import { claseControl } from '../utils/formulario'
import { useAuth } from '../hooks/useAuth'
import { useFormulario } from '../hooks/useFormulario'
import { useTitulo } from '../hooks/useTitulo'
import { useToast } from '../hooks/useToast'
import { crearMensaje } from '../services/mensajes'
import type { Sesion } from '../types'
import { validarCorreo, validarTextoRequerido } from '../utils/validaciones'

export default function Contacto() {
  useTitulo('Contacto | APEKEYS')
  const { usuario, cargando } = useAuth()

  return (
    <div className="contenedor">
      <div className="section-head">
        <div>
          <span className="eyebrow">Estamos para ayudarte</span>
          <h1>Contacto</h1>
          <p>Formulario de contacto de la demostración.</p>
        </div>
      </div>

      <div className="contacto-layout">
        <section className="card form-card">
          <h2>Formulario de contacto</h2>
          {/* key: cuando termina de cargar la sesión se vuelve a crear el formulario ya prellenado */}
          <FormularioContacto key={cargando ? 'cargando' : (usuario?.id ?? 'visita')} usuario={usuario} />
        </section>

        <aside className="card card-body">
          <h2>Acerca del formulario</h2>
          <p>Los mensajes se guardan en este navegador para la demostración del proyecto.</p>
        </aside>
      </div>
    </div>
  )
}

function FormularioContacto({ usuario }: { usuario: Sesion | null }) {
  const { mostrar } = useToast()
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null)

  // Si hay sesión iniciada, se precargan nombre y correo.
  const inicial = {
    nombre: usuario ? `${usuario.nombre} ${usuario.apellidos}`.trim() : '',
    email: usuario?.email ?? '',
    comentario: '',
  }

  const { valores, errores, cambiar, salir, validar, reiniciar } = useFormulario(inicial, {
    nombre: (v) => validarTextoRequerido(v, 'El nombre', 100, 3),
    email: (v) => (v.trim() ? validarCorreo(v) : null),
    comentario: (v) => validarTextoRequerido(v, 'El comentario', 500),
  })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setMensaje(null)
    if (!validar()) {
      setMensaje({ texto: 'Revisa los campos marcados en rojo.', ok: false })
      return
    }
    try {
      await crearMensaje({
        nombre: valores.nombre.trim(),
        email: valores.email.trim().toLowerCase(),
        comentario: valores.comentario.trim(),
        fecha: new Date().toISOString(),
      })
      setMensaje({ texto: 'Mensaje guardado en esta demostración.', ok: true })
      reiniciar({ nombre: '', email: '', comentario: '' })
      mostrar('Mensaje guardado')
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : 'No se pudo guardar el mensaje.', ok: false })
    }
  }

  const usados = valores.comentario.length

  return (
    <form onSubmit={enviar} noValidate>
      {mensaje && (
        <div className={`alert ${mensaje.ok ? 'alert-success' : 'alert-danger'}`} role="alert">
          {mensaje.texto}
        </div>
      )}

      <Campo etiqueta="Nombre completo" htmlFor="contNombre" error={errores.nombre}>
        <input
          className={claseControl(errores.nombre)}
          id="contNombre"
          type="text"
          name="nombre"
          maxLength={100}
          autoComplete="name"
          value={valores.nombre}
          onChange={cambiar}
          onBlur={salir}
        />
      </Campo>

      <Campo etiqueta="Correo electrónico" htmlFor="contEmail" error={errores.email}>
        <input
          className={claseControl(errores.email)}
          id="contEmail"
          type="email"
          name="email"
          maxLength={100}
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={valores.email}
          onChange={cambiar}
          onBlur={salir}
        />
      </Campo>

      <Campo
        etiqueta="Comentario"
        htmlFor="contComentario"
        ayuda={<span className={usados > 450 ? 'contador-alto' : ''}>{usados} / 500 caracteres</span>}
        error={errores.comentario}
      >
        <textarea
          className={claseControl(errores.comentario)}
          id="contComentario"
          name="comentario"
          maxLength={500}
          value={valores.comentario}
          onChange={cambiar}
          onBlur={salir}
        />
      </Campo>

      <button className="btn btn-primary" type="submit">
        Enviar mensaje
      </button>
    </form>
  )
}
