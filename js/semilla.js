// Estos son los juegos por categorías para la semilla en el arreglo

const inventarioJuegos = [
  // --- MUNDO ABIERTO (3) ---
  {
    id: 1,
    titulo: "Red Dead Redemption 2",
    categoria: "Mundo Abierto",
    plataforma: "Steam",
    precio: 29.99,
    stock: 45,
    descripcion: "Épica historia de forajidos ambientada en el implacable corazón de Estados Unidos.",
    multimedia: {
      portada: "img/portadas/rdr2.jpg",
      trailer: "video/rdr2_gameplay.webm",
      carrusel: ["img/carrusel/rdr2_1.jpg", "img/carrusel/rdr2_2.jpg"]
    }
  },
  {
    id: 2,
    titulo: "Hogwarts Legacy",
    categoria: "Mundo Abierto",
    plataforma: "Steam",
    precio: 49.99,
    stock: 12,
    descripcion: "RPG de acción inmersivo ambientado en el universo mágico del siglo XIX.",
    multimedia: {
      portada: "img/portadas/hogwarts.jpg",
      trailer: "video/hogwarts_gameplay.webm",
      carrusel: ["img/carrusel/hl_1.jpg", "img/carrusel/hl_2.jpg"]
    }
  },
  {
    id: 3,
    titulo: "No Man's Sky",
    categoria: "Mundo Abierto",
    plataforma: "Steam",
    precio: 24.99,
    stock: 80,
    descripcion: "Exploración, comercio y supervivencia en un universo infinito generado procedimentalmente.",
    multimedia: {
      portada: "img/portadas/nms.jpg",
      trailer: "video/nms_gameplay.webm",
      carrusel: ["img/carrusel/nms_1.jpg", "img/carrusel/nms_2.jpg"]
    }
  },

  // --- TERROR (2) ---
  {
    id: 4,
    titulo: "Resident Evil 4 Remake",
    categoria: "Terror",
    plataforma: "PlayStation",
    precio: 39.99,
    stock: 15,
    descripcion: "Sobrevive al horror biológico en una aldea aislada de Europa.",
    multimedia: {
      portada: "img/portadas/re4.jpg",
      trailer: "video/re4_gameplay.webm",
      carrusel: ["img/carrusel/re4_1.jpg"]
    }
  },
  {
    id: 5,
    titulo: "Amnesia: The Bunker",
    categoria: "Terror",
    plataforma: "Xbox",
    precio: 19.99,
    stock: 5,
    descripcion: "Horror de supervivencia en primera persona en un búnker de la Primera Guerra Mundial.",
    multimedia: {
      portada: "img/portadas/amnesia.jpg",
      trailer: "video/amnesia_gameplay.webm",
      carrusel: ["img/carrusel/amn_1.jpg"]
    }
  },

  // --- PLATAFORMAS (2) ---
  {
    id: 6,
    titulo: "Hollow Knight",
    categoria: "Plataformas",
    plataforma: "PC",
    precio: 9.99,
    stock: 200,
    descripcion: "Aventura de acción clásica en un vasto mundo subterráneo interconectado.",
    multimedia: {
      portada: "img/portadas/hollow.jpg",
      trailer: "video/hollow_gameplay.webm",
      carrusel: ["img/carrusel/hk_1.jpg"]
    }
  },
  {
    id: 7,
    titulo: "Celeste",
    categoria: "Plataformas",
    plataforma: "PC",
    precio: 14.99,
    stock: 50,
    descripcion: "Ayuda a Madeline a sobrevivir a sus demonios internos en esta desafiante escalada.",
    multimedia: {
      portada: "img/portadas/celeste.jpg",
      trailer: "video/celeste_gameplay.webm",
      carrusel: ["img/carrusel/cel_1.jpg"]
    }
  },

  // --- ROL (2) ---
  {
    id: 8,
    titulo: "Baldur's Gate 3",
    categoria: "Rol",
    plataforma: "PC",
    precio: 59.99,
    stock: 30,
    descripcion: "RPG de nueva generación ambientado en el universo de Dungeons & Dragons.",
    multimedia: {
      portada: "img/portadas/bg3.jpg",
      trailer: "video/bg3_gameplay.webm",
      carrusel: ["img/carrusel/bg3_1.jpg"]
    }
  },
  {
    id: 9,
    titulo: "The Witcher 3: Wild Hunt",
    categoria: "Rol",
    plataforma: "PlayStation",
    precio: 19.99,
    stock: 120,
    descripcion: "Conviértete en un cazador de monstruos a sueldo en un mundo devastado por la guerra.",
    multimedia: {
      portada: "img/portadas/witcher3.jpg",
      trailer: "video/tw3_gameplay.webm",
      carrusel: ["img/carrusel/tw3_1.jpg"]
    }
  },

  // --- MULTIJUGADOR (2) ---
  {
    id: 10,
    titulo: "It Takes Two",
    categoria: "Multijugador",
    plataforma: "Xbox",
    precio: 35.99,
    stock: 40,
    descripcion: "Aventura cooperativa de plataformas donde deben trabajar juntos para avanzar.",
    multimedia: {
      portada: "img/portadas/itt.jpg",
      trailer: "video/itt_gameplay.webm",
      carrusel: ["img/carrusel/itt_1.jpg"]
    }
  },
  {
    id: 11,
    titulo: "Among Us",
    categoria: "Multijugador",
    plataforma: "PC",
    precio: 4.99,
    stock: 500,
    descripcion: "Juego de trabajo en equipo y traición en el espacio.",
    multimedia: {
      portada: "img/portadas/amongus.jpg",
      trailer: "video/amongus_gameplay.webm",
      carrusel: ["img/carrusel/au_1.jpg"]
    }
  },

  // --- DEPORTES (1) ---
  {
    id: 12,
    titulo: "EA SPORTS FC 24",
    categoria: "Deportes",
    plataforma: "Xbox",
    precio: 45.99,
    stock: 60,
    descripcion: "Simulador de fútbol con físicas realistas y gestión de equipos.",
    multimedia: {
      portada: "img/portadas/fc24.jpg",
      trailer: "video/fc24_gameplay.webm",
      carrusel: ["img/carrusel/fc_1.jpg"]
    }
  },

  // --- CARRERAS (1) ---
  {
    id: 13,
    titulo: "Forza Horizon 5",
    categoria: "Carreras",
    plataforma: "PC",
    precio: 39.99,
    stock: 25,
    descripcion: "Explora los vibrantes paisajes de México en los mejores autos del mundo.",
    multimedia: {
      portada: "img/portadas/forza.jpg",
      trailer: "video/forza_gameplay.webm",
      carrusel: ["img/carrusel/fh5_1.jpg"]
    }
  },

  // --- BATTLE ROYALE (2) ---
  {
    id: 14,
    titulo: "Apex Legends: Monedas Apex",
    categoria: "Battle Royale",
    plataforma: "PlayStation",
    precio: 19.99,
    stock: 999,
    descripcion: "Moneda in-game para adquirir cosméticos en el famoso hero shooter.",
    multimedia: {
      portada: "img/portadas/apex.jpg",
      trailer: "video/apex_gameplay.webm",
      carrusel: ["img/carrusel/apex_1.jpg"]
    }
  },
  {
    id: 15,
    titulo: "Fortnite: Pase de Batalla",
    categoria: "Battle Royale",
    plataforma: "PC",
    precio: 8.99,
    stock: 999,
    descripcion: "Desbloquea recompensas exclusivas durante la temporada actual.",
    multimedia: {
      portada: "img/portadas/fortnite.jpg",
      trailer: "video/fortnite_gameplay.webm",
      carrusel: ["img/carrusel/fn_1.jpg"]
    }
  }
];