import type { ImgHTMLAttributes } from 'react'
import logo from '../img/logo.png'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string
}

// <img> que muestra el logo si el producto no tiene imagen o la URL falla.
export default function ImagenProducto({ src, alt, ...resto }: Props) {
  return (
    <img
      src={src || logo}
      alt={alt}
      onError={(e) => {
        const img = e.currentTarget
        if (img.dataset.respaldo) return
        img.dataset.respaldo = '1'
        img.src = logo
      }}
      {...resto}
    />
  )
}
