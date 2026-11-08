import { useEffect, useState } from 'react'

interface Resultado<T> {
  fuente: unknown
  version: number
  datos?: T
  error?: string
}

// Ejecuta una función asíncrona (normalmente un servicio de src/services) al montar el
// componente y entrega { datos, cargando, error, recargar }.
// IMPORTANTE: "cargador" debe ser estable (una función de módulo o un useCallback),
// si cambia en cada render el hook volvería a pedir los datos sin parar.
export function useCarga<T>(cargador: () => Promise<T>) {
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)

  useEffect(() => {
    let activo = true
    cargador()
      .then((datos) => {
        if (activo) setResultado({ fuente: cargador, version, datos })
      })
      .catch((e: unknown) => {
        if (activo)
          setResultado({ fuente: cargador, version, error: e instanceof Error ? e.message : 'Error' })
      })
    return () => {
      activo = false
    }
  }, [cargador, version])

  const mismaFuente = resultado !== null && resultado.fuente === cargador
  const vigente = mismaFuente && resultado.version === version

  return {
    datos: mismaFuente ? resultado.datos : undefined,
    error: vigente ? resultado.error : undefined,
    cargando: !vigente,
    recargar: () => setVersion((v) => v + 1),
  }
}
