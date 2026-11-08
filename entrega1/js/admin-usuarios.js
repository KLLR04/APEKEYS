/* ===========================================================================
   admin-usuarios.js  —  Mantenedor de usuarios (solo administrador)
   ---------------------------------------------------------------------------
   El documento de requisitos pide un mantenedor tanto de productos como de
   usuarios, con RUN validado, roles (Administrador, Cliente, Vendedor) y
   región/comuna encadenadas.
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var app = window.APEKEYS;
  var V = window.APEKEYS_VALIDA;

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page !== "admin-users") return;

    if (!store.session() || store.session().rol !== "admin") return;
    var usuarios = store.users();
    var sesion = store.session();

    var panel = document.getElementById("userPanel");
    var form = document.getElementById("userForm");
    var tbody = document.querySelector("[data-user-table] tbody");
    var buscador = document.getElementById("userSearch");
    var filtroRol = document.getElementById("userRol");
    var contador = document.querySelector("[data-user-count]");

    window.APEKEYS_AUTH.llenarRegiones(form.elements.region, form.elements.comuna);

    var reglas = {
      run: function (v) {
        var base = V.run(v);
        if (base) return base;
        var id = Number(form.elements.userId.value) || null;
        var repetido = usuarios.some(function (u) {
          return V.normalizarRun(u.run) === V.normalizarRun(v) && u.id !== id;
        });
        return repetido ? "Ya existe otro usuario con ese RUN." : null;
      },
      nombre: function (v) {
        return V.requerido(v, "El nombre", 50, 2);
      },
      apellidos: function (v) {
        return V.requerido(v, "Los apellidos", 100, 2);
      },
      email: function (v) {
        var base = V.correo(v);
        if (base) return base;
        var id = Number(form.elements.userId.value) || null;
        var repetido = usuarios.some(function (u) {
          return u.email.toLowerCase() === v.trim().toLowerCase() && u.id !== id;
        });
        return repetido ? "Ya existe otro usuario con ese correo." : null;
      },
      password: function (v) {
        // Al editar se puede dejar en blanco para conservar la actual.
        if (form.elements.userId.value && !v) return null;
        return V.password(v);
      },
      rol: function (v) {
        return v ? null : "Selecciona el tipo de usuario.";
      },
      fechaNacimiento: V.fechaNacimiento,
      region: function (v) {
        return v ? null : "Selecciona una región.";
      },
      comuna: function (v) {
        return v ? null : "Selecciona una comuna.";
      },
      direccion: function (v) {
        return V.requerido(v, "La dirección", 300, 5);
      },
    };

    Object.keys(reglas).forEach(function (nombre) {
      V.enlazar(form.elements[nombre], reglas[nombre]);
    });

    function dibujar() {
      var termino = buscador.value.trim().toLowerCase();
      var rol = filtroRol.value;

      var visibles = usuarios
        .filter(function (u) {
          var coincideTexto =
            !termino ||
            [u.run, u.nombre, u.apellidos, u.email, u.comuna]
              .join(" ")
              .toLowerCase()
              .indexOf(termino) !== -1;
          return coincideTexto && (!rol || u.rol === rol);
        })
        .sort(function (a, b) {
          return a.apellidos.localeCompare(b.apellidos, "es");
        });

      contador.textContent =
        visibles.length === 1 ? "1 usuario listado" : visibles.length + " usuarios listados";

      tbody.replaceChildren();

      if (!visibles.length) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.colSpan = 7;
        td.className = "empty-state";
        td.textContent = "Ningún usuario coincide con el filtro.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }

      visibles.forEach(function (u) {
        var tr = document.createElement("tr");

        [
          u.run,
          u.nombre + " " + u.apellidos,
          u.email,
          [u.comuna, u.region].filter(Boolean).join(", ") || "Sin registrar",
        ].forEach(function (valor) {
          var td = document.createElement("td");
          td.textContent = valor;
          tr.appendChild(td);
        });

        var tdRol = document.createElement("td");
        var badgeRol = document.createElement("span");
        badgeRol.className =
          "badge " +
          (u.rol === "admin"
            ? "text-bg-warning"
            : u.rol === "vendedor"
              ? "text-bg-info"
              : "text-bg-secondary");
        badgeRol.textContent = app.etiquetaRol(u.rol);
        tdRol.appendChild(badgeRol);
        tr.appendChild(tdRol);

        var tdEstado = document.createElement("td");
        var badge = document.createElement("span");
        badge.className = "badge " + (u.activo ? "text-bg-success" : "text-bg-secondary");
        badge.textContent = u.activo ? "Activo" : "Inactivo";
        tdEstado.appendChild(badge);
        tr.appendChild(tdEstado);

        var acciones = document.createElement("td");
        acciones.className = "actions";

        var editar = document.createElement("button");
        editar.type = "button";
        editar.className = "btn btn-secondary btn-sm";
        editar.textContent = "Editar";
        editar.addEventListener("click", function () {
          abrir(u.id);
        });
        acciones.appendChild(editar);

        /* Nadie puede desactivarse ni borrarse a sí mismo: si el único
           administrador se elimina, el sistema queda sin acceso. */
        var esYo = sesion && sesion.id === u.id;

        var alternar = document.createElement("button");
        alternar.type = "button";
        alternar.className = "btn btn-secondary btn-sm";
        alternar.textContent = u.activo ? "Desactivar" : "Activar";
        alternar.disabled = esYo;
        alternar.title = esYo ? "No puedes desactivar tu propia cuenta" : "";
        alternar.addEventListener("click", function () {
          if (u.activo && esUltimoAdmin(u)) {
            app.showToast("Debe quedar al menos un administrador activo.", true);
            return;
          }
          u.activo = !u.activo;
          guardar(u.activo ? "Usuario activado" : "Usuario desactivado");
        });
        acciones.appendChild(alternar);

        var eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "btn btn-danger btn-sm";
        eliminar.textContent = "Eliminar";
        eliminar.disabled = esYo;
        eliminar.title = esYo ? "No puedes eliminar tu propia cuenta" : "";
        eliminar.addEventListener("click", function () {
          if (esUltimoAdmin(u)) {
            app.showToast("Debe quedar al menos un administrador activo.", true);
            return;
          }
          app.confirmar(
            "Eliminar usuario",
            "¿Eliminar la cuenta de " +
              u.nombre +
              " " +
              u.apellidos +
              "? Esta acción no se puede deshacer.",
            function () {
              usuarios = usuarios.filter(function (x) {
                return x.id !== u.id;
              });
              cerrar();
              guardar("Usuario eliminado");
            },
          );
        });
        acciones.appendChild(eliminar);

        tr.appendChild(acciones);
        tbody.appendChild(tr);
      });
    }

    function esUltimoAdmin(usuario) {
      if (usuario.rol !== "admin") return false;
      var activos = usuarios.filter(function (u) {
        return u.rol === "admin" && u.activo;
      });
      return activos.length <= 1;
    }

    function guardar(mensaje) {
      if (!store.saveUsers(usuarios)) {
        app.showToast("No se pudo guardar el usuario.", true);
        return;
      }
      dibujar();
      app.showToast(mensaje);
    }

    function abrir(id) {
      var u = id
        ? usuarios.find(function (x) {
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

      form.elements.userId.value = u ? u.id : "";
      form.elements.run.value = u ? u.run : "";
      form.elements.nombre.value = u ? u.nombre : "";
      form.elements.apellidos.value = u ? u.apellidos : "";
      form.elements.email.value = u ? u.email : "";
      form.elements.password.value = "";
      form.elements.rol.value = u ? u.rol : "cliente";
      form.elements.fechaNacimiento.value = u ? u.fechaNacimiento || "" : "";
      form.elements.direccion.value = u ? u.direccion : "";
      form.elements.activo.checked = u ? u.activo : true;

      window.APEKEYS_AUTH.llenarRegiones(
        form.elements.region,
        form.elements.comuna,
        u ? u.region : "",
        u ? u.comuna : "",
      );

      document.querySelector("[data-user-form-title]").textContent = u
        ? "Editar usuario"
        : "Nuevo usuario";
      document.querySelector("[data-password-hint]").textContent = u
        ? "Déjala en blanco para conservar la contraseña actual."
        : "Entre 4 y 10 caracteres.";

      panel.classList.remove("hidden");
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      form.elements.run.focus();
    }

    function cerrar() {
      panel.classList.add("hidden");
      form.reset();
    }

    document.querySelector("[data-new-user]").addEventListener("click", function () {
      abrir(null);
    });
    document.querySelector("[data-cancel-user]").addEventListener("click", cerrar);

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

      var id = Number(form.elements.userId.value) || null;
      var anterior = id
        ? usuarios.find(function (u) {
            return u.id === id;
          })
        : null;

      if (
        anterior &&
        anterior.id === sesion.id &&
        (!form.elements.activo.checked || form.elements.rol.value !== "admin")
      ) {
        V.pintarError(form.elements.rol, "Conserva tu propia cuenta activa como administrador.");
        return;
      }
      if (anterior && esUltimoAdmin(anterior) && !form.elements.activo.checked) {
        V.pintarError(form.elements.rol, "Debe quedar un administrador activo.");
        return;
      }
      // No dejamos que el último admin se degrade a cliente y bloquee el sistema.
      if (
        anterior &&
        anterior.rol === "admin" &&
        form.elements.rol.value !== "admin" &&
        esUltimoAdmin(anterior)
      ) {
        V.pintarError(form.elements.rol, "Debe quedar al menos un administrador activo.");
        return;
      }

      var datos = {
        id:
          id ||
          (usuarios.length
            ? Math.max.apply(
                null,
                usuarios.map(function (u) {
                  return u.id;
                }),
              ) + 1
            : 1),
        run: V.normalizarRun(form.elements.run.value),
        nombre: form.elements.nombre.value.trim(),
        apellidos: form.elements.apellidos.value.trim(),
        email: form.elements.email.value.trim().toLowerCase(),
        password: form.elements.password.value || (anterior ? anterior.password : ""),
        rol: form.elements.rol.value,
        fechaNacimiento: form.elements.fechaNacimiento.value || "",
        region: form.elements.region.value,
        comuna: form.elements.comuna.value,
        direccion: form.elements.direccion.value.trim(),
        activo: form.elements.activo.checked,
      };

      if (id) {
        usuarios[
          usuarios.findIndex(function (u) {
            return u.id === id;
          })
        ] = datos;
      } else {
        usuarios.push(datos);
      }

      cerrar();
      guardar(id ? "Usuario actualizado" : "Usuario creado");
    });

    buscador.addEventListener("input", dibujar);
    filtroRol.addEventListener("change", dibujar);
    dibujar();
  });
})();
