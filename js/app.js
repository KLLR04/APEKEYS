(function () {
  "use strict";
  const store = window.APEKEYS_STORE;
  function formatCLP(value) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);
  }
  function currentFile() {
    return location.pathname.split("/").pop() || "index.html";
  }
  function renderHeader() {
    const target = document.querySelector("[data-site-header]");
    if (!target) return;
    const session = store.session(),
      file = currentFile(),
      accountHref =
        session && ["admin", "vendedor"].includes(session.rol)
          ? "admin.html"
          : session
            ? "productos.html"
            : "login.html",
      adminLink =
        session && ["admin", "vendedor"].includes(session.rol)
          ? '<a class="btn btn-outline-secondary me-2" href="admin.html">Administración</a>'
          : "";
    target.innerHTML =
      '<header><div class="header-top"><a class="logo-box" href="index.html"><img src="img/logo.png" alt="Logo APEKEYS"><span>APEKEYS</span></a><input id="headerSearch" type="search" class="form-control barra-busqueda" placeholder="Buscar..."><div class="header-actions"><a href="' +
      accountHref +
      '"><img src="img/Cart y User/user.png" alt="Cuenta"></a><a class="cart-icon" href="carrito.html"><img src="img/Cart y User/cart.png" alt="Carrito"><span class="badge text-bg-danger" data-cart-count>0</span></a></div></div><nav class="navbar bg-body-tertiary"><div class="container-fluid justify-content-start"><a class="btn ' +
      (file === "index.html" ? "btn-outline-success" : "btn-outline-secondary") +
      ' me-2" href="index.html">Inicio</a><a class="btn ' +
      (file === "productos.html" ? "btn-outline-success" : "btn-outline-secondary") +
      ' me-2" href="productos.html">Productos</a><div class="dropdown me-2"><button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">Categorías</button><ul class="dropdown-menu"><li><a class="dropdown-item" href="productos.html?categoria=Acción">Acción</a></li><li><a class="dropdown-item" href="productos.html?categoria=Mundo%20Abierto">Mundo abierto</a></li><li><a class="dropdown-item" href="productos.html?categoria=Plataformas">Plataformas</a></li><li><a class="dropdown-item" href="productos.html?categoria=Terror">Terror</a></li></ul></div>' +
      adminLink +
      "</div></nav></header>";

    const nav = target.querySelector("nav > div");
    nav.classList.add("gap-2");
    [
      ["software.html", "Software"],
      ["blogs.html", "Blogs"],
      ["nosotros.html", "Nosotros"],
      ["contacto.html", "Contacto"],
    ].forEach(function (item) {
      const a = document.createElement("a");
      a.href = item[0];
      a.textContent = item[1];
      a.className = "btn btn-outline-secondary";
      nav.appendChild(a);
    });
    if (session) {
      const name = document.createElement("span");
      name.className = "small text-white";
      name.textContent = session.nombre;
      target.querySelector(".header-actions").appendChild(name);
      const logout = document.createElement("button");
      logout.type = "button";
      logout.className = "btn btn-outline-secondary btn-sm";
      logout.textContent = "Cerrar sesión";
      logout.dataset.logout = "";
      nav.appendChild(logout);
    }
    const search = document.getElementById("headerSearch");
    search.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && search.value.trim())
        location.href = "productos.html?buscar=" + encodeURIComponent(search.value.trim());
    });
  }
  function renderFooter() {
    const target = document.querySelector("[data-site-footer]");
    if (!target) return;
    target.className = "site-footer";
    target.innerHTML = '<p class="mb-0">© 2026 APEKEYS - Todos los derechos reservados</p>';
  }
  function updateCartCount() {
    const total = store.cart().reduce(function (sum, item) {
      return sum + item.cantidad;
    }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (n) {
      n.textContent = String(total);
    });
  }
  function addToCart(productId, quantity) {
    if (!store.session()) {
      location.href = "login.html?next=productos.html";
      return;
    }
    const p = store.products().find(function (x) {
      return x.id === Number(productId);
    });
    if (!p || !p.activo || p.stock <= 0) return showToast("Producto sin stock disponible", true);
    const amount = Math.max(1, Math.min(Math.floor(Number(quantity)) || 1, p.stock)),
      cart = store.cart(),
      found = cart.find(function (x) {
        return x.productId === p.id;
      });
    if (found) found.cantidad = Math.min(found.cantidad + amount, p.stock);
    else cart.push({ productId: p.id, cantidad: amount });
    store.saveCart(cart);
    updateCartCount();
    showToast(p.nombre + " agregado al carrito");
  }
  function showToast(message, error) {
    document.querySelectorAll(".app-message").forEach(function (n) {
      n.remove();
    });
    const toast = document.createElement("div");
    toast.className = "app-message alert " + (error ? "alert-danger" : "alert-success");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, 2800);
  }
  function guardPage() {
    const roles = (document.body.dataset.requireRole || "").split(",").filter(Boolean);
    if (!roles.length && !document.body.hasAttribute("data-require-session")) return;
    const session = store.session();
    if (!session) {
      location.replace("login.html?next=" + encodeURIComponent(currentFile()));
      return;
    }
    if (roles.length && !roles.includes(session.rol)) location.replace("productos.html");
  }
  function confirmar(titulo, mensaje, accion) {
    if (window.confirm(titulo + "\n" + mensaje)) accion();
  }
  function etiquetaRol(rol) {
    return { admin: "Administrador", cliente: "Cliente", vendedor: "Vendedor" }[rol] || rol;
  }
  window.APEKEYS = {
    confirmar: confirmar,
    etiquetaRol: etiquetaRol,
    currentFile: currentFile,
    formatCLP: formatCLP,
    addToCart: addToCart,
    updateCartCount: updateCartCount,
    showToast: showToast,
  };
  guardPage();
  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    updateCartCount();
    document.querySelectorAll("[data-logout]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        store.clearSession();
        location.replace("login.html");
      });
    });
  });
})();
