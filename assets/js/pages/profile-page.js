// Muestra los datos del usuario que inició sesión.
// El guardado necesita un lugar protegido para los datos personales.
if (window.protegerPagina("./login.html")) {
    const usuario = window.obtenerUsuarioActual();
    document.getElementById("profileNames").value = usuario.nombres;
    document.getElementById("profileSurnames").value = usuario.apellidos;
    document.getElementById("profileEmail").value = usuario.correo;

    document.getElementById("profileForm").addEventListener("submit", function (evento) {
        evento.preventDefault();
        document.getElementById("profileMessage").textContent =
            "Los cambios aún no se guardan. Falta definir un almacenamiento seguro para la cuenta.";
    });
}
