(function () {
  "use strict";
  const store=window.APEKEYS_STORE;
  function allowedEmail(value){return /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(value);}
  function show(form,message){const box=form.querySelector("[data-form-message]");box.textContent=message;box.className="alert alert-error";}
  document.addEventListener("DOMContentLoaded",function(){
    const form=document.getElementById("loginForm");if(!form)return;
    if(store.session()){location.replace(store.session().rol==="admin"?"admin.html":"productos.html");return;}
    form.addEventListener("submit",function(event){
      event.preventDefault();
      const email=form.email.value.trim().toLowerCase(),password=form.password.value;
      if(!allowedEmail(email)){show(form,"Ingresa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.");return;}
      if(password.length<4||password.length>10){show(form,"La contraseña debe tener entre 4 y 10 caracteres.");return;}
      const user=store.users().find(function(u){return u.email.toLowerCase()===email&&u.password===password;});
      if(!user){show(form,"Correo o contraseña incorrectos.");return;}
      if(!user.activo){show(form,"Esta cuenta está desactivada.");return;}
      store.saveSession({id:user.id,nombre:user.nombre,email:user.email,rol:user.rol});
      location.href=user.rol==="admin"?"admin.html":"productos.html";
    });
  });
})();
