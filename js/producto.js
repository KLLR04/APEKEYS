/* ===========================================================================
   producto.js  —  Vista de detalle de un producto (producto.html?id=N)
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var app = window.APEKEYS;

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page !== "product-detail") return;

    var id = new URLSearchParams(location.search).get("id");
    var producto = store.productById(id);

    var contenido = document.querySelector("[data-detail]");
    var noEncontrado = document.querySelector("[data-not-found]");

    // Producto inexistente o desactivado por el administrador.
    if (!producto || !producto.activo) {
      contenido.classList.add("hidden");
      noEncontrado.classList.remove("hidden");
      return;
    }

    document.title = producto.nombre + " | APEKEYS";

    var imagen = document.querySelector("[data-detail-image]");
    imagen.src = producto.imagen || "img/logo.png";
    imagen.alt = "Portada de " + producto.nombre;
    imagen.addEventListener(
      "error",
      function () {
        imagen.src = "img/logo.png";
      },
      { once: true },
    );

    document.querySelector("[data-detail-breadcrumb]").textContent = producto.categoria;
    document.querySelector("[data-detail-breadcrumb]").href =
      "productos.html?categoria=" + encodeURIComponent(producto.categoria);
    document.querySelector("[data-detail-name]").textContent = producto.nombre;
    document.querySelector("[data-detail-category]").textContent = producto.categoria;
    document.querySelector("[data-detail-platform]").textContent = producto.plataforma;
    document.querySelector("[data-detail-code]").textContent = producto.codigo;
    document.querySelector("[data-detail-price]").textContent = app.formatCLP(producto.precio);
    document.querySelector("[data-detail-description]").textContent = producto.descripcion;

    /* Disponibilidad: refleja el stock real, que baja con cada compra. */
    var estado = document.querySelector("[data-detail-stock]");
    if (producto.stock <= 0) {
      estado.textContent = "Sin stock disponible";
      estado.className = "badge text-bg-secondary";
    } else if (producto.stock <= producto.stockCritico) {
      estado.textContent = "¡Últimas " + producto.stock + " unidades!";
      estado.className = "badge text-bg-warning";
    } else {
      estado.textContent = producto.stock + " unidades disponibles";
      estado.className = "badge text-bg-success";
    }

    var cantidad = document.querySelector("[data-detail-qty]");
    var boton = document.querySelector("[data-detail-add]");

    cantidad.max = String(Math.max(1, producto.stock));
    cantidad.value = producto.stock > 0 ? "1" : "0";
    cantidad.disabled = producto.stock <= 0;
    boton.disabled = producto.stock <= 0;
    boton.textContent = producto.stock > 0 ? "Agregar al carrito" : "Sin stock";

    // La cantidad nunca puede superar el stock ni bajar de 1.
    cantidad.addEventListener("change", function () {
      var valor = Math.floor(Number(cantidad.value)) || 1;
      cantidad.value = String(Math.max(1, Math.min(valor, producto.stock)));
    });

    boton.addEventListener("click", function () {
      app.addToCart(producto.id, Number(cantidad.value) || 1);
    });

    /* Productos relacionados: misma categoría, excluyendo el actual. */
    var relacionadosBox = document.querySelector("[data-related]");
    var relacionados = store
      .products()
      .filter(function (p) {
        return p.activo && p.categoria === producto.categoria && p.id !== producto.id;
      })
      .slice(0, 4);

    if (!relacionados.length) {
      document.querySelector("[data-related-section]").classList.add("hidden");
      return;
    }

    relacionados.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "card related-card";
      a.href = "producto.html?id=" + p.id;

      var img = document.createElement("img");
      img.src = p.imagen || "img/logo.png";
      img.alt = "Portada de " + p.nombre;
      img.loading = "lazy";
      img.addEventListener(
        "error",
        function () {
          img.src = "img/logo.png";
        },
        { once: true },
      );

      var info = document.createElement("div");
      info.className = "related-body";
      var titulo = document.createElement("strong");
      titulo.textContent = p.nombre;
      var precio = document.createElement("span");
      precio.className = "price";
      precio.textContent = app.formatCLP(p.precio);
      info.append(titulo, precio);

      a.append(img, info);
      relacionadosBox.appendChild(a);
    });
  });
})();
