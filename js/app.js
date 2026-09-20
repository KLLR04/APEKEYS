(function () {
  "use strict";
  const store = window.APEKEYS_STORE;
  function formatCLP(value) { return new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(value); }
  function currentFile(){return location.pathname.split("/").pop()||"index.html";}
  function renderHeader(){
    const target=document.querySelector("[data-site-header]"); if(!target)return;
    const session=store.session(), file=currentFile(), links=[["index.html","Inicio"],["productos.html","Productos"],["categorias.html","Categorías"],["software.html","Software"]];
    const header=document.createElement("header");header.className="site-header";const bar=document.createElement("div");bar.className="container topbar";bar.innerHTML='<a class="brand" href="index.html"><img src="img/logo.png" alt="Logo APEKEYS"><span>APEKEYS</span></a>';
    const nav=document.createElement("nav");nav.className="nav-links";nav.id="mainNav";nav.setAttribute("aria-label","Navegación principal");links.forEach(function(item){const a=document.createElement("a");a.href=item[0];a.textContent=item[1];if(file===item[0])a.setAttribute("aria-current","page");nav.appendChild(a);});
    const actions=document.createElement("div");actions.className="header-actions";const cart=document.createElement("a");cart.className="btn btn-secondary btn-sm cart-link";cart.href="carrito.html";cart.innerHTML='Carrito <span class="cart-count" data-cart-count>0</span>';actions.appendChild(cart);
    const account=document.createElement("a");account.className="btn btn-primary btn-sm";account.href=session?"productos.html":"login.html";const label=document.createElement("span");label.className="account-label";label.textContent=session?session.nombre:"Ingresar";account.append(label);actions.appendChild(account);
    const toggle=document.createElement("button");toggle.type="button";toggle.className="menu-toggle";toggle.textContent="Menú";toggle.setAttribute("aria-controls","mainNav");toggle.setAttribute("aria-expanded","false");toggle.addEventListener("click",function(){const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));});
    bar.append(nav,actions,toggle);header.appendChild(bar);target.replaceWith(header);
  }
  function renderFooter(){const target=document.querySelector("[data-site-footer]");if(!target)return;target.className="site-footer";target.innerHTML='<div class="container footer-row"><div><strong class="pixel">APEKEYS</strong><div>Tu próxima partida comienza aquí.</div></div><div class="footer-links"><a href="productos.html">Productos</a><a href="categorias.html">Categorías</a><a href="software.html">Software</a><span>© 2026 APEKEYS</span></div></div>';}
  function updateCartCount(){const total=store.cart().reduce(function(sum,item){return sum+item.cantidad;},0);document.querySelectorAll("[data-cart-count]").forEach(function(n){n.textContent=String(total);});}
  function addToCart(productId,quantity){const p=store.products().find(function(x){return x.id===Number(productId);});if(!p||!p.activo||p.stock<=0)return showToast("Producto sin stock disponible",true);const amount=Math.max(1,Math.min(Number(quantity)||1,p.stock)),cart=store.cart(),found=cart.find(function(x){return x.productId===p.id;});if(found)found.cantidad=Math.min(found.cantidad+amount,p.stock);else cart.push({productId:p.id,cantidad:amount});store.saveCart(cart);updateCartCount();showToast(p.nombre+" agregado al carrito");}
  function showToast(message,error){document.querySelectorAll(".toast").forEach(function(n){n.remove();});const toast=document.createElement("div");toast.className="toast";toast.textContent=message;if(error){toast.style.background="var(--danger)";toast.style.color="white";}document.body.appendChild(toast);setTimeout(function(){toast.remove();},2800);}
  function guardPage(){const roles=(document.body.dataset.requireRole||"").split(",").filter(Boolean);if(!roles.length)return;const session=store.session();if(!session){location.replace("login.html?next="+encodeURIComponent(currentFile()));return;}if(!roles.includes(session.rol))location.replace("productos.html");}
  window.APEKEYS={formatCLP:formatCLP,addToCart:addToCart,updateCartCount:updateCartCount,showToast:showToast};guardPage();
  document.addEventListener("DOMContentLoaded",function(){renderHeader();renderFooter();updateCartCount();document.querySelectorAll("[data-logout]").forEach(function(btn){btn.addEventListener("click",function(){store.clearSession();location.replace("login.html");});});});
})();
