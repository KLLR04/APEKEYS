/* ===========================================================================
   catalogo.js  —  Listados de productos (home, productos, software, categorías)
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var app = window.APEKEYS;

  /* Tarjeta de producto. Toda la tarjeta enlaza al detalle; el botón
     "Agregar" no navega porque detiene la propagación del click. */
  function productCard(p) {
    var article = document.createElement("article");
    article.className = "card product-card h-100";

    var link = document.createElement("a");
    link.href = "producto.html?id=" + p.id;
    link.className = "product-link";
    link.setAttribute("aria-label", "Ver detalle de " + p.nombre);

    var imageBox = document.createElement("div");
    imageBox.className = "product-image";
    var image = document.createElement("img");
    image.src = p.imagen || "img/logo.png";
    image.alt = "Portada de " + p.nombre;
    image.loading = "lazy";
    image.addEventListener(
      "error",
      function () {
        image.src = "img/logo.png";
      },
      { once: true },
    );
    imageBox.appendChild(image);

    if (p.stock <= 0) {
      var cinta = document.createElement("span");
      cinta.className = "stock-ribbon";
      cinta.textContent = "Agotado";
      imageBox.appendChild(cinta);
    }

    var body = document.createElement("div");
    body.className = "card-body d-flex flex-column";

    var tag = document.createElement("span");
    tag.className = "badge text-bg-secondary align-self-start mb-2";
    tag.textContent = p.categoria;

    var title = document.createElement("h3");
    title.textContent = p.nombre;
    title.className = "h5";

    var meta = document.createElement("div");
    meta.className = "product-meta";
    meta.textContent =
      p.plataforma + " · " + (p.stock > 0 ? p.stock + " disponibles" : "Sin stock");

    link.append(imageBox);
    body.append(tag, title, meta);

    var bottom = document.createElement("div");
    bottom.className = "d-flex justify-content-between align-items-center mt-auto";

    var price = document.createElement("strong");
    price.className = "price";
    price.textContent = app.formatCLP(p.precio);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-primary btn-sm";
    button.textContent = p.stock > 0 ? "Agregar" : "Agotado";
    button.disabled = p.stock <= 0;
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      app.addToCart(p.id, 1);
    });

    bottom.append(price, button);
    body.appendChild(bottom);

    var wrapperLink = document.createElement("a");
    wrapperLink.href = "producto.html?id=" + p.id;
    wrapperLink.className = "product-title-link";
    wrapperLink.appendChild(title);
    body.insertBefore(wrapperLink, meta);
    article.append(link, body);
    var column = document.createElement("div");
    column.className = "col-sm-6 col-lg-4";
    column.appendChild(article);
    return column;
  }

  function renderGrid(target, products) {
    target.replaceChildren();
    if (!products.length) {
      var empty = document.createElement("div");
      empty.className = "col-12 alert alert-light";
      empty.textContent = "No encontramos productos con esos filtros.";
      target.appendChild(empty);
      return;
    }
    products.forEach(function (p) {
      target.appendChild(productCard(p));
    });
  }

  /* ---------------- Home ---------------- */
  function initHome() {
    var grid = document.querySelector("[data-featured-products]");
    if (grid) {
      var destacados = store
        .products()
        .filter(function (p) {
          return p.activo;
        })
        .sort(function (a, b) {
          return a.nombre.localeCompare(b.nombre, "es");
        })
        .slice(0, 8);
      renderGrid(grid, destacados);
    }

    var slides = Array.from(document.querySelectorAll(".hero-slide"));
    var dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (!slides.length) return;

    var current = 0;
    function show(index) {
      current = index;
      slides.forEach(function (s, i) {
        s.classList.toggle("active", i === index);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show((current + 1) % slides.length);
    }, 5000);
  }

  /* ---------------- Productos / Software ---------------- */
  function initProducts(categoryPreset) {
    var grid = document.querySelector("[data-products-grid]");
    if (!grid) return;

    var search = document.getElementById("catalogSearch");
    var category = document.getElementById("catalogCategory");
    var orden = document.getElementById("catalogSort");

    var products = store.products().filter(function (p) {
      // El catálogo público solo muestra productos activos.
      if (!p.activo) return false;
      if (categoryPreset) return p.categoria === categoryPreset;
      return true;
    });

    if (category) {
      Array.from(
        new Set(
          products.map(function (p) {
            return p.categoria;
          }),
        ),
      )
        .sort(function (a, b) {
          return a.localeCompare(b, "es");
        })
        .forEach(function (c) {
          var opt = document.createElement("option");
          opt.value = c;
          opt.textContent = c;
          category.appendChild(opt);
        });
      var query = new URLSearchParams(location.search);
      category.value = query.get("categoria") || "";
    }

    if (search) search.value = new URLSearchParams(location.search).get("buscar") || "";
    function filtrar() {
      var term = search ? search.value.trim().toLowerCase() : "";
      var cat = category ? category.value : "";

      var visibles = products.filter(function (p) {
        var coincideCategoria = !cat || p.categoria === cat;
        var coincideTexto =
          !term ||
          [p.nombre, p.codigo, p.categoria, p.plataforma].join(" ").toLowerCase().indexOf(term) !==
            -1;
        return coincideCategoria && coincideTexto;
      });

      var criterio = orden ? orden.value : "nombre";
      visibles.sort(function (a, b) {
        if (criterio === "precio-asc") return a.precio - b.precio;
        if (criterio === "precio-desc") return b.precio - a.precio;
        return a.nombre.localeCompare(b.nombre, "es");
      });

      renderGrid(grid, visibles);

      var contador = document.querySelector("[data-result-count]");
      if (contador) {
        contador.textContent =
          visibles.length === 1
            ? "1 producto encontrado"
            : visibles.length + " productos encontrados";
      }
    }

    if (search) search.addEventListener("input", filtrar);
    if (category) category.addEventListener("change", filtrar);
    if (orden) orden.addEventListener("change", filtrar);
    filtrar();
  }

  /* ---------------- Categorías ---------------- */
  function initCategories() {
    var target = document.querySelector("[data-category-grid]");
    if (!target) return;

    var counts = {};
    store
      .products()
      .filter(function (p) {
        return p.activo;
      })
      .forEach(function (p) {
        counts[p.categoria] = (counts[p.categoria] || 0) + 1;
      });

    Object.keys(counts)
      .sort(function (a, b) {
        return a.localeCompare(b, "es");
      })
      .forEach(function (name) {
        var a = document.createElement("a");
        a.href = "productos.html?categoria=" + encodeURIComponent(name);
        a.className = "card card-body h-100";
        var strong = document.createElement("strong");
        strong.textContent = name;
        var span = document.createElement("span");
        span.textContent = counts[name] + (counts[name] === 1 ? " producto" : " productos");
        a.append(strong, span);
        var column = document.createElement("div");
        column.className = "col-sm-6 col-md-4";
        column.appendChild(a);
        target.appendChild(column);
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.dataset.page;
    if (page === "home") initHome();
    if (page === "products") initProducts();
    if (page === "software") initProducts("Software");
    if (page === "categories") initCategories();
  });
})();
