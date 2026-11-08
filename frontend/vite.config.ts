import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    },
  },
})
