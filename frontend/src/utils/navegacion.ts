import { esPersonal } from './formato'

// Destino seguro tras iniciar sesión: solo se acepta una ruta interna del propio sitio
// (empieza con "/" y no con "//"), nunca una URL externa que venga en ?next=.
export function destinoSeguro(next: string | null, rol: string) {
  if (next && !next.startsWith('//') && /^\/[a-zA-Z0-9_\-/]*(\?[^#]*)?$/.test(next)) return next
  return esPersonal(rol) ? '/admin' : '/'
}
