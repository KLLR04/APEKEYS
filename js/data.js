(function () {
  "use strict";
  const KEYS = { products:"apekeys_products_v2", users:"apekeys_users_v1", session:"apekeys_session_v1", cart:"apekeys_cart_v1", messages:"apekeys_messages_v1" };
  const images = ["img/Carrusel index/carrousel_1.png","img/Carrusel index/carrousel_2.png","img/Carrusel index/carrousel_3.png"];
  const productImages = [
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275850/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1944430/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2195250/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg",
    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg",
    "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=80"
  ];
  const productsSeed = [
    [1,"GAM-001","Red Dead Redemption 2","Mundo Abierto","Steam",29990,45,"Una aventura épica de forajidos en el corazón de Estados Unidos."],
    [2,"GAM-002","Hogwarts Legacy","Mundo Abierto","Steam",49990,12,"Explora el mundo mágico del siglo XIX y define tu propio legado."],
    [3,"GAM-003","No Man's Sky","Mundo Abierto","Steam",24990,80,"Exploración y supervivencia en un universo generado proceduralmente."],
    [4,"GAM-004","Resident Evil 4 Remake","Terror","PlayStation",39990,15,"Sobrevive al horror biológico en una aislada aldea europea."],
    [5,"GAM-005","Amnesia The Bunker","Terror","Xbox",19990,5,"Horror de supervivencia en un búnker de la Primera Guerra Mundial."],
    [6,"GAM-006","Hollow Knight","Plataformas","PC",9990,200,"Aventura de acción en un vasto reino subterráneo interconectado."],
    [7,"GAM-007","Celeste","Plataformas","PC",14990,50,"Acompaña a Madeline en una desafiante escalada llena de emoción."],
    [8,"GAM-008","Baldur's Gate 3","Rol","PC",59990,30,"Una aventura de rol donde cada decisión transforma la historia."],
    [9,"GAM-009","The Witcher 3 Wild Hunt","Rol","PlayStation",19990,120,"Conviértete en cazador de monstruos en un mundo devastado."],
    [10,"GAM-010","It Takes Two","Multijugador","Xbox",35990,40,"Una aventura cooperativa diseñada para avanzar trabajando en equipo."],
    [11,"GAM-011","Among Us","Multijugador","PC",4990,500,"Trabajo en equipo y traición en una nave perdida en el espacio."],
    [12,"GAM-012","EA Sports FC 24","Deportes","Xbox",45990,60,"Fútbol, competencia y gestión de equipos con física renovada."],
    [13,"GAM-013","Forza Horizon 5","Carreras","Xbox",34990,22,"Conduce cientos de vehículos por un vibrante mundo abierto."],
    [14,"GAM-014","Apex Legends Coins","Battle Royale","PC",12990,90,"Saldo digital para personalizar tu experiencia en Apex Legends."],
    [15,"SOF-015","Game Pass PC 3 meses","Software","PC",23990,35,"Acceso digital por tres meses a un amplio catálogo de juegos."],
    [16,"SOF-016","Windows 11 Home","Software","PC",89990,18,"Licencia digital para un equipo, entrega inmediata por correo."]
  ].map(function (p, i) { return { id:p[0], codigo:p[1], nombre:p[2], categoria:p[3], plataforma:p[4], precio:p[5], stock:p[6], descripcion:p[7], imagen:productImages[i], activo:true, stockCritico:5 }; });
  const usersSeed = [
    { id:1, run:"19011022K", nombre:"Ana", apellidos:"Muñoz", email:"admin@duoc.cl", password:"Admin123", rol:"admin", region:"Metropolitana", comuna:"Santiago", direccion:"Casa matriz APEKEYS", activo:true },
    { id:2, run:"211234567", nombre:"Camila", apellidos:"Rojas", email:"cliente@gmail.com", password:"Cliente123", rol:"cliente", region:"Valparaíso", comuna:"Viña del Mar", direccion:"Dirección de prueba", activo:true },
    { id:3, run:"185551234", nombre:"Diego", apellidos:"Pérez", email:"vendedor@duoc.cl", password:"Vendedor123", rol:"vendedor", region:"Biobío", comuna:"Concepción", direccion:"Sucursal de prueba", activo:true }
  ];
  const blogs = [
    { id:1, titulo:"Cómo elegir tu próxima aventura", resumen:"Cinco preguntas simples para encontrar un juego que encaje con tu tiempo y estilo.", imagen:images[0], contenido:["Antes de mirar una oferta, piensa cuánto tiempo quieres dedicar y si prefieres jugar solo o acompañado.","Revisa plataforma, clasificación, requisitos y modalidad. Una buena compra es la que realmente podrás disfrutar."] },
    { id:2, titulo:"Tres claves para cuidar tu biblioteca digital", resumen:"Orden, seguridad y respaldos para mantener tus juegos siempre disponibles.", imagen:images[1], contenido:["Usa contraseñas únicas y activa la verificación en dos pasos cuando la plataforma lo permita.","Mantén tus correos de compra y códigos en un lugar seguro. Nunca compartas claves de activación en redes públicas."] }
  ];
  function read(key, fallback, storage) { try { return JSON.parse((storage || localStorage).getItem(key)) ?? fallback; } catch (_) { return fallback; } }
  function write(key, value, storage) { (storage || localStorage).setItem(key, JSON.stringify(value)); }
  if (!localStorage.getItem(KEYS.products)) write(KEYS.products, productsSeed);
  if (!localStorage.getItem(KEYS.users)) write(KEYS.users, usersSeed);
  if (!localStorage.getItem(KEYS.cart)) write(KEYS.cart, []);
  if (!localStorage.getItem(KEYS.messages)) write(KEYS.messages, []);
  window.APEKEYS_STORE = {
    KEYS:KEYS, blogs:blogs,
    products:function(){return read(KEYS.products,productsSeed.slice());}, saveProducts:function(v){write(KEYS.products,v);},
    users:function(){return read(KEYS.users,usersSeed.slice());}, saveUsers:function(v){write(KEYS.users,v);},
    session:function(){return read(KEYS.session,null,sessionStorage);}, saveSession:function(v){write(KEYS.session,v,sessionStorage);}, clearSession:function(){sessionStorage.removeItem(KEYS.session);},
    cart:function(){return read(KEYS.cart,[]);}, saveCart:function(v){write(KEYS.cart,v);}, messages:function(){return read(KEYS.messages,[]);}, saveMessages:function(v){write(KEYS.messages,v);},
    resetDemo:function(){write(KEYS.products,productsSeed);write(KEYS.users,usersSeed);write(KEYS.cart,[]);}
  };
})();

