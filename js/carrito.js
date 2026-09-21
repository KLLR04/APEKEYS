/* ===========================================================================
   carrito.js  —  Carrito de compras y confirmación de pedido
   ---------------------------------------------------------------------------
   Reglas de negocio implementadas:
     1. Solo se puede ver y pagar el carrito con la sesión iniciada
        (lo controla data-require-session en el <body> de carrito.html).
     2. El carrito guarda únicamente {productId, cantidad}. El precio y el
        stock se leen siempre del producto actual, así que si el admin los
        cambia, el carrito nunca queda con datos viejos.
     3. Al finalizar la compra se DESCUENTA el stock de cada producto y se
        registra la orden. Ese es el punto que faltaba antes.
   =========================================================================== */
(function () {
  "use strict";

  var store = window.APEKEYS_STORE;
  var app = window.APEKEYS;

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page !== "cart") return;

    var lista = document.querySelector("[data-cart-list]");
    var totalBox = document.querySelector("[data-cart-total]");
    var botonPagar = document.querySelector("[data-checkout]");
    var resumen = document.querySelector("[data-cart-summary]");

    function dibujar() {
      var productos = store.products();
      var carrito = store.cart();
      var ajustes = [];

      /* Saneamos el carrito contra el catálogo actual: quitamos productos
         eliminados o desactivados y recortamos cantidades que ya no caben
         en el stock (por ejemplo, si otro cliente compró antes). */
      var limpio = [];
      carrito.forEach(function (item) {
        var p = productos.find(function (x) {
          return x.id === item.productId;
        });
        if (!p || !p.activo) {
          ajustes.push("Quitamos un producto que ya no está disponible.");
          return;
        }
        if (p.stock <= 0) {
          ajustes.push(p.nombre + " se quedó sin stock y fue retirado del carrito.");
          return;
        }
        if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
          ajustes.push("Se corrigió una cantidad inválida.");
          item.cantidad = 1;
        }
        if (item.cantidad > p.stock) {
          ajustes.push(
            "Ajustamos " + p.nombre + " a " + p.stock + " unidades por stock disponible.",
          );
          item.cantidad = p.stock;
        }
        limpio.push({ productId: p.id, cantidad: item.cantidad });
      });

      if (ajustes.length) {
        store.saveCart(limpio);
        app.showToast(ajustes[0], true);
      }

      lista.replaceChildren();
      var total = 0;

      limpio.forEach(function (item) {
        var p = productos.find(function (x) {
          return x.id === item.productId;
        });
        var subtotal = p.precio * item.cantidad;
        total += subtotal;

        var fila = document.createElement("article");
        fila.className = "card cart-item";

        var img = document.createElement("img");
        img.src = p.imagen || "img/logo.png";
        img.alt = "Portada de " + p.nombre;
        img.addEventListener(
          "error",
          function () {
            img.src = "img/logo.png";
          },
          { once: true },
        );

        var centro = document.createElement("div");
        var titulo = document.createElement("a");
        titulo.href = "producto.html?id=" + p.id;
        titulo.innerHTML = "<strong></strong>";
        titulo.querySelector("strong").textContent = p.nombre;

        var meta = document.createElement("div");
        meta.className = "muted";
        meta.textContent = p.plataforma + " · " + app.formatCLP(p.precio) + " c/u";

        var campo = document.createElement("label");
        campo.className = "field";
        campo.style.maxWidth = "130px";
        campo.style.marginTop = "8px";
        campo.textContent = "Cantidad";

        var input = document.createElement("input");
        input.className = "form-control";
        input.type = "number";
        input.min = "1";
        input.max = String(p.stock);
        input.step = "1";
        input.value = String(item.cantidad);

        var aviso = document.createElement("span");
        aviso.className = "field-error";

        input.addEventListener("change", function () {
          var pedido = Number(input.value);
          if (!Number.isInteger(pedido) || pedido < 1) {
            aviso.textContent = "Ingresa una cantidad entera de al menos 1.";
            input.value = "1";
            pedido = 1;
          } else if (pedido > p.stock) {
            aviso.textContent = "Solo quedan " + p.stock + " unidades.";
            pedido = p.stock;
            input.value = String(p.stock);
          } else {
            aviso.textContent = "";
          }

          var actual = store.cart();
          var encontrado = actual.find(function (x) {
            return x.productId === p.id;
          });
          if (encontrado) encontrado.cantidad = pedido;
          store.saveCart(actual);
          dibujar();
        });

        campo.append(input, aviso);
        centro.append(titulo, meta, campo);

        var derecha = document.createElement("div");
        derecha.className = "cart-item-right";
        var precio = document.createElement("strong");
        precio.className = "price";
        precio.textContent = app.formatCLP(subtotal);

        var quitar = document.createElement("button");
        quitar.type = "button";
        quitar.className = "btn btn-secondary btn-sm";
        quitar.textContent = "Quitar";
        quitar.addEventListener("click", function () {
          store.saveCart(
            store.cart().filter(function (x) {
              return x.productId !== p.id;
            }),
          );
          dibujar();
          app.showToast(p.nombre + " se quitó del carrito");
        });

        derecha.append(precio, quitar);
        fila.append(img, centro, derecha);
        lista.appendChild(fila);
      });

      if (!limpio.length) {
        var vacio = document.createElement("div");
        vacio.className = "card empty-state";
        vacio.innerHTML =
          "<h2>Tu carrito está vacío</h2>" +
          "<p>Explora el catálogo y agrega tu próxima aventura.</p>" +
          '<a class="btn btn-primary" href="productos.html">Ver productos</a>';
        lista.appendChild(vacio);
        resumen.classList.add("hidden");
      } else {
        resumen.classList.remove("hidden");
      }

      totalBox.textContent = app.formatCLP(total);
      botonPagar.disabled = !limpio.length;
      app.updateCartCount();
    }

    /* ----------------------------------------------------------------
       Finalizar compra: valida stock una última vez, descuenta unidades
       del inventario y guarda la orden con los datos del comprador.
       ---------------------------------------------------------------- */
    function finalizarCompra() {
      var session = store.session();
      if (!session) {
        location.href = "login.html?next=carrito.html";
        return;
      }

      var carrito = store.cart();
      if (!carrito.length) return;

      var productos = store.products();
      var detalle = [];
      var total = 0;

      // Revisión final: si algo cambió entre medio, abortamos sin cobrar.
      for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        var p = productos.find(function (x) {
          return x.id === item.productId;
        });
        if (!p || !p.activo) {
          app.showToast("Un producto dejó de estar disponible. Revisa tu carrito.", true);
          dibujar();
          return;
        }
        if (!Number.isInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > p.stock) {
          app.showToast("No hay stock suficiente de " + p.nombre + ".", true);
          dibujar();
          return;
        }
        detalle.push({
          productId: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: item.cantidad,
          subtotal: p.precio * item.cantidad,
        });
        total += p.precio * item.cantidad;
      }

      app.confirmar(
        "Confirmar compra",
        "Compra de demostración por " +
          app.formatCLP(total) +
          ". Se descontará el stock; no se realizan cobros ni envíos.",
        function () {
          productos = store.products();
          if (
            detalle.some(function (linea) {
              var p = productos.find(function (x) {
                return x.id === linea.productId;
              });
              return !p || !p.activo || p.stock < linea.cantidad || p.precio !== linea.precio;
            })
          ) {
            app.showToast("El catálogo cambió. Revisa el carrito.", true);
            dibujar();
            return;
          }
          var anteriores = JSON.parse(JSON.stringify(productos));
          // Descuento del inventario: aquí es donde el stock baja de verdad.
          detalle.forEach(function (linea) {
            var p = productos.find(function (x) {
              return x.id === linea.productId;
            });
            p.stock = p.stock - linea.cantidad;
          });
          if (!store.saveProducts(productos)) {
            app.showToast("No se pudo guardar la compra.", true);
            return;
          }

          var ordenes = store.orders();
          ordenes.push({
            id: ordenes.length
              ? Math.max.apply(
                  null,
                  ordenes.map(function (o) {
                    return o.id;
                  }),
                ) + 1
              : 1,
            usuarioId: session.id,
            usuario: session.email,
            fecha: new Date().toISOString(),
            total: total,
            estado: "Simulada",
            detalle: detalle,
          });
          if (!store.saveOrders(ordenes)) {
            store.saveProducts(anteriores);
            app.showToast("No se pudo guardar la orden.", true);
            return;
          }

          store.clearCart();
          dibujar();
          app.showToast("Compra simulada. Stock actualizado y orden registrada.");
        },
      );
    }

    botonPagar.addEventListener("click", finalizarCompra);
    dibujar();
  });
})();
