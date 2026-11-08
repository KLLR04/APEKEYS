import { useEffect, useState } from 'react'

export interface TiempoRestante {
  dias: number
  horas: number
  minutos: number
  segundos: number
  terminado: boolean // true cuando la fecha ya llegó
}

// Función pura (sin React): calcula cuánto falta entre "ahora" y la fecha objetivo.
// Al ser pura se puede probar fácilmente pasándole cualquier "ahora".
export function calcularTiempoRestante(fechaObjetivo: string | Date, ahora: Date = new Date()): TiempoRestante {
  const diferencia = new Date(fechaObjetivo).getTime() - ahora.getTime()
  if (Number.isNaN(diferencia) || diferencia <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: true }
  }
  const totalSegundos = Math.floor(diferencia / 1000)
  return {
    dias: Math.floor(totalSegundos / 86400),
    horas: Math.floor((totalSegundos % 86400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
    terminado: false,
  }
}

// Hook: devuelve el tiempo restante y lo vuelve a calcular cada segundo.
// Como un reloj de pared: un intervalo "hace tic" y React vuelve a dibujar los números.
export function useCuentaRegresiva(fechaObjetivo: string | Date): TiempoRestante {
  const [restante, setRestante] = useState(() => calcularTiempoRestante(fechaObjetivo))

  useEffect(() => {
    // Cada segundo se recalcula con la hora actual.
    const id = window.setInterval(() => setRestante(calcularTiempoRestante(fechaObjetivo)), 1000)
    // Limpieza: al salir de la página se detiene el reloj (si no, seguiría corriendo).
    return () => window.clearInterval(id)
  }, [fechaObjetivo])

  return restante
}
