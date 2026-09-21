/* ===========================================================================
   admin.js  —  Panel de control (resumen)
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var app = window.APEKEYS;

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page !== "admin") return;

    var session = store.session();
    if (!session || !["admin", "vendedor"].includes(session.rol)) return;

    function refresh() {
      var productos = store.products();
      var usuarios = store.users();
      var ordenes = store.orders();
      var bajoStock = productos.filter(function (p) {
        return p.stock <= p.stockCritico;
      });

      document.querySelector("[data-admin-name]").textContent = session.nombre;
      document.querySelector("[data-admin-role]").textContent = app.etiquetaRol(session.rol);
      document.querySelector("[data-total-products]").textContent = String(productos.length);
      document.querySelector("[data-active-products]").textContent = String(
        productos.filter(function (p) {
          return p.activo;
        }).length,
      );
      document.querySelector("[data-low-stock]").textContent = String(bajoStock.length);
      document.querySelector("[data-total-users]").textContent = String(usuarios.length);

      var ventas = ordenes.reduce(function (sum, o) {
        return sum + o.total;
      }, 0);
      document.querySelector("[data-total-orders]").textContent = String(ordenes.length);
      document.querySelector("[data-total-sales]").textContent = app.formatCLP(ventas);

      /* El vendedor no puede administrar: solo consultar. Ocultamos las
       acciones de mantenedor según el rol. */
      if (session.rol !== "admin") {
        document.querySelectorAll("[data-only-admin]").forEach(function (n) {
          n.classList.add("hidden");
        });
      }

      /* --------- Tabla de alertas de stock --------- */
      var tbody = document.querySelector("[data-admin-products]");
      var filas = bajoStock.length ? bajoStock : productos.slice(0, 5);
      tbody.replaceChildren();

      if (!filas.length) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.colSpan = 6;
        td.className = "empty-state";
        td.textContent = "Todavía no hay productos registrados.";
        tr.appendChild(td);
        tbody.appendChild(tr);
      }

      filas.forEach(function (p) {
        var tr = document.createElement("tr");
        [p.codigo, p.nombre, p.categoria, String(p.stock), String(p.stockCritico)].forEach(
          function (valor) {
            var td = document.createElement("td");
            td.textContent = valor;
            tr.appendChild(td);
          },
        );

        var estado = document.createElement("td");
        var badge = document.createElement("span");
        if (p.stock <= 0) {
          badge.className = "badge text-bg-danger";
          badge.textContent = "Sin stock";
        } else if (p.stock <= p.stockCritico) {
          badge.className = "badge text-bg-warning";
          badge.textContent = "Stock crítico";
        } else {
          badge.className = "badge text-bg-success";
          badge.textContent = "Disponible";
        }
        estado.appendChild(badge);
        tr.appendChild(estado);
        tbody.appendChild(tr);
      });

      /* --------- Últimas órdenes --------- */
      var ordenesBody = document.querySelector("[data-admin-orders]");
      if (ordenesBody) {
        ordenesBody.replaceChildren();
        var ultimas = ordenes.slice().reverse();

        if (!ultimas.length) {
          var trVacio = document.createElement("tr");
          var tdVacio = document.createElement("td");
          tdVacio.colSpan = 6;
          tdVacio.className = "empty-state";
          tdVacio.textContent =
            "Aún no se registran compras. Haz una desde la tienda para verla aquí.";
          trVacio.appendChild(tdVacio);
          ordenesBody.appendChild(trVacio);
        }

        ultimas.forEach(function (o) {
          var tr = document.createElement("tr");
          var unidades = o.detalle.reduce(function (s, d) {
            return s + d.cantidad;
          }, 0);

          ["#" + o.id, new Date(o.fecha).toLocaleString("es-CL"), o.usuario].forEach(
            function (valor) {
              var td = document.createElement("td");
              td.textContent = valor;
              tr.appendChild(td);
            },
          );

          /* Detalle de la compra: qué juego se vendió y cuántas unidades.
           Una orden puede llevar varios productos, así que los listamos. */
          var tdProductos = document.createElement("td");
          var lista = document.createElement("ul");
          lista.className = "orden-productos";
          o.detalle.forEach(function (linea) {
            var li = document.createElement("li");
            var nombre = document.createElement("strong");
            nombre.textContent = linea.nombre;
            li.appendChild(nombre);
            li.append(" × " + linea.cantidad);
            lista.appendChild(li);
          });
          tdProductos.appendChild(lista);
          tr.appendChild(tdProductos);

          [unidades + (unidades === 1 ? " unidad" : " unidades"), app.formatCLP(o.total)].forEach(
            function (valor) {
              var td = document.createElement("td");
              td.textContent = valor;
              tr.appendChild(td);
            },
          );

          ordenesBody.appendChild(tr);
        });
      }
    }
    refresh();
    document.addEventListener("products-updated", refresh);
  });
})();
