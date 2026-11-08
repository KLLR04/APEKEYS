// Próximos lanzamientos que muestra la tienda (contador del inicio y página /proximamente/:juego).
// Para agregar otro juego con contador basta con sumar un objeto a esta lista.
import gta6Portada from '../img/Lanzamientos/gta6-portada.webp'
import zeldaPortada from '../img/Lanzamientos/zelda-ocarina.webp'

export interface Lanzamiento {
  clave: string // va en la URL: /proximamente/<clave>
  nombre: string
  descripcion: string
  imagen: string
  // Fecha y hora de salida en formato ISO con zona horaria (así el contador es exacto).
  fechaLanzamiento: string
}

export const LANZAMIENTOS: Lanzamiento[] = [
  {
    clave: 'gta6',
    nombre: 'Grand Theft Auto VI',
    descripcion: 'Una nueva aventura de mundo abierto ambientada en Vice City y el estado de Leonida.',
    imagen: gta6Portada,
    fechaLanzamiento: '2026-11-19T00:00:00-03:00',
  },
  {
    clave: 'ocarina',
    nombre: 'The Legend of Zelda: Ocarina of Time',
    descripcion: 'El clásico de Nintendo 64, rehecho por completo para Nintendo Switch 2.',
    imagen: zeldaPortada,
    fechaLanzamiento: '2026-11-05T00:00:00-03:00',
  },
  {
    clave: 'fc27',
    nombre: 'EA Sports FC 27',
    descripcion: 'La próxima entrega de la serie de fútbol de EA Sports.',
    imagen:
      'https://drop-assets.ea.com/images/15VqAXZo2fThrwnnfx5cX7/5e8f03989e7dd09e7a150cb0ce784bec/fc-27-ultimate-plus-key-art-16x9.jpg?im=AspectCrop=(16,9),xPosition=0.4354166666666667,yPosition=0.4356481481481482',
    fechaLanzamiento: '2026-09-25T00:00:00-03:00',
  },
]

export function buscarLanzamiento(clave: string | undefined): Lanzamiento | undefined {
  return LANZAMIENTOS.find((l) => l.clave === clave)
}
