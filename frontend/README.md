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
