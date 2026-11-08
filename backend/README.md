# APEKEYS · API (Spring Boot + microservicios)

Backend de la tienda de claves de videojuegos APEKEYS. Proyecto de **DSY1104 Full Stack 2** (Duoc UC).

La API está dividida en **microservicios**: programas pequeños e independientes, cada uno con su propia base de datos.
El frontend no habla con cada uno por separado: todo entra por el **API Gateway** (puerto 8080).

```
                 ┌────────────────────┐
  Frontend  ───► │ API Gateway :8080  │ ── pregunta a Eureka dónde está cada servicio
  (React)        └─────────┬──────────┘
                           │
     ┌──────────────┬──────┴───────┬───────────────┐
     ▼              ▼              ▼               ▼
 ms-usuario     ms-catalogo    ms-pedidos     ms-favoritos
   :8081          :8082          :8083           :8084
 db_usuarios    db_catalogo    db_pedidos     db_favoritos

           Eureka Server :8761 = "directorio" donde se registran todos
```

| Módulo | Puerto | Qué hace |
| --- | --- | --- |
| `eureka-server` | 8761 | Registro de servicios: cada microservicio se anota aquí al arrancar |
| `api-gateway` | 8080 | Puerta de entrada única; reenvía cada ruta `/api/...` al microservicio que corresponde y aplica CORS |
| `ms-usuario` | 8081 | Registro, inicio de sesión (JWT), perfil y administración de usuarios |
| `ms-catalogo` | 8082 | Categorías y productos (con ofertas), y el control del stock |
| `ms-pedidos` | 8083 | Carrito de cada usuario y pedidos |
| `ms-favoritos` | 8084 | Lista de deseos de cada usuario |

## Requisitos

- **Java 17** (JDK)
- **MySQL 8** escuchando en el puerto **3308**, usuario `root` sin contraseña (configuración de la sede).
  Las bases `db_usuarios`, `db_catalogo`, `db_pedidos` y `db_favoritos` se crean solas al arrancar.
- No hace falta instalar Maven: cada módulo trae `mvnw` (Maven Wrapper).

## Variables de entorno (obligatorias)

Los microservicios **no arrancan** si faltan estas variables. Deben tener el **mismo valor** en todas las terminales.

| Variable | Para qué sirve | Ejemplo |
| --- | --- | --- |
| `JWT_SECRET` | Clave para firmar los tokens de sesión. **Mínimo 32 caracteres** | `apekeys-clave-secreta-de-desarrollo-2026` |
| `INTERNAL_API_KEY` | Clave que usan los microservicios para hablar entre ellos (mover stock, limpiar favoritos y carritos) | `apekeys-interna-2026` |
| `ADMIN_PASSWORD` *(opcional)* | Contraseña del administrador inicial. Si no se define se usa la de `ms-usuario/application.properties` | |

En **PowerShell** (una vez por terminal):

```powershell
$env:JWT_SECRET = "apekeys-clave-secreta-de-desarrollo-2026"
$env:INTERNAL_API_KEY = "apekeys-interna-2026"
```

En **IntelliJ**: *Run → Edit Configurations → Environment variables* de cada aplicación.

## Cómo levantarla

El orden importa: **primero Eureka**, después los microservicios y al final el gateway.
Cada comando va en su propia terminal (con las variables de entorno definidas).

```powershell
cd eureka-server; .\mvnw spring-boot:run
```

```powershell
cd ms-usuario; .\mvnw spring-boot:run
```

```powershell
cd ms-catalogo; .\mvnw spring-boot:run
```

```powershell
cd ms-pedidos; .\mvnw spring-boot:run
```

```powershell
cd ms-favoritos; .\mvnw spring-boot:run
```

```powershell
cd api-gateway; .\mvnw spring-boot:run
```

Revisa en <http://localhost:8761> que aparezcan los 5 servicios registrados.

> **Ojo:** después de arrancar, los servicios tardan unos **30 segundos** en "verse" entre ellos a través de Eureka.
> Si en ese rato una llamada responde *503 / No instances available*, espera un poco y vuelve a intentar.

### Datos iniciales

- **ms-usuario** crea los roles `ADMINISTRADOR` y `CLIENTE` y un administrador inicial (`admin@fullstack.cl`).
- **ms-catalogo** carga 5 categorías y los 5 juegos de ejemplo del frontend **solo si la base está vacía**.

> Si ya tenías `db_catalogo` de una versión anterior (sin `codigo`, `plataforma`, etc.), bórrala
> (`DROP DATABASE db_catalogo;`) para que se cree de nuevo con las columnas nuevas.

## Endpoints

Todas las rutas se llaman a través del gateway: `http://localhost:8080`.
Las que dicen **Token** necesitan la cabecera `Authorization: Bearer <token>` (el token lo entrega el login).

### Usuarios y sesión (`ms-usuario`)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | `{ email, password }` → `{ token, email, nombre, apellido, rol }` |
| POST | `/api/usuarios/registro` | Público | `{ email, password, nombre, apellido }` → crea un **CLIENTE** |
| GET / PUT | `/api/usuarios/perfil` | Token | Ver / editar mi nombre, apellido y contraseña |
| GET | `/api/usuarios` | Admin | Listar usuarios |
| GET / PUT / DELETE | `/api/usuarios/{email}` | Admin | Ver, editar (nombre, apellido, `idTipoUsuario`) o eliminar |
| GET | `/api/tipos-usuario` | Público | Listar roles |
| POST / PUT / DELETE | `/api/tipos-usuario/{id}` | Admin | Administrar roles |

### Catálogo (`ms-catalogo`)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/productos` | Público | Listar productos |
| GET | `/api/productos/{id}` | Público | Ver un producto |
| GET | `/api/productos/categoria/{idCategoria}` | Público | Productos de una categoría |
| POST / PUT | `/api/productos` · `/api/productos/{id}` | Admin | Crear / editar |
| DELETE | `/api/productos/{id}` | Admin | Eliminar (también lo quita de favoritos y carritos) |
| GET | `/api/categorias` · `/api/categorias/{id}` | Público | Listar / ver categorías |
| POST / PUT / DELETE | `/api/categorias` · `/api/categorias/{id}` | Admin | Administrar categorías (no se borra si tiene productos) |

Ejemplo de producto:

```json
{
  "codigo": "GAM-003",
  "nombre": "Helldivers 2",
  "descripcion": "Juego cooperativo de acción para hasta cuatro jugadores.",
  "plataforma": "Steam",
  "imagen": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
  "precio": 39990,
  "precioOferta": 29990,
  "stock": 20,
  "stockCritico": 5,
  "disponibilidad": "S",
  "categoria": { "idCategoria": 2 }
}
```

La respuesta incluye además `idProducto` y `precioFinal` (el precio de oferta si existe; si no, el precio normal).

### Carrito y pedidos (`ms-pedidos`)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/carritos` | Token | Mi carrito |
| POST | `/api/carritos/productos` | Token | `{ productoId, cantidad }` agrega o suma |
| PUT | `/api/carritos/productos/{productoId}` | Token | `{ cantidad }` cambia la cantidad |
| DELETE | `/api/carritos/productos/{productoId}` | Token | Quita un producto |
| DELETE | `/api/carritos` | Token | Vacía el carrito |
| POST | `/api/pedidos` | Token | Compra todo el carrito (cobra el precio de oferta si lo hay) |
| GET | `/api/pedidos` · `/api/pedidos/{id}` | Token | Mis pedidos |
| GET | `/api/pedidos/admin` | Admin | Todos los pedidos |
| PUT | `/api/pedidos/{id}/estado` | Admin | `{ estado }`: `P` pendiente, `E` enviado, `R` recibido |

### Favoritos (`ms-favoritos`)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/favoritos` | Token | Mis favoritos |
| GET | `/api/favoritos/{productoId}` | Token | ¿Este producto es favorito? |
| POST / DELETE | `/api/favoritos/{productoId}` | Token | Agregar / quitar |

### Rutas internas (solo entre microservicios)

Requieren la cabecera `X-Internal-Api-Key` con el valor de `INTERNAL_API_KEY`; desde afuera responden 401.

| Ruta | Quién la llama | Para qué |
| --- | --- | --- |
| `POST /api/productos/descontar-stock` | ms-pedidos | Descuenta el stock de **todo** el pedido: o se descuentan todas las líneas o ninguna |
| `POST /api/productos/reponer-stock` | ms-pedidos | Devuelve el stock si el pedido no se pudo guardar |
| `DELETE /api/favoritos/interno/producto/{id}` | ms-catalogo | Borra los favoritos de un producto eliminado |
| `DELETE /api/carritos/interno/producto/{id}` | ms-catalogo | Quita de los carritos un producto eliminado |

## Reglas de negocio

- Contraseña: **entre 4 y 10 caracteres** (igual que el frontend). Se guarda cifrada con **BCrypt**.
- Correo único; nombre y apellido de hasta 30 caracteres.
- Un administrador **no puede eliminar su propia cuenta** ni quitarse su propio rol de administrador.
- Producto: código único (ej. `GAM-001`), precio y precio de oferta enteros hasta $999.999,
  la oferta debe ser menor que el precio, imagen debe ser una URL `http(s)://`.
- Al eliminar un producto se borran sus favoritos y se quita de los carritos. Si alguno de esos servicios
  no responde, el producto **no** se elimina (503) para no dejar datos huérfanos.
- Al comprar, el stock de todo el pedido se descuenta en una sola operación. Si el pedido no se logra guardar,
  el stock se devuelve automáticamente. Así dos clientes comprando a la vez no "pierden" unidades.
- El detalle del pedido guarda el **nombre** del producto, para que el historial se vea aunque el producto se borre.

## Pruebas

Pruebas unitarias con **JUnit 5 + Mockito** (no necesitan MySQL):

```powershell
cd ms-usuario; .\mvnw test -Dtest=*ServiceTest
```

```powershell
cd ms-catalogo; .\mvnw test -Dtest=*ServiceTest
```

```powershell
cd ms-pedidos; .\mvnw test -Dtest=*ServiceTest
```

`.\mvnw test` (sin filtro) además ejecuta `contextLoads`, que arranca la aplicación completa:
para esa prueba MySQL y las variables de entorno deben estar disponibles.
