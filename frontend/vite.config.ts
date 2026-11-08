import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Lee el archivo .env. El tercer argumento '' carga TODAS las variables, pero solo
  // quedan aquí, en el servidor de Vite: el navegador nunca ve la clave de SteamGridDB
  // (al navegador solo llegan las que empiezan con VITE_, y esta no).
  const env = loadEnv(mode, process.cwd(), '')
  const claveSteamGridDB = env.STEAMGRIDDB_API_KEY ?? ''

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // json-server reescribe db.json en cada POST/PUT/DELETE. Sin esto, Vite lo detecta como
      // un cambio de archivo y RECARGA la página del navegador después de cada guardado.
      watch: { ignored: ['**/db.json'] },
      proxy: {
        // Todo lo que React pida a /api/... Vite lo reenvía a json-server.
        '/api': {
          // 127.0.0.1 y no "localhost": en Windows "localhost" a veces apunta a IPv6.
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          // json-server no conoce el prefijo /api: /api/productos -> /productos
          rewrite: (ruta) => ruta.replace(/^\/api/, ''),
        },
        // API pública de la tienda de Steam (no necesita clave). Se pasa por Vite porque
        // Steam no permite que un navegador la llame directo desde otra página (CORS).
        '/steam-tienda': {
          target: 'https://store.steampowered.com',
          changeOrigin: true,
          rewrite: (ruta) => ruta.replace(/^\/steam-tienda/, '/api'),
        },
        // API externa de imágenes de juegos. Vite agrega la clave "por detrás",
        // como un recepcionista que pone el sello antes de reenviar la carta.
        '/steamgriddb': {
          target: 'https://www.steamgriddb.com',
          changeOrigin: true,
          rewrite: (ruta) => ruta.replace(/^\/steamgriddb/, '/api/v2'),
          headers: claveSteamGridDB ? { Authorization: `Bearer ${claveSteamGridDB}` } : {},
        },
      },
    },
  }
})
