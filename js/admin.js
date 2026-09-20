(function () {
  "use strict";
  const store=window.APEKEYS_STORE;
  document.addEventListener("DOMContentLoaded",function(){
    const session=store.session();if(!session)return;
    const products=store.products(),low=products.filter(function(p){return p.stock<=p.stockCritico;});
    document.querySelector("[data-admin-name]").textContent=session.nombre;
    document.querySelector("[data-total-products]").textContent=String(products.length);
    document.querySelector("[data-active-products]").textContent=String(products.filter(function(p){return p.activo;}).length);
    document.querySelector("[data-low-stock]").textContent=String(low.length);
    const tbody=document.querySelector("[data-admin-products]"),rows=low.length?low:products.slice(0,5);
    rows.forEach(function(p){
      const tr=document.createElement("tr");
      [p.codigo,p.nombre,p.categoria,String(p.stock)].forEach(function(value){const td=document.createElement("td");td.textContent=value;tr.appendChild(td);});
      const state=document.createElement("td"),badge=document.createElement("span");badge.className="badge "+(p.stock<=p.stockCritico?"badge-warning":"badge-success");badge.textContent=p.stock<=p.stockCritico?"Stock bajo":"Disponible";state.appendChild(badge);tr.appendChild(state);tbody.appendChild(tr);
    });
  });
})();
