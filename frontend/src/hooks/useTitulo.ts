import { useEffect } from 'react'

// Cambia el título de la pestaña del navegador (en el HTML original era <title>).
export function useTitulo(titulo: string) {
  useEffect(() => {
    document.title = titulo
  }, [titulo])
}
