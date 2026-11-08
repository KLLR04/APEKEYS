# APEKEYS · Entrega 2 (React)

Tienda online de claves de videojuegos. Proyecto de **DSY1104 Full Stack 2** (Duoc UC).
Equipo: FR4004, Jonás y Bayron.

Migración del sitio HTML/CSS/JS de la Entrega 1 a **React 19 + TypeScript + Vite**,
con **Bootstrap 5.3** para el diseño responsivo y una API REST simulada con **json-server**.

## Requisitos

- Node.js 20 o superior (incluye npm)
- Google Chrome o Microsoft Edge (para las pruebas con Karma)

## Cómo ejecutarlo

```bash
npm install
```

La app necesita **dos terminales** abiertas al mismo tiempo:

```bash
npm run api
```

```bash
npm run dev
```

- `npm run api` levanta json-server en `http://127.0.0.1:3000` con los datos de `db.json`
  (productos, usuarios, órdenes, regiones, noticias).
- `npm run dev` levanta la app en `http://localhost:5173`. Vite reenvía `/api/...` a json-server.

### Cuentas de demostración

Los usuarios están en `db.json`: hay uno de cada rol (administrador, vendedor y cliente).
Las credenciales de prueba aparecen en ese archivo.

### Probar la API con Postman

Con `npm run api` corriendo, json-server responde en `http://localhost:3000`. Cada cambio
hecho desde Postman se guarda en `db.json` y se ve en la página al recargar (F5).

| Acción | Método | URL | Body (raw → JSON) |
|---|---|---|---|
| Listar productos | `GET` | `/productos` | — |
| Ver un producto | `GET` | `/productos/1` | — |
| Crear producto | `POST` | `/productos` | producto completo (sin `id`, lo asigna json-server) |
| Poner en oferta | `PATCH` | `/productos/1` | `{ "precioOferta": 19990 }` |
| Quitar la oferta | `PATCH` | `/productos/1` | `{ "precioOferta": null }` |
| Cambiar el stock | `PATCH` | `/productos/1` | `{ "stock": 50 }` |
| Eliminar producto | `DELETE` | `/productos/1` | — |

- **PATCH** cambia solo los campos enviados. **PUT** reemplaza el producto entero: si se envía
  solo un campo, el resto se pierde.
- Una oferta es válida si `precioOferta` es mayor que 0 y menor que `precio`. La tienda calcula
  el porcentaje de descuento y muestra el juego en **Ofertas**.
- Ids de productos: 1 Red Dead Redemption 2, 2 Metal Gear Solid Delta, 3 Helldivers 2,
  4 Hollow Knight, 5 Resident Evil 4 Remake, 6 Zelda: Ocarina of Time.
- Otras colecciones: `/usuarios`, `/ordenes`, `/mensajes`, `/blogs`, `/regiones`.

### API externa: galería de gameplay (Steam)

La ficha de cada juego muestra una **galería de capturas de gameplay** sacadas de la API pública
de la tienda de Steam (`services/steam.ts`). No necesita clave: Vite reenvía `/steam-tienda/...`
a `store.steampowered.com/api/...` para evitar el bloqueo CORS. Cada producto indica su
`steamAppId` en `db.json`; las imágenes repetidas se descartan. Los juegos que no están en Steam
(como Zelda) usan sus capturas propias del campo `galeria`. Sin internet, la galería muestra solo
las capturas propias (o no aparece) y el resto de la tienda funciona igual.

### API externa: SteamGridDB (opcional, no usada por la galería)

El servicio `services/steamgriddb.ts` queda disponible para pedir arte de juegos a
[SteamGridDB](https://www.steamgriddb.com). Para activarlo:

1. Crea una clave gratis en <https://www.steamgriddb.com/profile/preferences/api>.
2. Copia `.env.example` como `.env` y pega la clave después de `STEAMGRIDDB_API_KEY=`.
3. Reinicia `npm run dev`.

La clave la agrega el servidor de Vite (ver `vite.config.ts`), nunca llega al navegador, y `.env`
no se sube a GitHub. Ambas APIs externas funcionan con `npm run dev` (usan el proxy de Vite).

## Pruebas unitarias (Jasmine + Karma)

```bash
npm test
```

- Ejecuta las pruebas una vez en un navegador sin ventana (Chrome o, si no existe, Edge).
- El informe de cobertura queda en `coverage/html/index.html`.
- `npm run test:watch` deja Karma abierto y vuelve a ejecutar al guardar.

Las pruebas están en `tests/` y cubren:

| Archivo | Qué prueba |
| --- | --- |
| `utils.spec.tsx` | Validaciones (RUN, correo, contraseña, textos) y cálculo de ofertas |
| `componentes.spec.tsx` | Renderizado, props y renderizado condicional: `Precio`, `PasosCompra`, `Campo`, `ModalConfirmacion` (eventos y tecla Escape) |
| `interaccion.spec.tsx` | Estado y eventos: `TarjetaProducto` con y sin sesión, formulario con `useFormulario`, servicios con `fetch` simulado (`spyOn`) |
| `catalogo.spec.tsx` | Renderizado de listas: el Catálogo dibuja una tarjeta por producto activo, la vista Ofertas y el buscador filtran; el mensaje de error aparece solo cuando la API falla |
| `contador.spec.tsx` | Contador de lanzamientos: cálculo de días/horas/minutos/segundos y el componente `ContadorLanzamiento` con y sin fecha cumplida |
| `steamgriddb.spec.tsx` | Servicio de la API externa SteamGridDB con `fetch` simulado: rutas que llama, juego no encontrado y clave rechazada |
| `steam.spec.tsx` | Servicio de capturas de Steam con `fetch` simulado: ruta que llama, límite de cantidad, quitar repetidas y juego no encontrado |

## Otros comandos

```bash
npm run build
```

```bash
npm run lint
```

## Vistas

| Ruta | Vista | Acceso |
| --- | --- | --- |
| `/` | Inicio (carrusel, destacados, video) | Público |
| `/catalogo`, `/software` | Catálogo con búsqueda, filtros y orden | Público |
| `/categorias` | Categorías | Público |
| `/ofertas` | Productos con precio rebajado | Público |
| `/ficha/:id` | Detalle de producto | Público |
| `/login`, `/registro` | Inicio de sesión y registro | Público |
| `/noticias`, `/contacto`, `/nosotros` | Contenido | Público |
| `/carrito` | Paso 1: carrito | Con sesión |
| `/checkout` | Paso 2: datos del comprador y entrega (precargados del perfil) | Con sesión |
| `/compra/exitosa/:id` | Paso 3: compra exitosa con detalle de la orden | Con sesión |
| `/compra/fallida` | Paso 3: pago rechazado (reintentar / volver al carrito) | Con sesión |
| `/admin`, `/admin/usuarios` | Mantenedores de productos y usuarios (CRUD) | Admin / vendedor |

> En el checkout, la casilla **"Demo: simular pago rechazado"** muestra la vista de pago fallido
> sin descontar stock ni crear órdenes.

## Estructura

```
src/
  components/   Piezas reutilizables (Header, TarjetaProducto, Precio, ModalConfirmacion, ...)
  context/      Estado global con Context API: sesión, carrito, avisos (toast), confirmaciones
  hooks/        Hooks propios (useCart, useAuth, useFormulario, useCarga, useConfirmar, ...)
  pages/        Una página por ruta
  services/     Llamadas a la API (fetch) — CRUD de productos, usuarios y órdenes
  types/        Tipos TypeScript de los datos
  utils/        Validaciones y formato (CLP, ofertas)
tests/          Pruebas Jasmine + Karma
db.json         "Base de datos" de json-server
```
