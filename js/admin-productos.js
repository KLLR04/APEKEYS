/* ===========================================================================
   admin-productos.js  —  Mantenedor de productos (solo administrador)
   ---------------------------------------------------------------------------
   El CRUD vive dentro del panel de administración (admin.html#inventario),
   no en el catálogo público. Así la tienda queda limpia y la gestión
   queda toda bajo /admin.
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var app = window.APEKEYS;
  var V = window.APEKEYS_VALIDA;

  var MAX_IMAGEN_BYTES = 400 * 1024; // 400 KB: el localStorage es pequeño

  document.addEventListener("DOMContentLoaded", function () {
    if (
      !document.getElementById("productForm") ||
      !store.session() ||
      store.session().rol !== "admin"
    )
      return;

    var productos = store.products();

    var panel = document.getElementById("productPanel");
    var form = document.getElementById("productForm");
    var tbody = document.querySelector("[data-product-table] tbody");
    var buscador = document.getElementById("adminSearch");
    var filtroEstado = document.getElementById("adminEstado");
    var contador = document.querySelector("[data-admin-count]");

    /* Campos de imagen: el admin elige entre pegar una URL o subir un
       archivo desde su computador. */
    var inputUrl = form.elements.imagenUrl;
    var inputArchivo = form.elements.imagenArchivo;
    var preview = document.querySelector("[data-image-preview]");
    var previewVacio = document.querySelector("[data-image-empty]");
    var radiosOrigen = Array.from(form.querySelectorAll('input[name="origenImagen"]'));
    var bloqueUrl = document.querySelector("[data-bloque-url]");
    var bloqueArchivo = document.querySelector("[data-bloque-archivo]");
    var leyendoImagen = false;
    var imagenActual = ""; // guarda la imagen resuelta (URL o base64)

    var reglas = {
      codigo: function (v) {
        var base = V.requerido(v, "El código", null, 3);
        if (base) return base;
        if (!/^[A-Za-z0-9-]+$/.test(v.trim()))
          return "El código solo admite letras, números y guiones.";
        var id = Number(form.elements.productId.value) || null;
        var repetido = productos.some(function (p) {
          return p.codigo.toLowerCase() === v.trim().toLowerCase() && p.id !== id;
        });
        return repetido ? "Ya existe otro producto con ese código." : null;
      },
      nombre: function (v) {
        var base = V.requerido(v, "El nombre", 100, 3);
        if (base) return base;
        var id = Number(form.elements.productId.value) || null;
        var repetido = productos.some(function (p) {
          return p.nombre.toLowerCase() === v.trim().toLowerCase() && p.id !== id;
        });
        return repetido ? "Ya existe otro producto con ese nombre." : null;
      },
      categoria: function (v) {
        return v ? null : "Selecciona una categoría.";
      },
      plataforma: function (v) {
        return v ? null : "Selecciona una plataforma.";
      },
      precio: V.precio,
      stock: function (v) {
        return V.stock(v, "El stock");
      },
      stockCritico: function (v) {
        return v.trim() ? V.stock(v, "El stock crítico") : null;
      },
      descripcion: function (v) {
        return V.opcional(v, "La descripción", 500);
      },
      imagenUrl: function (v) {
        var origen = form.querySelector('input[name="origenImagen"]:checked').value;
        if (origen !== "url") return null;
        return V.urlImagen(v);
      },
    };

    Object.keys(reglas).forEach(function (nombre) {
      V.enlazar(form.elements[nombre], reglas[nombre]);
    });

    /* ------------------- Tabla del inventario ------------------- */
    function dibujar() {
      var termino = buscador.value.trim().toLowerCase();
      var estado = filtroEstado.value;

      var visibles = productos
        .filter(function (p) {
          var coincideTexto =
            !termino ||
            [p.codigo, p.nombre, p.categoria, p.plataforma]
              .join(" ")
              .toLowerCase()
              .indexOf(termino) !== -1;
          var coincideEstado =
            estado === "" ||
            (estado === "activo" && p.activo) ||
            (estado === "inactivo" && !p.activo) ||
            (estado === "critico" && p.stock <= p.stockCritico);
          return coincideTexto && coincideEstado;
        })
        .sort(function (a, b) {
          return a.nombre.localeCompare(b.nombre, "es");
        });

      contador.textContent =
        visibles.length === 1 ? "1 producto listado" : visibles.length + " productos listados";

      tbody.replaceChildren();

      if (!visibles.length) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.colSpan = 7;
        td.className = "empty-state";
        td.textContent = productos.length
          ? "Ningún producto coincide con el filtro."
          : "Todavía no hay productos. Crea el primero con el botón Nuevo producto.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }

      visibles.forEach(function (p) {
        var tr = document.createElement("tr");

        [p.codigo, p.nombre, p.categoria, app.formatCLP(p.precio)].forEach(function (valor) {
          var td = document.createElement("td");
          td.textContent = valor;
          tr.appendChild(td);
        });

        /* Stock con aviso visual cuando está en nivel crítico */
        var tdStock = document.createElement("td");
        tdStock.textContent = String(p.stock);
        if (p.stock <= 0) tdStock.className = "stock-cero";
        else if (p.stock <= p.stockCritico) tdStock.className = "stock-bajo";
        tr.appendChild(tdStock);

        /* Columna Activo: es la que faltaba, y es la que explica el KPI
           "Productos activos" del panel de control. */
        var tdEstado = document.createElement("td");
        var badge = document.createElement("span");
        badge.className = "badge " + (p.activo ? "text-bg-success" : "text-bg-secondary");
        badge.textContent = p.activo ? "Activo" : "Inactivo";
        tdEstado.appendChild(badge);
        tr.appendChild(tdEstado);

        var acciones = document.createElement("td");
        acciones.className = "actions";

        var editar = document.createElement("button");
        editar.type = "button";
        editar.className = "btn btn-secondary btn-sm";
        editar.textContent = "Editar";
        editar.addEventListener("click", function () {
          abrir(p.id);
        });

        /* Activar/desactivar sin borrar: útil para sacar un juego de la
           tienda sin perder su historial de ventas. */
        var alternar = document.createElement("button");
        alternar.type = "button";
        alternar.className = "btn btn-secondary btn-sm";
        alternar.textContent = p.activo ? "Desactivar" : "Activar";
        alternar.addEventListener("click", function () {
          p.activo = !p.activo;
          guardar(p.activo ? "Producto activado" : "Producto desactivado");
        });

        var eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "btn btn-danger btn-sm";
        eliminar.textContent = "Eliminar";
        eliminar.addEventListener("click", function () {
          app.confirmar(
            "Eliminar producto",
            '¿Eliminar definitivamente "' + p.nombre + '"? Esta acción no se puede deshacer.',
            function () {
              productos = productos.filter(function (x) {
                return x.id !== p.id;
              });
              cerrar();
              guardar("Producto eliminado");
            },
          );
        });

        acciones.append(editar, alternar, eliminar);
        tr.appendChild(acciones);
        tbody.appendChild(tr);
      });
    }

    function guardar(mensaje) {
      if (!store.saveProducts(productos)) {
        app.showToast("No se pudo guardar: el almacenamiento del navegador está lleno.", true);
        return;
      }
      dibujar();
      document.dispatchEvent(new Event("products-updated"));
      app.showToast(mensaje);
      return true;
    }

    /* ------------------- Formulario ------------------- */
    function actualizarPreview(src) {
      imagenActual = src || "";
      if (imagenActual) {
        preview.src = imagenActual;
        preview.classList.remove("hidden");
        previewVacio.classList.add("hidden");
      } else {
        preview.removeAttribute("src");
        preview.classList.add("hidden");
        previewVacio.classList.remove("hidden");
      }
    }

    function aplicarOrigen() {
      var origen = form.querySelector('input[name="origenImagen"]:checked').value;
      bloqueUrl.classList.toggle("hidden", origen !== "url");
      bloqueArchivo.classList.toggle("hidden", origen !== "archivo");
    }

    radiosOrigen.forEach(function (r) {
      r.addEventListener("change", aplicarOrigen);
    });

    inputUrl.addEventListener("input", function () {
      if (form.querySelector('input[name="origenImagen"]:checked').value !== "url") return;
      var valor = inputUrl.value.trim();
      if (!valor || V.urlImagen(valor)) {
        actualizarPreview("");
        return;
      }
      actualizarPreview(valor);
    });

    /* Subida de imagen: leemos el archivo con FileReader y lo guardamos
       como data URL. No hay servidor donde alojar archivos, así que la
       imagen viaja dentro del propio localStorage; por eso el límite. */
    inputArchivo.addEventListener("change", function () {
      var archivo = inputArchivo.files && inputArchivo.files[0];
      var aviso = document.querySelector("[data-file-error]");
      aviso.textContent = "";

      if (!archivo) return;

      if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(archivo.type)) {
        aviso.textContent = "El archivo debe ser una imagen PNG, JPG, WEBP o GIF.";
        inputArchivo.value = "";
        return;
      }
      if (archivo.size > MAX_IMAGEN_BYTES) {
        aviso.textContent =
          "La imagen pesa " +
          Math.round(archivo.size / 1024) +
          " KB. El máximo es 400 KB; comprímela o usa una URL.";
        inputArchivo.value = "";
        return;
      }

      leyendoImagen = true;
      var lector = new FileReader();
      lector.onload = function () {
        leyendoImagen = false;
        actualizarPreview(String(lector.result));
      };
      lector.onerror = function () {
        leyendoImagen = false;
        aviso.textContent = "No pudimos leer el archivo. Intenta con otro.";
      };
      lector.readAsDataURL(archivo);
    });

    function abrir(id) {
      var p = id
        ? productos.find(function (x) {
            return x.id === id;
          })
        : null;

      form.reset();
      form.querySelectorAll(".field-error").forEach(function (n) {
        n.textContent = "";
      });
      form.querySelectorAll(".is-invalid").forEach(function (n) {
        n.classList.remove("is-invalid");
      });

      form.elements.productId.value = p ? p.id : "";
      form.elements.codigo.value = p ? p.codigo : "";
      form.elements.nombre.value = p ? p.nombre : "";
      form.elements.categoria.value = p ? p.categoria : "";
      form.elements.plataforma.value = p ? p.plataforma : "";
      // Precio y stock quedan VACÍOS en un producto nuevo: hay que
      // escribirlos a propósito, no heredar un 0 por defecto.
      form.elements.precio.value = p ? p.precio : "";
      form.elements.stock.value = p ? p.stock : "";
      form.elements.stockCritico.value = p ? p.stockCritico : "";
      form.elements.descripcion.value = p ? p.descripcion : "";
      form.elements.activo.checked = p ? p.activo : true;

      var esArchivo = p && p.imagen && p.imagen.indexOf("data:image/") === 0;
      form.querySelector(
        'input[name="origenImagen"][value="' + (esArchivo ? "archivo" : "url") + '"]',
      ).checked = true;
      inputUrl.value = p && !esArchivo ? p.imagen : "";
      inputArchivo.value = "";
      document.querySelector("[data-file-error]").textContent = "";
      aplicarOrigen();
      actualizarPreview(p ? p.imagen : "");

      document.querySelector("[data-form-title]").textContent = p
        ? "Editar producto"
        : "Nuevo producto";
      panel.classList.remove("hidden");
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      form.elements.codigo.focus();
    }

    function cerrar() {
      panel.classList.add("hidden");
      form.reset();
    }

    document.querySelector("[data-new-product]").addEventListener("click", function () {
      abrir(null);
    });
    document.querySelector("[data-cancel-product]").addEventListener("click", cerrar);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var caja = form.querySelector("[data-form-message]");
      caja.textContent = "";
      caja.className = "alert hidden";

      if (leyendoImagen) {
        app.showToast("Espera a que termine de cargar la imagen.", true);
        return;
      }
      if (!V.validarFormulario(form, reglas)) {
        caja.textContent = "Revisa los campos marcados en rojo.";
        caja.className = "alert alert-danger";
        return;
      }

      var id = Number(form.elements.productId.value) || null;
      var datos = {
        id:
          id ||
          (productos.length
            ? Math.max.apply(
                null,
                productos.map(function (p) {
                  return p.id;
                }),
              ) + 1
            : 1),
        codigo: form.elements.codigo.value.trim(),
        nombre: form.elements.nombre.value.trim(),
        categoria: form.elements.categoria.value,
        plataforma: form.elements.plataforma.value,
        precio: Number(form.elements.precio.value),
        stock: Number(form.elements.stock.value),
        stockCritico: Number(form.elements.stockCritico.value),
        descripcion: form.elements.descripcion.value.trim(),
        imagen:
          (form.querySelector('input[name="origenImagen"]:checked').value === "url"
            ? inputUrl.value.trim()
            : imagenActual) || "img/logo.png",
        activo: form.elements.activo.checked,
      };

      var copia = productos.slice();
      if (id) {
        productos[
          productos.findIndex(function (p) {
            return p.id === id;
          })
        ] = datos;
      } else {
        productos.push(datos);
      }

      if (guardar(id ? "Producto actualizado" : "Producto creado")) cerrar();
      else productos = copia;
    });

    buscador.addEventListener("input", dibujar);
    filtroEstado.addEventListener("change", dibujar);
    dibujar();
  });
})();
