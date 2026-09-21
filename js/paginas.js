/* ===========================================================================
   paginas.js  —  Contacto y Blogs
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var app = window.APEKEYS;
  var V = window.APEKEYS_VALIDA;

  /* =================== CONTACTO =================== */
  function initContacto() {
    var form = document.getElementById("contactoForm");
    if (!form) return;

    var contador = document.querySelector("[data-char-count]");

    var reglas = {
      nombre: function (v) {
        return V.requerido(v, "El nombre", 100, 3);
      },
      email: function (v) {
        return v.trim() ? V.correo(v) : null;
      },
      comentario: function (v) {
        return V.requerido(v, "El comentario", 500);
      },
    };

    Object.keys(reglas).forEach(function (nombre) {
      V.enlazar(form.elements[nombre], reglas[nombre]);
    });

    /* Contador de caracteres en vivo: la pauta pide sugerencias dinámicas
       que ayuden al usuario mientras escribe. */
    form.elements.comentario.addEventListener("input", function () {
      var usados = form.elements.comentario.value.length;
      contador.textContent = usados + " / 500 caracteres";
      contador.classList.toggle("contador-alto", usados > 450);
    });

    // Si hay sesión iniciada, precargamos nombre y correo.
    var sesion = store.session();
    if (sesion) {
      form.elements.nombre.value = sesion.nombre + " " + (sesion.apellidos || "");
      form.elements.email.value = sesion.email;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var caja = form.querySelector("[data-form-message]");
      caja.textContent = "";
      caja.className = "alert hidden";

      if (!V.validarFormulario(form, reglas)) {
        caja.textContent = "Revisa los campos marcados en rojo.";
        caja.className = "alert alert-danger";
        return;
      }

      var mensajes = store.messages();
      mensajes.push({
        id: mensajes.length
          ? Math.max.apply(
              null,
              mensajes.map(function (m) {
                return m.id;
              }),
            ) + 1
          : 1,
        nombre: form.elements.nombre.value.trim(),
        email: form.elements.email.value.trim().toLowerCase(),
        comentario: form.elements.comentario.value.trim(),
        fecha: new Date().toISOString(),
      });
      store.saveMessages(mensajes);

      caja.textContent = "Mensaje guardado en esta demostración.";
      caja.className = "alert alert-success";
      form.reset();
      contador.textContent = "0 / 500 caracteres";
      app.showToast("Mensaje guardado");
    });
  }

  /* =================== BLOGS =================== */
  function initBlogs() {
    var lista = document.querySelector("[data-blog-list]");
    if (!lista) return;

    store.blogs.forEach(function (b) {
      var article = document.createElement("article");
      article.className = "card blog-card";

      var img = document.createElement("img");
      img.src = b.imagen;
      img.alt = "Imagen del artículo " + b.titulo;
      img.loading = "lazy";

      var body = document.createElement("div");
      body.className = "blog-body";

      var fecha = document.createElement("span");
      fecha.className = "eyebrow";
      fecha.textContent = new Date(b.fecha).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      var titulo = document.createElement("h2");
      titulo.textContent = b.titulo;

      var resumen = document.createElement("p");
      resumen.className = "muted";
      resumen.textContent = b.resumen;

      var link = document.createElement("a");
      link.className = "btn btn-secondary btn-sm";
      link.href = "blog-detalle.html?id=" + b.id;
      link.textContent = "Ver caso";

      body.append(fecha, titulo, resumen, link);
      article.append(img, body);
      lista.appendChild(article);
    });
  }

  function initBlogDetalle() {
    var contenedor = document.querySelector("[data-blog-detail]");
    if (!contenedor) return;

    var id = Number(new URLSearchParams(location.search).get("id"));
    var blog = store.blogs.find(function (b) {
      return b.id === id;
    });

    if (!blog) {
      contenedor.innerHTML =
        '<div class="card empty-state"><h2>Artículo no encontrado</h2>' +
        "<p>Puede que el enlace esté mal escrito.</p>" +
        '<a class="btn btn-primary" href="blogs.html">Volver al blog</a></div>';
      return;
    }

    document.title = blog.titulo + " | APEKEYS";

    var img = document.createElement("img");
    img.src = blog.imagen;
    img.alt = "Imagen del artículo " + blog.titulo;
    img.className = "blog-hero";

    var fecha = document.createElement("span");
    fecha.className = "eyebrow";
    fecha.textContent = new Date(blog.fecha).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    var titulo = document.createElement("h1");
    titulo.textContent = blog.titulo;

    var prosa = document.createElement("div");
    prosa.className = "prose";
    blog.contenido.forEach(function (parrafo) {
      var p = document.createElement("p");
      p.textContent = parrafo;
      prosa.appendChild(p);
    });

    contenedor.append(img, fecha, titulo, prosa);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.dataset.page;
    if (page === "contacto") initContacto();
    if (page === "blogs") initBlogs();
    if (page === "blog-detalle") initBlogDetalle();
  });
})();
