import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Campo from '../Campo'
import { claseControl } from '../../utils/formulario'
import { useFormulario } from '../../hooks/useFormulario'
import { useToast } from '../../hooks/useToast'
import type { Producto } from '../../types'
import {
  validarPrecio,
  validarStock,
  validarTextoOpcional,
  validarTextoRequerido,
  validarUrlImagen,
} from '../../utils/validaciones'

const MAX_IMAGEN_BYTES = 400 * 1024 // 400 KB: la imagen viaja dentro de db.json

const CATEGORIAS = [
  'Acción',
  'Battle Royale',
  'Carreras',
  'Deportes',
  'Multijugador',
  'Mundo Abierto',
  'Plataformas',
  'Rol',
  'Software',
  'Terror',
]
const PLATAFORMAS = ['PC', 'Steam', 'PlayStation', 'Xbox']

interface Props {
  producto: Producto | null // null = producto nuevo
  productos: Producto[] // para comprobar que código y nombre no se repitan
  onGuardar: (datos: Omit<Producto, 'id'>) => Promise<boolean>
  onCancelar: () => void
}

export default function FormularioProducto({ producto, productos, onGuardar, onCancelar }: Props) {
  const { mostrar } = useToast()
  const panel = useRef<HTMLElement>(null)
  const esArchivo = !!producto?.imagen.startsWith('data:image/')

  const [imagenArchivo, setImagenArchivo] = useState(esArchivo ? (producto?.imagen ?? '') : '')
  const [errorArchivo, setErrorArchivo] = useState('')
  const [leyendo, setLeyendo] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const id = producto?.id ?? null
  const otros = productos.filter((p) => p.id !== id)

  const { valores, errores, cambiar, salir, validar } = useFormulario(
    {
      codigo: producto?.codigo ?? '',
      nombre: producto?.nombre ?? '',
      categoria: producto?.categoria ?? '',
      plataforma: producto?.plataforma ?? '',
      // Precio y stock quedan VACÍOS en un producto nuevo: hay que escribirlos a propósito.
      precio: producto ? String(producto.precio) : '',
      stock: producto ? String(producto.stock) : '',
      stockCritico: producto ? String(producto.stockCritico) : '',
      descripcion: producto?.descripcion ?? '',
      activo: producto?.activo ?? true,
      origenImagen: esArchivo ? 'archivo' : 'url',
      imagenUrl: producto && !esArchivo ? producto.imagen : '',
    },
    {
      codigo: (v) => {
        const base = validarTextoRequerido(v, 'El código', undefined, 3)
        if (base) return base
        if (!/^[A-Za-z0-9-]+$/.test(v.trim())) return 'El código solo admite letras, números y guiones.'
        return otros.some((p) => p.codigo.toLowerCase() === v.trim().toLowerCase())
          ? 'Ya existe otro producto con ese código.'
          : null
      },
      nombre: (v) => {
        const base = validarTextoRequerido(v, 'El nombre', 100, 3)
        if (base) return base
        return otros.some((p) => p.nombre.toLowerCase() === v.trim().toLowerCase())
          ? 'Ya existe otro producto con ese nombre.'
          : null
      },
      categoria: (v) => (v ? null : 'Selecciona una categoría.'),
      plataforma: (v) => (v ? null : 'Selecciona una plataforma.'),
      precio: validarPrecio,
      stock: (v) => validarStock(v, 'El stock'),
      stockCritico: (v) => (v.trim() ? validarStock(v, 'El stock crítico') : null),
      descripcion: (v) => validarTextoOpcional(v, 'La descripción', 500),
      imagenUrl: (v, todos) => (todos.origenImagen === 'url' ? validarUrlImagen(v) : null),
    },
  )

  // Al abrir el formulario se hace scroll hasta él y el foco va al primer campo.
  useEffect(() => {
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('prodCodigo')?.focus()
  }, [])

  // Subida de imagen: se lee el archivo con FileReader y se guarda como "data URL"
  // (texto base64). No hay servidor de archivos, por eso el límite de 400 KB.
  function elegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const archivo = input.files?.[0]
    setErrorArchivo('')
    if (!archivo) return

    if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(archivo.type)) {
      setErrorArchivo('El archivo debe ser una imagen PNG, JPG, WEBP o GIF.')
      input.value = ''
      return
    }
    if (archivo.size > MAX_IMAGEN_BYTES) {
      setErrorArchivo(
        `La imagen pesa ${Math.round(archivo.size / 1024)} KB. El máximo es 400 KB; comprímela o usa una URL.`,
      )
      input.value = ''
      return
    }

    setLeyendo(true)
    const lector = new FileReader()
    lector.onload = () => {
      setLeyendo(false)
      setImagenArchivo(String(lector.result))
    }
    lector.onerror = () => {
      setLeyendo(false)
      setErrorArchivo('No pudimos leer el archivo. Intenta con otro.')
    }
    lector.readAsDataURL(archivo)
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setMensaje('')
    if (leyendo) {
      mostrar('Espera a que termine de cargar la imagen.', true)
      return
    }
    if (!validar()) {
      setMensaje('Revisa los campos marcados en rojo.')
      return
    }
    await onGuardar({
      codigo: valores.codigo.trim(),
      nombre: valores.nombre.trim(),
      categoria: valores.categoria,
      plataforma: valores.plataforma,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      stockCritico: Number(valores.stockCritico),
      descripcion: valores.descripcion.trim(),
      imagen: valores.origenImagen === 'url' ? valores.imagenUrl.trim() : imagenArchivo,
      activo: valores.activo,
    })
  }

  const urlValida = valores.imagenUrl.trim() !== '' && !validarUrlImagen(valores.imagenUrl)
  const vista = valores.origenImagen === 'url' ? (urlValida ? valores.imagenUrl.trim() : '') : imagenArchivo

  return (
    <section className="card form-card" ref={panel} aria-labelledby="productFormTitle">
      <h2 id="productFormTitle">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
      <form onSubmit={enviar} noValidate>
        {mensaje && (
          <div className="alert alert-danger" role="alert">
            {mensaje}
          </div>
        )}

        <div className="form-grid">
          <Campo
            etiqueta="Código"
            htmlFor="prodCodigo"
            ayuda="Mínimo 3 caracteres. Solo letras, números y guiones."
            error={errores.codigo}
          >
            <input
              className={claseControl(errores.codigo)}
              id="prodCodigo"
              type="text"
              name="codigo"
              maxLength={30}
              value={valores.codigo}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo etiqueta="Nombre" htmlFor="prodNombre" error={errores.nombre}>
            <input
              className={claseControl(errores.nombre)}
              id="prodNombre"
              type="text"
              name="nombre"
              maxLength={100}
              value={valores.nombre}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo etiqueta="Categoría" htmlFor="prodCategoria" error={errores.categoria}>
            <select
              className={claseControl(errores.categoria, 'form-select')}
              id="prodCategoria"
              name="categoria"
              value={valores.categoria}
              onChange={cambiar}
              onBlur={salir}
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Plataforma de la clave" htmlFor="prodPlataforma" error={errores.plataforma}>
            <select
              className={claseControl(errores.plataforma, 'form-select')}
              id="prodPlataforma"
              name="plataforma"
              value={valores.plataforma}
              onChange={cambiar}
              onBlur={salir}
            >
              <option value="">Selecciona una plataforma</option>
              {PLATAFORMAS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Precio (CLP)" htmlFor="prodPrecio" ayuda="Obligatorio y mayor a cero." error={errores.precio}>
            <input
              className={claseControl(errores.precio)}
              id="prodPrecio"
              type="number"
              name="precio"
              min="0.01"
              step="0.01"
              placeholder="Ej: 19990"
              value={valores.precio}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo etiqueta="Stock" htmlFor="prodStock" error={errores.stock}>
            <input
              className={claseControl(errores.stock)}
              id="prodStock"
              type="number"
              name="stock"
              min="0"
              step="1"
              placeholder="Ej: 25"
              value={valores.stock}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <Campo
            etiqueta="Stock crítico"
            htmlFor="prodStockCritico"
            ayuda="Nivel en que el panel muestra alerta de inventario."
            error={errores.stockCritico}
          >
            <input
              className={claseControl(errores.stockCritico)}
              id="prodStockCritico"
              type="number"
              name="stockCritico"
              min="0"
              step="1"
              placeholder="Ej: 5"
              value={valores.stockCritico}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'end' }}>
            <input type="checkbox" name="activo" checked={valores.activo} onChange={cambiar} /> Producto activo en
            la tienda
          </label>

          <Campo
            etiqueta="Descripción"
            htmlFor="prodDescripcion"
            className="span-2"
            ayuda="Opcional. Máximo 500 caracteres."
            error={errores.descripcion}
          >
            <textarea
              className={claseControl(errores.descripcion)}
              id="prodDescripcion"
              name="descripcion"
              maxLength={500}
              value={valores.descripcion}
              onChange={cambiar}
              onBlur={salir}
            />
          </Campo>

          <fieldset className="field span-2 image-field">
            <legend>Imagen del producto</legend>

            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="origenImagen"
                  value="url"
                  checked={valores.origenImagen === 'url'}
                  onChange={cambiar}
                />{' '}
                Usar una URL de internet
              </label>
              <label>
                <input
                  type="radio"
                  name="origenImagen"
                  value="archivo"
                  checked={valores.origenImagen === 'archivo'}
                  onChange={cambiar}
                />{' '}
                Subir un archivo de mi equipo
              </label>
            </div>

            <div className="image-layout">
              <div className="image-inputs">
                {valores.origenImagen === 'url' ? (
                  <div>
                    <Campo etiqueta="Dirección de la imagen" htmlFor="prodImagenUrl" error={errores.imagenUrl}>
                      <input
                        className={claseControl(errores.imagenUrl)}
                        id="prodImagenUrl"
                        type="url"
                        name="imagenUrl"
                        maxLength={500}
                        placeholder="https://..."
                        value={valores.imagenUrl}
                        onChange={cambiar}
                        onBlur={salir}
                      />
                    </Campo>
                  </div>
                ) : (
                  <div>
                    <Campo
                      etiqueta="Archivo de imagen"
                      htmlFor="prodImagenArchivo"
                      ayuda="PNG, JPG, WEBP o GIF. Máximo 400 KB."
                      error={errorArchivo}
                    >
                      <input
                        className="form-control"
                        id="prodImagenArchivo"
                        type="file"
                        name="imagenArchivo"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={elegirArchivo}
                      />
                    </Campo>
                  </div>
                )}
              </div>

              <div className="image-preview card">
                {vista ? (
                  <img src={vista} alt="Vista previa de la imagen del producto" />
                ) : (
                  <span className="muted">Sin imagen seleccionada</span>
                )}
              </div>
            </div>
          </fieldset>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            Guardar producto
          </button>
          <button className="btn btn-secondary" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}
