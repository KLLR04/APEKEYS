import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import type { ResultadoAuth } from './AuthContext'
import type { Sesion, Usuario } from '../types'
import {
  buscarUsuarioPorEmail,
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
} from '../services/usuarios'
import { normalizarRun } from '../utils/validaciones'

const CLAVE = 'apekeys_sesion'

// sessionStorage: la sesión dura mientras la pestaña esté abierta (igual que en el original).
function leerIdGuardado(): number | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    return crudo ? Number(crudo) : null
  } catch {
    return null
  }
}

function guardarId(id: number | null) {
  try {
    if (id === null) sessionStorage.removeItem(CLAVE)
    else sessionStorage.setItem(CLAVE, String(id))
  } catch {
    /* si el navegador bloquea el almacenamiento, simplemente no se recuerda la sesión */
  }
}

const aSesion = (u: Usuario): Sesion => ({
  id: u.id,
  nombre: u.nombre,
  apellidos: u.apellidos,
  email: u.email,
  rol: u.rol,
})

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Sesion | null>(null)
  const [cargando, setCargando] = useState(() => leerIdGuardado() !== null)
  const [sesionCerrada, setSesionCerrada] = useState(false)

  // Al abrir la app: si hay un id guardado, se confirma con la API que el usuario
  // existe y sigue activo (así el rol siempre es el real, no el que quedó guardado).
  useEffect(() => {
    const id = leerIdGuardado()
    if (id === null) return
    let activo = true
    obtenerUsuario(id)
      .then((u) => {
        if (!activo) return
        if (u.activo) setUsuario(aSesion(u))
        else guardarId(null)
      })
      .catch(() => {
        /* sin API o usuario borrado: queda como visitante */
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  const valor = useMemo(() => {
    async function iniciarSesion(email: string, password: string): Promise<ResultadoAuth> {
      try {
        const [encontrado] = await buscarUsuarioPorEmail(email.trim().toLowerCase())
        // Mensaje genérico a propósito: no revelamos si el correo existe.
        if (!encontrado || encontrado.password !== password)
          return { ok: false, mensaje: 'Correo o contraseña incorrectos.' }
        if (!encontrado.activo)
          return { ok: false, mensaje: 'Esta cuenta está desactivada. Contacta al administrador.' }
        const sesion = aSesion(encontrado)
        guardarId(sesion.id)
        setUsuario(sesion)
        setSesionCerrada(false)
        return { ok: true, sesion }
      } catch (e) {
        return { ok: false, mensaje: e instanceof Error ? e.message : 'Error de conexión.' }
      }
    }

    async function registrar(datos: Omit<Usuario, 'id'>): Promise<ResultadoAuth> {
      try {
        const existentes = await listarUsuarios()
        if (existentes.some((u) => normalizarRun(u.run) === normalizarRun(datos.run)))
          return { ok: false, campo: 'run', mensaje: 'Ya existe una cuenta registrada con ese RUN.' }
        if (existentes.some((u) => u.email.toLowerCase() === datos.email.toLowerCase()))
          return { ok: false, campo: 'email', mensaje: 'Ya existe una cuenta con ese correo.' }
        const creado = await crearUsuario(datos)
        const sesion = aSesion(creado)
        guardarId(sesion.id)
        setUsuario(sesion)
        setSesionCerrada(false)
        return { ok: true, sesion }
      } catch (e) {
        return { ok: false, mensaje: e instanceof Error ? e.message : 'Error de conexión.' }
      }
    }

    function cerrarSesion() {
      guardarId(null)
      setUsuario(null)
      setSesionCerrada(true)
    }

    return { usuario, cargando, sesionCerrada, iniciarSesion, registrar, cerrarSesion }
  }, [usuario, cargando, sesionCerrada])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
