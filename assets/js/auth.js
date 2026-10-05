// Registro y sesión para las páginas que ya tienen formularios.
// Los botones del HTML llaman ejecutarRegistro y ejecutarLogin.

// Devuelve las cuentas guardadas o un array vacío si aún no hay usuarios.
function leerCuentas() {
    const texto = localStorage.getItem("paginas_cuentas_v1");
    if (texto === null) {
        return [];
    }
    return JSON.parse(texto);
}

// Devuelve el usuario de la sesión si todavía existe su cuenta; si no, null.
window.obtenerUsuarioActual = function () {
    const texto = localStorage.getItem("paginas_sesion_actual");
    if (texto === null) {
        return null;
    }
    const sesion = JSON.parse(texto);
    if (sesion === null || !sesion.id || !sesion.correo) {
        return null;
    }
    const cuentas = leerCuentas();
    for (let i = 0; i < cuentas.length; i = i + 1) {
        if (cuentas[i].id === sesion.id && cuentas[i].correo === sesion.correo) {
            return sesion;
        }
    }
    return null;
};

// Cierra la sesión actual. Conserva las cuentas y los libros del carrito.
window.cerrarSesion = function () {
    localStorage.removeItem("paginas_sesion_actual");
};

// Recibe la ruta al login. Si no hay usuario, redirige y devuelve false.
window.protegerPagina = function (rutaLogin) {
    if (window.obtenerUsuarioActual() === null) {
        window.location.replace(rutaLogin);
        return false;
    }
    return true;
};

// Recibe el evento del formulario. Guarda una cuenta y devuelve false para no recargar.
window.ejecutarRegistro = function (evento) {
    evento.preventDefault();
    const formulario = document.getElementById("registerForm");
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }

    const clave = document.getElementById("password").value;
    if (clave !== document.getElementById("confirm-password").value) {
        alert("Las contraseñas no coinciden.");
        return false;
    }

    const correo = document.getElementById("email").value.trim().toLowerCase();
    const cuentas = leerCuentas();
    for (let i = 0; i < cuentas.length; i = i + 1) {
        if (cuentas[i].correo === correo) {
            alert("Ya existe una cuenta con ese correo.");
            return false;
        }
    }

    cuentas.push({
        id: "USR-" + new Date().getTime(),
        nombre: document.getElementById("names").value.trim() + " " + document.getElementById("surnames").value.trim(),
        correo: correo,
        clave: clave
    });
    localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
    alert("Cuenta creada. Ahora inicia sesión.");
    window.location.href = "./login.html";
    return false;
};

// Recibe el evento del formulario. Comprueba correo y clave, y guarda la sesión.
window.ejecutarLogin = function (evento) {
    evento.preventDefault();
    const formulario = document.getElementById("loginForm");
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }

    const correo = document.getElementById("email").value.trim().toLowerCase();
    const clave = document.getElementById("password").value;
    const cuentas = leerCuentas();
    for (let i = 0; i < cuentas.length; i = i + 1) {
        if (cuentas[i].correo === correo && cuentas[i].clave === clave) {
            localStorage.setItem("paginas_sesion_actual", JSON.stringify({
                id: cuentas[i].id,
                nombre: cuentas[i].nombre,
                correo: cuentas[i].correo
            }));
            window.location.href = "./cart.html";
            return false;
        }
    }
    alert("Correo o contraseña incorrectos.");
    return false;
};

// Usa el enlace de inicio de sesión existente como botón para cerrar sesión.
document.addEventListener("DOMContentLoaded", function () {
    if (window.obtenerUsuarioActual() === null) {
        return;
    }
    const enlaces = document.getElementsByClassName("login-btn");
    for (let i = 0; i < enlaces.length; i = i + 1) {
        enlaces[i].textContent = "Cerrar sesión";
        enlaces[i].addEventListener("click", function (evento) {
            evento.preventDefault();
            window.cerrarSesion();
            window.location.href = this.href;
        });
    }
});
