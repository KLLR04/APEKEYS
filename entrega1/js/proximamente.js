(function () {
  "use strict";

  var juegos = {
    gta6: {
      nombre: "Grand Theft Auto VI",
      imagen:
        "https://media-rockstargames-com.akamaized.net/mfe6/prod/__common/img/f7eab33a4989ce5f0cd89c70723909b3.jpg",
      descripcion: "Una nueva aventura de mundo abierto ambientada en Vice City y Leonida.",
      fecha: "Próximo lanzamiento. Todavía no está disponible en el catálogo de APEKEYS.",
    },
    fc27: {
      nombre: "EA Sports FC 27",
      imagen:
        "https://drop-assets.ea.com/images/15VqAXZo2fThrwnnfx5cX7/5e8f03989e7dd09e7a150cb0ce784bec/fc-27-ultimate-plus-key-art-16x9.jpg?im=AspectCrop=(16,9),xPosition=0.4354166666666667,yPosition=0.4356481481481482",
      descripcion: "La próxima entrega de la serie de fútbol de EA Sports.",
      fecha: "Lanzamiento general anunciado para el 25 de septiembre de 2026.",
    },
  };

  var clave = new URLSearchParams(location.search).get("juego");
  var juego = juegos[clave] || juegos.gta6;
  var imagen = document.querySelector("[data-coming-image]");

  document.title = juego.nombre + " | Próximamente";
  document.querySelector("[data-coming-title]").textContent = juego.nombre;
  document.querySelector("[data-coming-description]").textContent = juego.descripcion;
  document.querySelector("[data-coming-date]").textContent = juego.fecha;
  imagen.src = juego.imagen;
  imagen.alt = "Imagen de " + juego.nombre;
})();
