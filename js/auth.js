/* ===========================================================================
   auth.js  —  Inicio de sesión y registro de usuarios
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var V = window.APEKEYS_VALIDA;

  function mostrarMensaje(form, texto, tipo) {
    var caja = form.querySelector("[data-form-message]");
    caja.textContent = texto;
    caja.className = "alert alert-" + (tipo || "error");
  }

  function limpiarMensaje(form) {
    var caja = form.querySelector("[data-form-message]");
    caja.textContent = "";
    caja.className = "alert hidden";
  }

  /* Destino seguro tras iniciar sesión: solo se acepta una página interna
     del propio sitio, nunca una URL externa que venga en el parámetro. */
  function destinoSeguro(rolUsuario) {
    var next = new URLSearchParams(location.search).get("next");
    if (next && /^[a-zA-Z0-9_-]+\.html(\?[^#]*)?$/.test(next)) return next;
    if (rolUsuario === "admin" || rolUsuario === "vendedor") return "admin.html";
    return "index.html";
  }

  /* =================================================================
     LOGIN
     ================================================================= */
  function initLogin() {
    var form = document.getElementById("loginForm");
    if (!form) return;

    var nextParam = new URLSearchParams(location.search).get("next");
    var registerLink = document.querySelector('a[href="registro.html"]');
    if (registerLink && nextParam)
      registerLink.href = "registro.html?next=" + encodeURIComponent(nextParam);
    var sesion = store.session();
    if (sesion) {
      location.replace(destinoSeguro(sesion.rol));
      return;
    }

    V.enlazar(form.elements.email, V.correo);
    V.enlazar(form.elements.password, V.password);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      limpiarMensaje(form);

      var ok = V.validarFormulario(form, { email: V.correo, password: V.password });
      if (!ok) return;

      var email = form.elements.email.value.trim().toLowerCase();
      var password = form.elements.password.value;

      var user = store.users().find(function (u) {
        return u.email.toLowerCase() === email && u.password === password;
      });

      if (!user) {
        // Mensaje genérico a propósito: no revelamos si el correo existe.
        mostrarMensaje(form, "Correo o contraseña incorrectos.");
        form.elements.password.value = "";
        form.elements.password.focus();
        return;
      }

      if (!user.activo) {
        mostrarMensaje(form, "Esta cuenta está desactivada. Contacta al administrador.");
        return;
      }

      store.saveSession({
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
      });
      location.href = destinoSeguro(user.rol);
    });
  }

  /* =================================================================
     REGISTRO DE CLIENTES
     Mismos campos que el mantenedor de usuarios del administrador,
     pero el rol siempre queda como "cliente".
     ================================================================= */
  function initRegistro() {
    var form = document.getElementById("registroForm");
    if (!form) return;

    if (store.session()) {
      location.replace("index.html");
      return;
    }

    llenarRegiones(form.elements.region, form.elements.comuna);
    // Reglas campo por campo, reutilizadas en tiempo real y al enviar.
    var reglas = {
      run: V.run,
      nombre: function (v) {
        return V.requerido(v, "El nombre", 50, 2);
      },
      apellidos: function (v) {
        return V.requerido(v, "Los apellidos", 100, 2);
      },
      email: V.correo,
      password: V.password,
      password2: function (v) {
        if (!v) return "Repite la contraseña.";
        if (v !== form.elements.password.value) return "Las contraseñas no coinciden.";
        return null;
      },
      fechaNacimiento: V.fechaManual,
      region: function (v) {
        return V.requerido(v, "La región");
      },
      comuna: function (v) {
        return V.requerido(v, "La comuna");
      },
      direccion: function (v) {
        return V.requerido(v, "La dirección", 300);
      },
    };

    Object.keys(reglas).forEach(function (nombre) {
      V.enlazar(form.elements[nombre], reglas[nombre]);
    });

    /* Ayuda al escribir la fecha: vamos poniendo las barras solas para que
       el usuario solo tenga que teclear los números. */
    form.elements.fechaNacimiento.addEventListener("input", function (e) {
      var campo = e.target;
      var soloNumeros = campo.value.replace(/\D/g, "").slice(0, 8);
      var partes = [];
      if (soloNumeros.length > 0) partes.push(soloNumeros.slice(0, 2));
      if (soloNumeros.length > 2) partes.push(soloNumeros.slice(2, 4));
      if (soloNumeros.length > 4) partes.push(soloNumeros.slice(4, 8));
      campo.value = partes.join("/");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      limpiarMensaje(form);

      if (!V.validarFormulario(form, reglas)) {
        mostrarMensaje(form, "Revisa los campos marcados en rojo.");
        return;
      }

      var usuarios = store.users();
      var run = V.normalizarRun(form.elements.run.value);
      var email = form.elements.email.value.trim().toLowerCase();

      // Unicidad: ni el RUN ni el correo pueden repetirse.
      if (
        usuarios.some(function (u) {
          return V.normalizarRun(u.run) === run;
        })
      ) {
        V.pintarError(form.elements.run, "Ya existe una cuenta registrada con ese RUN.");
        form.elements.run.focus();
        return;
      }
      if (
        usuarios.some(function (u) {
          return u.email.toLowerCase() === email;
        })
      ) {
        V.pintarError(form.elements.email, "Ya existe una cuenta con ese correo.");
        form.elements.email.focus();
        return;
      }

      var nuevo = {
        id: usuarios.length
          ? Math.max.apply(
              null,
              usuarios.map(function (u) {
                return u.id;
              }),
            ) + 1
          : 1,
        run: run,
        nombre: form.elements.nombre.value.trim(),
        apellidos: form.elements.apellidos.value.trim(),
        email: email,
        password: form.elements.password.value,
        rol: "cliente", // el registro público siempre crea clientes
        fechaNacimiento: V.fechaManualAIso(form.elements.fechaNacimiento.value),
        // Estos datos los completa el administrador desde el mantenedor.
        region: form.elements.region.value,
        comuna: form.elements.comuna.value,
        direccion: form.elements.direccion.value.trim(),
        activo: true,
      };

      usuarios.push(nuevo);
      if (!store.saveUsers(usuarios)) {
        mostrarMensaje(
          form,
          "No pudimos guardar la cuenta. Libera espacio del navegador e inténtalo otra vez.",
        );
        return;
      }

      // Entramos directo con la cuenta recién creada.
      store.saveSession({
        id: nuevo.id,
        nombre: nuevo.nombre,
        apellidos: nuevo.apellidos,
        email: nuevo.email,
        rol: nuevo.rol,
      });
      location.href = destinoSeguro(nuevo.rol);
    });
  }

  /* Selects encadenados: al cambiar la región se recargan sus comunas. */
  function llenarRegiones(selectRegion, selectComuna, regionActual, comunaActual) {
    if (!selectRegion || !selectComuna) return;

    selectRegion.replaceChildren();
    var vacio = document.createElement("option");
    vacio.value = "";
    vacio.textContent = "Selecciona una región";
    selectRegion.appendChild(vacio);

    store.regiones.forEach(function (r) {
      var opt = document.createElement("option");
      opt.value = r.nombre;
      opt.textContent = r.nombre;
      selectRegion.appendChild(opt);
    });

    function cargarComunas(nombreRegion, seleccionada) {
      selectComuna.replaceChildren();
      var base = document.createElement("option");
      base.value = "";
      base.textContent = nombreRegion ? "Selecciona una comuna" : "Primero elige una región";
      selectComuna.appendChild(base);

      var region = store.regiones.find(function (r) {
        return r.nombre === nombreRegion;
      });
      if (!region) {
        selectComuna.disabled = true;
        return;
      }

      selectComuna.disabled = false;
      region.comunas.forEach(function (c) {
        var opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        selectComuna.appendChild(opt);
      });
      if (seleccionada) selectComuna.value = seleccionada;
    }

    selectRegion.onchange = function () {
      cargarComunas(selectRegion.value, null);
    };

    if (regionActual) {
      selectRegion.value = regionActual;
      cargarComunas(regionActual, comunaActual);
    } else {
      cargarComunas("", null);
    }
  }

  // El mantenedor de usuarios del admin reutiliza los selects encadenados.
  window.APEKEYS_AUTH = { llenarRegiones: llenarRegiones };

  document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    initRegistro();
  });
})();
