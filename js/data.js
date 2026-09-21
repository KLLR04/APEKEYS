/* ===========================================================================
   data.js  —  Capa de datos de APEKEYS
   ---------------------------------------------------------------------------
   No usamos base de datos todavía: este archivo simula la persistencia con
   localStorage / sessionStorage. Es el ÚNICO archivo que habrá que cambiar
   cuando conectemos el backend, porque todo el resto del sitio consume los
   datos a través de window.APEKEYS_STORE.
   =========================================================================== */
(function () {
  "use strict";

  var KEYS = {
    products: "apekeys_products_v4",
    users: "apekeys_users_v3",
    session: "apekeys_session_v2",
    cart: "apekeys_cart_v2", // se le concatena el id del usuario
    orders: "apekeys_orders_v1",
    messages: "apekeys_messages_v1",
  };

  /* ---------------------------------------------------------------------
     Catálogo semilla. Se declara como matriz compacta y luego se mapea a
     objetos, para que agregar un producto sea una sola línea.
     Orden de columnas: id, código, nombre, categoría, plataforma, precio,
     stock, stock crítico, descripción.
     --------------------------------------------------------------------- */
  var productImages = [
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2417610/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg",
  ];
  var productsSeed = [
    [
      1,
      "GAM-001",
      "Red Dead Redemption 2",
      "Mundo Abierto",
      "Steam",
      29990,
      45,
      "Aventura de acción ambientada en el lejano oeste.",
    ],
    [
      2,
      "GAM-002",
      "Metal Gear Solid Delta",
      "Acción",
      "Steam",
      49990,
      12,
      "Juego de acción y sigilo de la saga Metal Gear.",
    ],
    [
      3,
      "GAM-003",
      "Helldivers 2",
      "Acción",
      "Steam",
      39990,
      20,
      "Juego cooperativo de acción para hasta cuatro jugadores.",
    ],
    [
      4,
      "GAM-004",
      "Hollow Knight",
      "Plataformas",
      "Steam",
      9990,
      30,
      "Aventura de acción en un reino subterráneo.",
    ],
    [
      5,
      "GAM-005",
      "Resident Evil 4 Remake",
      "Terror",
      "Steam",
      39990,
      8,
      "Juego de acción y supervivencia contra criaturas infectadas.",
    ],
  ].map(function (p, i) {
    return {
      id: p[0],
      codigo: p[1],
      nombre: p[2],
      categoria: p[3],
      plataforma: p[4],
      precio: p[5],
      stock: p[6],
      descripcion: p[7],
      imagen: productImages[i],
      activo: true,
      stockCritico: 5,
    };
  });

  /* ---------------------------------------------------------------------
     Usuarios semilla. Las contraseñas están en texto plano porque el sitio
     corre 100% en el navegador; al pasar al backend se guardarán con hash.
     IMPORTANTE: todas cumplen la regla de 4 a 10 caracteres exigida en el
     documento de requisitos, para que las tres cuentas puedan entrar.
     --------------------------------------------------------------------- */
  var usersSeed = [
    {
      id: 1,
      run: "190110222",
      nombre: "Ana",
      apellidos: "Muñoz Silva",
      email: "admin@duoc.cl",
      password: "Admin123",
      rol: "admin",
      fechaNacimiento: "1995-03-12",
      region: "Región Metropolitana de Santiago",
      comuna: "Santiago",
      direccion: "Av. Casa Matriz 1234",
      activo: true,
    },
    {
      id: 2,
      run: "211234563",
      nombre: "Camila",
      apellidos: "Rojas Pérez",
      email: "cliente@gmail.com",
      password: "Cliente123",
      rol: "cliente",
      fechaNacimiento: "2002-07-25",
      region: "Región de Valparaíso",
      comuna: "Viña del Mar",
      direccion: "Calle Prueba 456",
      activo: true,
    },
  ];
  usersSeed.push({
    id: 3,
    run: "185551238",
    nombre: "Diego",
    apellidos: "Pérez",
    email: "vendedor@duoc.cl",
    password: "Vendedor12",
    rol: "vendedor",
    region: "Región del Biobío",
    comuna: "Concepción",
    direccion: "Sucursal de prueba",
    activo: true,
  });

  /* Regiones y comunas para los selects encadenados del registro. */
  var regiones = [
    {
      nombre: "Región Metropolitana de Santiago",
      comunas: [
        "Santiago",
        "Maipú",
        "Puente Alto",
        "La Florida",
        "Las Condes",
        "Ñuñoa",
        "Providencia",
      ],
    },
    {
      nombre: "Región de Valparaíso",
      comunas: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio"],
    },
    {
      nombre: "Región del Biobío",
      comunas: ["Concepción", "Talcahuano", "Chiguayante", "San Pedro de la Paz", "Los Ángeles"],
    },
    {
      nombre: "Región de La Araucanía",
      comunas: ["Temuco", "Padre Las Casas", "Villarrica", "Angol"],
    },
    { nombre: "Región de Ñuble", comunas: ["Chillán", "Chillán Viejo", "San Carlos", "Bulnes"] },
    {
      nombre: "Región de Antofagasta",
      comunas: ["Antofagasta", "Calama", "Tocopilla", "Mejillones"],
    },
  ];

  var blogs = [
    {
      id: 1,
      titulo: "Cómo elegir tu próxima aventura",
      resumen:
        "Cinco preguntas simples para encontrar un juego que encaje con tu tiempo y tu estilo de juego.",
      imagen: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_hero.jpg",
      fecha: "2026-08-14",
      contenido: [
        "Antes de mirar una oferta, piensa cuánto tiempo quieres dedicarle y si prefieres jugar solo o acompañado. Un juego de 120 horas no es buena compra si solo tienes un par de tardes libres al mes.",
        "Revisa plataforma, clasificación por edad, requisitos técnicos y modalidad (campaña, cooperativo o competitivo). En APEKEYS cada ficha indica la plataforma de la clave para que no te equivoques al canjear.",
        "Por último, mira las reseñas recientes y no solo la nota general: muchos títulos mejoran bastante después de sus primeros parches. Una buena compra es la que realmente vas a poder disfrutar.",
      ],
    },
    {
      id: 2,
      titulo: "Tres claves para cuidar tu biblioteca digital",
      resumen:
        "Orden, seguridad y respaldos para mantener tus juegos y licencias siempre disponibles.",
      imagen: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/library_hero.jpg",
      fecha: "2026-09-02",
      contenido: [
        "Usa contraseñas únicas para cada tienda y activa la verificación en dos pasos cuando la plataforma lo permita. La mayoría de las cuentas robadas se pierden por reutilizar la misma clave en varios sitios.",
        "Guarda los correos de compra y los códigos de activación en una carpeta dedicada de tu correo. Si alguna vez necesitas soporte, ese comprobante es lo primero que te van a pedir.",
        "Nunca compartas claves de activación en redes sociales, foros o chats públicos: una clave digital se canjea una sola vez y quien la use primero se queda con el juego.",
      ],
    },
  ];

  /* ---------------------------------------------------------------------
     Lectura y escritura genérica con manejo de errores. Si el JSON guardado
     se corrompe, devolvemos el valor por defecto en lugar de romper la página.
     --------------------------------------------------------------------- */
  function read(key, fallback, storage) {
    try {
      var raw = (storage || localStorage).getItem(key);
      if (raw === null) return fallback;
      var parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value, storage) {
    try {
      (storage || localStorage).setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      // Se llena la cuota del navegador (ej. imágenes en base64 muy pesadas)
      return false;
    }
  }

  /* Siembra inicial: solo la primera vez que se abre el sitio. */
  if (!localStorage.getItem(KEYS.products)) write(KEYS.products, productsSeed);
  if (!localStorage.getItem(KEYS.users)) write(KEYS.users, usersSeed);
  if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, []);
  if (!localStorage.getItem(KEYS.messages)) write(KEYS.messages, []);

  function session() {
    var s = read(KEYS.session, null, sessionStorage);
    if (!s) return null;
    var u = read(KEYS.users, usersSeed).find(function (user) {
      return user.id === s.id && user.activo;
    });
    return u
      ? { id: u.id, nombre: u.nombre, apellidos: u.apellidos, email: u.email, rol: u.rol }
      : null;
  }

  /* El carrito es por usuario: así un cliente no ve lo que agregó otro. */
  function cartKey() {
    var s = session();
    return s ? KEYS.cart + "_" + s.id : KEYS.cart + "_invitado";
  }

  window.APEKEYS_STORE = {
    KEYS: KEYS,
    blogs: blogs,
    regiones: regiones,

    products: function () {
      return read(KEYS.products, productsSeed.slice());
    },
    saveProducts: function (v) {
      return write(KEYS.products, v);
    },
    productById: function (id) {
      return (
        this.products().find(function (p) {
          return p.id === Number(id);
        }) || null
      );
    },

    users: function () {
      return read(KEYS.users, usersSeed.slice());
    },
    saveUsers: function (v) {
      return write(KEYS.users, v);
    },

    session: session,
    saveSession: function (v) {
      return write(KEYS.session, v, sessionStorage);
    },
    clearSession: function () {
      sessionStorage.removeItem(KEYS.session);
    },

    cart: function () {
      return read(cartKey(), []);
    },
    saveCart: function (v) {
      return write(cartKey(), v);
    },
    clearCart: function () {
      localStorage.removeItem(cartKey());
    },

    orders: function () {
      return read(KEYS.orders, []);
    },
    saveOrders: function (v) {
      return write(KEYS.orders, v);
    },

    messages: function () {
      return read(KEYS.messages, []);
    },
    saveMessages: function (v) {
      return write(KEYS.messages, v);
    },

    /* Botón de emergencia para la demo: deja todo como recién instalado. */
    resetDemo: function () {
      write(KEYS.products, productsSeed);
      write(KEYS.users, usersSeed);
      write(KEYS.orders, []);
      write(KEYS.messages, []);
      Object.keys(localStorage)
        .filter(function (k) {
          return k.indexOf(KEYS.cart) === 0;
        })
        .forEach(function (k) {
          localStorage.removeItem(k);
        });
      sessionStorage.removeItem(KEYS.session);
    },
  };
})();
