import { actualizarIndicadorCarrito } from "../components/cart-indicator.js";
import { crearTarjetaLibro } from "../components/book-card.js";
import { ServicioTienda } from "../services/shop-service.js";
import { formatearFecha, formatearMoneda } from "../services/format-service.js";

/* Conecta los botones y formularios del carrito con sus datos. */
export class PaginaCarrito {
    constructor() {
        this.tienda = new ServicioTienda();
        this.lista = null;
        this.distribucion = null;
        this.estadoVacio = null;
        this.textoCantidad = null;
        this.recomendaciones = null;
        this.botonFinalizar = null;
        this.modalCompra = null;
        this.formularioCompra = null;
        this.errorCompra = null;
        this.modalOrden = null;
        this.resumenOrden = null;
        this.temporizadorMensaje = null;
    }

    /* Busca los elementos existentes; devuelve false si falta alguno. */
    buscarElementos() {
        this.lista = document.getElementById("cartItemsList");
        this.distribucion = document.getElementById("cartLayout");
        this.estadoVacio = document.getElementById("emptyCartState");
        this.textoCantidad = document.getElementById("cartPageCount");
        this.recomendaciones = document.getElementById("recommendedBooksGrid");
        this.botonFinalizar = document.getElementById("checkoutButton");
        this.modalCompra = document.getElementById("checkoutOverlay");
        this.formularioCompra = document.getElementById("checkoutForm");
        this.errorCompra = document.getElementById("checkoutError");
        this.modalOrden = document.getElementById("orderOverlay");
        this.resumenOrden = document.getElementById("orderReceipt");

        return this.lista !== null
            && this.distribucion !== null
            && this.estadoVacio !== null
            && this.textoCantidad !== null
            && this.recomendaciones !== null
            && this.botonFinalizar !== null
            && this.modalCompra !== null
            && this.formularioCompra !== null
            && this.errorCompra !== null
            && this.modalOrden !== null
            && this.resumenOrden !== null;
    }

    /* Conecta botones, formulario y modales antes del primer renderizado. */
    iniciar() {
        const pagina = this;

        if (!this.buscarElementos()) {
            return false;
        }

        this.botonFinalizar.addEventListener("click", function () {
            pagina.abrirCompra();
        });

        document.getElementById("cancelCheckoutButton").addEventListener("click", function () {
            pagina.cerrarCompra();
        });

        document.getElementById("closeCheckoutButton").addEventListener("click", function () {
            pagina.cerrarCompra();
        });

        document.getElementById("closeOrderButton").addEventListener("click", function () {
            pagina.cerrarOrden();
        });

        this.modalCompra.addEventListener("click", function (evento) {
            if (evento.target === pagina.modalCompra) {
                pagina.cerrarCompra();
            }
        });

        this.modalOrden.addEventListener("click", function (evento) {
            if (evento.target === pagina.modalOrden) {
                pagina.cerrarOrden();
            }
        });

        this.formularioCompra.addEventListener("submit", function (evento) {
            pagina.confirmarCompra(evento);
        });

        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape") {
                pagina.cerrarCompra();
                pagina.cerrarOrden();
            }
        });

        this.renderizar();
        return true;
    }

    /* Crea un elemento con clase y texto opcionales para evitar repetición. */
    crearElemento(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);
        if (clase) {
            elemento.className = clase;
        }
        if (texto !== undefined) {
            elemento.textContent = texto;
        }
        return elemento;
    }

    /* Actualiza listado, totales, estado vacío, recomendaciones e indicador. */
    renderizar() {
        const cantidad = this.tienda.carrito.obtenerCantidadTotal();
        const tieneItems = this.tienda.carrito.items.length > 0;

        if (cantidad === 1) {
            this.textoCantidad.textContent = "1 ejemplar reservado en tu carrito";
        } else {
            this.textoCantidad.textContent = cantidad + " ejemplares reservados en tu carrito";
        }

        this.distribucion.hidden = !tieneItems;
        this.estadoVacio.hidden = tieneItems;
        this.botonFinalizar.disabled = !tieneItems;
        this.renderizarItems();
        this.renderizarResumen();
        this.renderizarRecomendaciones();
        actualizarIndicadorCarrito(cantidad);
    }

    /* Limpia el contenedor y dibuja una fila por cada libro del carrito. */
    renderizarItems() {
        this.lista.textContent = "";
        for (let i = 0; i < this.tienda.carrito.items.length; i = i + 1) {
            this.lista.appendChild(this.crearFilaItem(this.tienda.carrito.items[i]));
        }
    }

    /* Construye los elementos visuales de una línea del carrito. */
    crearFilaItem(item) {
        const pagina = this;
        const producto = item.producto;
        const articulo = this.crearElemento("article", "cart-item");
        const portada = this.crearElemento("div", "book-card-cover cart-item-cover");
        const categoria = this.crearElemento("span", "book-badge category", producto.categoria);
        const imagen = this.crearElemento("img");
        const detalles = this.crearElemento("div", "cart-item-details");
        const titulo = this.crearElemento("h2", "cart-item-title", producto.titulo);
        const autor = this.crearElemento("p", "cart-item-author", producto.autor);
        const meta = this.crearElemento("p", "cart-item-meta", producto.categoria + " · " + producto.encuadernacion + " · Estado: " + producto.estado);
        const isbn = this.crearElemento("p", "cart-item-meta", "ISBN " + producto.isbn);
        const stock = this.crearElemento("div", "book-card-stock available", "✓ En stock (" + producto.stock + ")");
        const cantidad = this.crearElemento("div", "cart-item-quantity");
        const etiquetaCantidad = this.crearElemento("span", "cart-item-label", "Cantidad");
        const control = this.crearElemento("div", "qty-control");
        const botonRestar = this.crearElemento("button", "qty-btn", "−");
        const valorCantidad = this.crearElemento("span", "qty-value", item.cantidad);
        const botonSumar = this.crearElemento("button", "qty-btn", "+");
        const botonEliminar = this.crearElemento("button", "cart-item-remove", "× Eliminar");
        const precio = this.crearElemento("div", "cart-item-price");

        articulo.dataset.productoId = producto.id;
        imagen.src = producto.imagen;
        imagen.alt = "Portada de " + producto.titulo;
        imagen.loading = "lazy";
        imagen.addEventListener("error", function () {
            this.src = "../assets/img/hero-features/libro.png";
        });

        botonRestar.type = "button";
        botonRestar.dataset.accion = "restar";
        botonRestar.disabled = item.cantidad === 1;
        botonRestar.setAttribute("aria-label", "Restar un ejemplar de " + producto.titulo);
        botonRestar.addEventListener("click", function () {
            pagina.cambiarCantidad(producto.id, item.cantidad - 1);
        });

        botonSumar.type = "button";
        botonSumar.dataset.accion = "sumar";
        botonSumar.disabled = item.cantidad >= producto.stock;
        botonSumar.setAttribute("aria-label", "Sumar un ejemplar de " + producto.titulo);
        botonSumar.addEventListener("click", function () {
            pagina.cambiarCantidad(producto.id, item.cantidad + 1);
        });

        botonEliminar.type = "button";
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.setAttribute("aria-label", "Eliminar " + producto.titulo + " del carrito");
        botonEliminar.addEventListener("click", function () {
            pagina.tienda.eliminarDelCarrito(producto.id);
            pagina.renderizar();
        });

        precio.appendChild(this.crearElemento("strong", "cart-item-current-price", formatearMoneda(producto.precio * item.cantidad)));
        precio.appendChild(this.crearElemento("span", "cart-item-line-total", item.cantidad + " × " + formatearMoneda(producto.obtenerPrecioUnitario())));

        portada.appendChild(categoria);
        portada.appendChild(imagen);
        detalles.appendChild(titulo);
        detalles.appendChild(autor);
        detalles.appendChild(meta);
        detalles.appendChild(isbn);
        detalles.appendChild(stock);
        control.appendChild(botonRestar);
        control.appendChild(valorCantidad);
        control.appendChild(botonSumar);
        cantidad.appendChild(etiquetaCantidad);
        cantidad.appendChild(control);
        cantidad.appendChild(botonEliminar);
        articulo.appendChild(portada);
        articulo.appendChild(detalles);
        articulo.appendChild(cantidad);
        articulo.appendChild(precio);
        return articulo;
    }

    /* Recibe un ID y la nueva cantidad; devuelve el carrito actualizado en el HTML. */
    cambiarCantidad(productoId, cantidadNueva) {
        const actualizado = this.tienda.actualizarCantidad(productoId, cantidadNueva);

        if (!actualizado) {
            this.mostrarMensaje("No se puede usar esa cantidad. Revisa el stock disponible.");
        }
        this.renderizar();
    }

    /* Actualiza el subtotal y el total con el valor de los libros. */
    renderizarResumen() {
        const cantidad = this.tienda.carrito.obtenerCantidadTotal();

        document.getElementById("summarySubtotalLabel").textContent = "Subtotal (" + cantidad + " ejemplares)";
        document.getElementById("summarySubtotal").textContent = formatearMoneda(this.tienda.carrito.calcularSubtotal());
        document.getElementById("summaryShipping").textContent = "$0";
        document.getElementById("summaryTotal").textContent = formatearMoneda(this.tienda.carrito.calcularTotal());
    }

    /* Muestra hasta cuatro libros disponibles que no estén ya en el carrito. */
    renderizarRecomendaciones() {
        const pagina = this;
        let mostrados = 0;

        this.recomendaciones.textContent = "";
        for (let i = 0; i < this.tienda.catalogo.length && mostrados < 4; i = i + 1) {
            const producto = this.tienda.catalogo[i];
            if (producto.stock > 0 && this.tienda.carrito.buscarItem(producto.id) === null) {
                this.recomendaciones.appendChild(crearTarjetaLibro(producto, "../assets/img/hero-features/libro.png",
                    function (productoId) {
                        pagina.agregarRecomendacion(productoId);
                    },
                    function () {
                        window.location.href = "./book-categories.html";
                    }
                ));
                mostrados = mostrados + 1;
            }
        }
    }

    /* Agrega una recomendación y vuelve a calcular la página. */
    agregarRecomendacion(productoId) {
        const producto = this.tienda.buscarProducto(productoId);
        if (this.tienda.agregarAlCarrito(productoId, 1)) {
            this.mostrarMensaje("“" + producto.titulo + "” se agregó al carrito.");
            this.renderizar();
        } else {
            this.mostrarMensaje("No hay más ejemplares disponibles de este libro.");
        }
    }

    /* Abre el formulario de envío solamente cuando existen productos. */
    abrirCompra() {
        if (this.tienda.carrito.items.length === 0) {
            return;
        }
        const sesion = this.tienda.almacenamiento.obtenerSesion();
        if (sesion === null || !sesion.id) {
            this.mostrarMensaje("Debes iniciar sesión antes de comprar.");
            return;
        }
        this.errorCompra.classList.remove("visible");
        this.modalCompra.classList.add("activo");
        this.modalCompra.setAttribute("aria-hidden", "false");
        document.getElementById("customerName").focus();
    }

    /* Cierra el formulario sin cambiar el carrito. */
    cerrarCompra() {
        if (this.modalCompra !== null) {
            this.modalCompra.classList.remove("activo");
            this.modalCompra.setAttribute("aria-hidden", "true");
        }
    }

    /* Valida los datos, crea Cliente y solicita al servicio generar la orden. */
    confirmarCompra(evento) {
        evento.preventDefault();

        const sesion = this.tienda.almacenamiento.obtenerSesion();
        if (sesion === null || !sesion.id) {
            this.errorCompra.textContent = "Debes iniciar sesión antes de comprar.";
            this.errorCompra.classList.add("visible");
            return;
        }

        if (!this.formularioCompra.checkValidity()) {
            this.errorCompra.textContent = "Completa correctamente todos los campos obligatorios.";
            this.errorCompra.classList.add("visible");
            this.formularioCompra.reportValidity();
            return;
        }

        const cliente = {
            id: sesion.id,
            nombre: document.getElementById("customerName").value.trim(),
            correo: document.getElementById("customerEmail").value.trim(),
            direccion: document.getElementById("shippingAddress").value.trim(),
            ciudad: document.getElementById("shippingCity").value.trim(),
            departamento: document.getElementById("shippingDepartment").value.trim()
        };

        const orden = this.tienda.confirmarCompra(cliente);
        if (orden === null) {
            this.errorCompra.textContent = "No fue posible confirmar la compra. Verifica el carrito y el stock.";
            this.errorCompra.classList.add("visible");
            return;
        }

        this.cerrarCompra();
        this.formularioCompra.reset();
        this.mostrarOrden(orden);
        this.renderizar();
    }

    /* Construye la confirmación y el detalle de la orden con elementos seguros. */
    mostrarOrden(orden) {
        const titulo = this.crearElemento("h3", "order-success-title", "¡Compra confirmada!");
        const numero = this.crearElemento("p", "order-number", "Orden " + orden.numero);
        const fecha = this.crearElemento("p", "order-date", "Fecha: " + formatearFecha(orden.fecha));
        const destino = this.crearElemento("p", "order-destination", "Envío a: " + orden.cliente.direccion + ", " + orden.cliente.ciudad + ", " + orden.cliente.departamento);
        const tabla = this.crearElemento("table", "order-table");
        const encabezado = document.createElement("thead");
        const filaEncabezado = document.createElement("tr");
        const cuerpo = document.createElement("tbody");
        const pie = document.createElement("tfoot");

        this.resumenOrden.textContent = "";
        filaEncabezado.appendChild(this.crearElemento("th", "", "Libro"));
        filaEncabezado.appendChild(this.crearElemento("th", "", "Cantidad"));
        filaEncabezado.appendChild(this.crearElemento("th", "", "Precio"));
        filaEncabezado.appendChild(this.crearElemento("th", "", "Subtotal"));
        encabezado.appendChild(filaEncabezado);

        for (let i = 0; i < orden.detalles.length; i = i + 1) {
            const fila = document.createElement("tr");
            fila.appendChild(this.crearElemento("td", "", orden.detalles[i].titulo));
            fila.appendChild(this.crearElemento("td", "", orden.detalles[i].cantidad));
            fila.appendChild(this.crearElemento("td", "", formatearMoneda(orden.detalles[i].precioUnitario)));
            fila.appendChild(this.crearElemento("td", "", formatearMoneda(orden.detalles[i].subtotal)));
            cuerpo.appendChild(fila);
        }

        const filaTotal = document.createElement("tr");
        filaTotal.appendChild(this.crearElemento("th", "", "Total"));
        filaTotal.appendChild(this.crearElemento("td", "", ""));
        filaTotal.appendChild(this.crearElemento("td", "", ""));
        filaTotal.appendChild(this.crearElemento("th", "", formatearMoneda(orden.total)));
        pie.appendChild(filaTotal);
        tabla.appendChild(encabezado);
        tabla.appendChild(cuerpo);
        tabla.appendChild(pie);
        this.resumenOrden.appendChild(titulo);
        this.resumenOrden.appendChild(numero);
        this.resumenOrden.appendChild(fecha);
        this.resumenOrden.appendChild(destino);
        this.resumenOrden.appendChild(tabla);
        this.resumenOrden.appendChild(this.crearElemento("p", "order-status", "Estado: " + orden.estado));
        this.modalOrden.classList.add("activo");
        this.modalOrden.setAttribute("aria-hidden", "false");
        document.getElementById("closeOrderButton").focus();
    }

    /* Cierra la confirmación de la orden. */
    cerrarOrden() {
        if (this.modalOrden !== null) {
            this.modalOrden.classList.remove("activo");
            this.modalOrden.setAttribute("aria-hidden", "true");
        }
    }

    /* Presenta mensajes breves de estado para las operaciones del carrito. */
    mostrarMensaje(texto) {
        const mensaje = document.getElementById("cartStatusMessage");
        if (mensaje === null) {
            return;
        }

        window.clearTimeout(this.temporizadorMensaje);
        mensaje.textContent = texto;
        mensaje.classList.add("visible");
        this.temporizadorMensaje = window.setTimeout(function () {
            mensaje.classList.remove("visible");
        }, 2600);
    }
}

/* Inicia los eventos cuando el HTML ya está disponible. */
document.addEventListener("DOMContentLoaded", function () {
    if (window.protegerPagina("./login.html?volver=carrito")) {
        const pagina = new PaginaCarrito();
        pagina.iniciar();
    }
});
