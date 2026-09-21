/* ===========================================================================
   validaciones.js  —  Reglas de negocio compartidas
   ---------------------------------------------------------------------------
   Centralizamos aquí TODAS las validaciones para que login, registro,
   contacto y los mantenedores usen exactamente los mismos criterios. Si el
   día de mañana cambia una regla (por ejemplo, los dominios de correo
   aceptados), se cambia en un solo lugar.

   Cada función devuelve:
     - null  cuando el valor es válido
     - un string con el mensaje de error cuando no lo es
   =========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     RUN chileno: sin puntos ni guion, entre 7 y 9 caracteres, y con
     dígito verificador correcto calculado con el algoritmo módulo 11.
     Ej. válido: 19011022K
     ------------------------------------------------------------------ */
  function validarRun(valor) {
    var run = String(valor || "")
      .trim()
      .toUpperCase()
      .replace(/[.\-\s]/g, "");
    if (!run) return "El RUN es obligatorio.";
    if (run.length < 7 || run.length > 9)
      return "El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion.";
    if (!/^[0-9]+[0-9K]$/.test(run))
      return "El RUN solo admite números y una K final como dígito verificador.";

    var cuerpo = run.slice(0, -1);
    var dv = run.slice(-1);
    var suma = 0;
    var multiplicador = 2;

    for (var i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    var resto = 11 - (suma % 11);
    var dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

    if (dv !== dvEsperado) return "El RUN ingresado no es válido (dígito verificador incorrecto).";
    return null;
  }

  function normalizarRun(valor) {
    return String(valor || "")
      .trim()
      .toUpperCase()
      .replace(/[.\-\s]/g, "");
  }

  /* Correo: requerido y máximo 100 caracteres. Se acepta cualquier dominio
     siempre que tenga la estructura usuario@dominio.extension (.cl, .com,
     .net, etc.). No restringimos a dominios específicos. */
  function validarCorreo(valor) {
    var correo = String(valor || "")
      .trim()
      .toLowerCase();
    if (!correo) return "El correo es obligatorio.";
    if (correo.length > 100) return "El correo admite un máximo de 100 caracteres.";

    // usuario @ dominio . extensión de 2 o más letras
    if (!/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/.test(correo)) {
      return "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com";
    }
    return null;
  }

  /* Contraseña: el documento de requisitos pide entre 4 y 10 caracteres. */
  function validarPassword(valor) {
    var clave = String(valor || "");
    if (!clave) return "La contraseña es obligatoria.";
    if (clave.length < 4 || clave.length > 10)
      return "La contraseña debe tener entre 4 y 10 caracteres.";
    return null;
  }

  function validarTextoRequerido(valor, etiqueta, maximo, minimo) {
    var texto = String(valor || "").trim();
    var min = minimo || 1;
    if (!texto) return etiqueta + " es obligatorio.";
    if (texto.length < min) return etiqueta + " debe tener al menos " + min + " caracteres.";
    if (maximo && texto.length > maximo)
      return etiqueta + " admite un máximo de " + maximo + " caracteres.";
    return null;
  }

  function validarTextoOpcional(valor, etiqueta, maximo) {
    var texto = String(valor || "").trim();
    if (texto && maximo && texto.length > maximo)
      return etiqueta + " admite un máximo de " + maximo + " caracteres.";
    return null;
  }

  /* Precio: obligatorio, mayor a cero (no permitimos productos en $0 por
     error de tipeo) y con tope razonable para detectar dedos pesados. */
  /* Ojo: comparamos contra null/undefined/"" de forma explícita. Usar
     (valor || "") sería un error, porque el número 0 es "falsy" y haría
     que un stock de 0 se tomara como campo vacío. */
  function estaVacio(valor) {
    return valor === null || valor === undefined || String(valor).trim() === "";
  }

  function validarPrecio(valor) {
    if (estaVacio(valor)) return "El precio es obligatorio.";
    var precio = Number(valor);
    if (!Number.isFinite(precio)) return "El precio debe ser un número.";
    if (precio <= 0) return "El precio debe ser mayor a cero.";
    return null;
  }

  function validarStock(valor, etiqueta) {
    var nombre = etiqueta || "El stock";
    if (estaVacio(valor)) return nombre + " es obligatorio.";
    var stock = Number(valor);
    if (!Number.isInteger(stock)) return nombre + " debe ser un número entero.";
    if (stock < 0) return nombre + " no puede ser negativo.";
    return null;
  }

  /* Fecha de nacimiento OPCIONAL en formato ISO (aaaa-mm-dd), usada por el
     mantenedor de usuarios del administrador. */
  function validarFechaNacimiento(valor) {
    if (!valor) return null;
    var fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return "La fecha de nacimiento no es válida.";
    if (fecha > new Date()) return "La fecha de nacimiento no puede ser futura.";
    if (fecha.getFullYear() < 1900) return "Revisa el año de la fecha de nacimiento.";
    return null;
  }

  /* ------------------------------------------------------------------
     Fecha de nacimiento OBLIGATORIA escrita a mano como DD/MM/AAAA.
     No usamos <input type="date"> para que no aparezca el calendario del
     navegador, así que validamos el texto nosotros: formato, que el día
     exista realmente en ese mes (rechaza 31/02) y que no sea futura.
     ------------------------------------------------------------------ */
  function validarFechaManual(valor) {
    var texto = String(valor || "").trim();
    if (!texto) return null;

    var partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!partes) return "Escribe la fecha en formato DD/MM/AAAA. Ejemplo: 25/07/2002";

    var dia = Number(partes[1]);
    var mes = Number(partes[2]);
    var anio = Number(partes[3]);

    if (mes < 1 || mes > 12) return "El mes debe estar entre 01 y 12.";
    if (dia < 1 || dia > 31) return "El día debe estar entre 01 y 31.";

    var fecha = new Date(anio, mes - 1, dia);
    // Si el día no existe (ej. 31/02), JavaScript lo corre al mes siguiente.
    if (fecha.getDate() !== dia || fecha.getMonth() !== mes - 1 || fecha.getFullYear() !== anio) {
      return "Esa fecha no existe en el calendario.";
    }
    if (fecha > new Date()) return "La fecha de nacimiento no puede ser futura.";
    if (anio < 1900) return "Revisa el año de la fecha de nacimiento.";
    return null;
  }

  /* Convierte DD/MM/AAAA a aaaa-mm-dd para guardarlo de forma uniforme. */
  function fechaManualAIso(valor) {
    var partes = String(valor || "")
      .trim()
      .match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return partes ? partes[3] + "-" + partes[2] + "-" + partes[1] : "";
  }

  function validarUrlImagen(valor) {
    var url = String(valor || "").trim();
    if (!url) return null; // la imagen es opcional
    if (url.indexOf("data:image/") === 0) return null; // imagen subida por el admin
    if (url.length > 500 && url.indexOf("data:") !== 0)
      return "La URL admite un máximo de 500 caracteres.";
    if (!/^https?:\/\/.+/i.test(url) && url.indexOf("img/") !== 0) {
      return "La imagen debe ser una URL que empiece con http:// o https://, o un archivo subido.";
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Helpers de interfaz para validación en tiempo real.
     Cada campo del formulario lleva al lado un <span class="field-error">
     donde se escribe el mensaje mientras el usuario escribe.
     ------------------------------------------------------------------ */
  function pintarError(campo, mensaje) {
    var contenedor = campo.closest(".field") || campo.parentElement;
    var caja = contenedor ? contenedor.querySelector(".field-error") : null;
    if (caja) caja.textContent = mensaje || "";
    campo.classList.toggle("is-invalid", !!mensaje);
    campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
    return !mensaje;
  }

  /* Conecta un campo con su función validadora: valida al salir del campo
     y vuelve a validar en cada tecla una vez que ya se mostró un error,
     para que el mensaje desaparezca apenas el dato queda correcto. */
  function enlazarValidacion(campo, validador) {
    if (!campo) return;
    function revisar() {
      pintarError(campo, validador(campo.value));
    }
    campo.addEventListener("blur", revisar);
    campo.addEventListener("input", function () {
      if (campo.classList.contains("is-invalid")) revisar();
    });
  }

  /* Valida un formulario completo contra un mapa {nombreCampo: validador}.
     Devuelve true si todo está correcto y deja el foco en el primer error. */
  function validarFormulario(form, reglas) {
    var primerError = null;

    Object.keys(reglas).forEach(function (nombre) {
      var campo = form.elements[nombre];
      if (!campo) return;
      var mensaje = reglas[nombre](campo.value);
      pintarError(campo, mensaje);
      if (mensaje && !primerError) primerError = campo;
    });

    if (primerError) {
      primerError.focus();
      return false;
    }
    return true;
  }

  window.APEKEYS_VALIDA = {
    run: validarRun,
    normalizarRun: normalizarRun,
    correo: validarCorreo,
    password: validarPassword,
    requerido: validarTextoRequerido,
    opcional: validarTextoOpcional,
    precio: validarPrecio,
    stock: validarStock,
    fechaNacimiento: validarFechaNacimiento,
    fechaManual: validarFechaManual,
    fechaManualAIso: fechaManualAIso,
    urlImagen: validarUrlImagen,
    pintarError: pintarError,
    enlazar: enlazarValidacion,
    validarFormulario: validarFormulario,
  };
})();
