# APEKEYS — entrega frontend

Abrir mediante un servidor local (por ejemplo, Live Server), comenzando en `index.html`.

## Cuentas para la demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@duoc.cl | Admin123 |
| Cliente | cliente@gmail.com | Cliente123 |
| Vendedor | vendedor@duoc.cl | Vendedor12 |

El registro público crea únicamente clientes. Cada cuenta tiene su propio carrito.
La compra es simulada: exige sesión, valida existencias, descuenta stock y registra una orden. No hay cobro real ni envío de claves o correos.

## Integración del aporte de Jonás

Se incorporaron su registro, validaciones, carrito por usuario, órdenes, carga de imágenes, mantenedores, contacto, Nosotros, blogs con dos detalles, detalle de producto y video. Se adaptaron los componentes a Bootstrap 5.3.8, ya utilizado por el proyecto original, conservando su encabezado, carrusel, colores y disposición del login.

El inventario se administra dentro de `admin.html`; `admin-productos.html` conserva compatibilidad mediante una redirección. El vendedor consulta productos y órdenes y el cliente sólo accede a la tienda. El administrador tiene también el mantenedor de usuarios.

Se corrigieron dominios de correo, dirección y región/comuna en el registro según el anexo, y fecha de nacimiento y descripción opcionales. Por decisión del equipo, el precio se deja vacío inicialmente y debe ser mayor que cero, aunque el anexo admite productos gratuitos. El stock crítico es opcional.

Catálogo inicial: RDR2, Metal Gear Solid Delta, Helldivers 2, Hollow Knight y Resident Evil 4 Remake. Se mantiene la vista Software del aporte, inicialmente vacía, para que el administrador pueda cargar productos si corresponde.

Las imágenes admiten enlace público o archivo PNG/JPG/WEBP/GIF de hasta 400 KB. El archivo se guarda como datos de imagen en el navegador, no como una ruta privada de Windows.

## Límites de esta entrega

Es una demostración académica en HTML, CSS, Bootstrap y JavaScript. Usuarios, contraseñas, imágenes, stock, mensajes y órdenes se guardan en localStorage/sessionStorage de ese navegador; no se comparten entre equipos y no constituyen autenticación de servidor. Usar datos ficticios. Bootstrap y las portadas externas necesitan internet.

El video aportado por Jonás se conserva como material ilustrativo y muestra una interfaz anterior. Las compras y el contacto actuales son simulaciones locales.

El ZIP contiene el frontend. La presentación, el documento ERS y el envío al repositorio remoto se entregan por separado.
