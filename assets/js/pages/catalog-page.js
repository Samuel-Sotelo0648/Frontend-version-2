import { crearTarjetaLibro } from "../components/book-card.js";
import { actualizarIndicadorCarrito } from "../components/cart-indicator.js";
import { ServicioTienda } from "../services/shop-service.js";
import { formatearMoneda } from "../services/format-service.js";

/* Conecta catálogo, búsqueda, detalle y carrito con el HTML existente. */
export class PaginaCatalogo {
    constructor() {
        this.tienda = new ServicioTienda();
        this.contenedor = null;
        this.buscador = null;
        this.botonBuscar = null;
        this.modal = null;
        this.botonCerrarModal = null;
        this.botonAgregarModal = null;
        this.productoSeleccionadoId = null;
        this.temporizadorMensaje = null;
    }

    /* Busca los elementos necesarios y devuelve false si el HTML aún no está preparado. */
    buscarElementos() {
        this.contenedor = document.querySelector(".categories-container");
        this.buscador = document.getElementById("search");
        this.botonBuscar = document.querySelector(".search button");
        this.modal = document.getElementById("modalDetalleLibro");
        this.botonCerrarModal = document.getElementById("modalCloseButton");
        this.botonAgregarModal = document.getElementById("modalBtnAgregarCarrito");

        return this.contenedor !== null
            && this.buscador !== null
            && this.botonBuscar !== null
            && this.modal !== null
            && this.botonCerrarModal !== null
            && this.botonAgregarModal !== null;
    }

    /* Conecta los eventos una sola vez y presenta el catálogo inicial. */
    iniciar() {
        const pagina = this;

        if (!this.buscarElementos()) {
            return false;
        }

        this.botonBuscar.addEventListener("click", function (evento) {
            evento.preventDefault();
            pagina.buscar();
        });

        this.buscador.addEventListener("input", function () {
            pagina.buscar();
        });

        this.botonCerrarModal.addEventListener("click", function () {
            pagina.cerrarDetalle();
        });

        this.modal.addEventListener("click", function (evento) {
            if (evento.target === pagina.modal) {
                pagina.cerrarDetalle();
            }
        });

        this.botonAgregarModal.addEventListener("click", function () {
            pagina.agregarProducto(pagina.productoSeleccionadoId);
            pagina.cerrarDetalle();
        });

        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape") {
                pagina.cerrarDetalle();
            }
        });

        const busqueda = window.location.search;
        if (busqueda.indexOf("?buscar=") === 0) {
            this.buscador.value = decodeURIComponent(busqueda.substring(8));
            this.buscar();
        } else {
            this.renderizarPorCategorias(this.tienda.catalogo);
        }
        actualizarIndicadorCarrito(this.tienda.carrito.obtenerCantidadTotal());
        return true;
    }

    /* Filtra al escribir y recupera las categorías cuando la búsqueda queda vacía. */
    buscar() {
        const termino = this.buscador.value.trim();
        if (termino === "") {
            this.renderizarPorCategorias(this.tienda.catalogo);
        } else {
            this.renderizarResultados(this.tienda.buscarProductos(termino), termino);
        }
    }

    /* Agrupa y dibuja los productos según su categoría. */
    renderizarPorCategorias(productos) {
        const categorias = this.tienda.obtenerCategorias();
        const titulo = document.createElement("h1");

        this.contenedor.textContent = "";
        titulo.textContent = "Explorar libros por categoría";
        this.contenedor.appendChild(titulo);

        for (let i = 0; i < categorias.length; i = i + 1) {
            const productosCategoria = [];
            for (let j = 0; j < productos.length; j = j + 1) {
                if (productos[j].categoria === categorias[i]) {
                    productosCategoria.push(productos[j]);
                }
            }
            if (productosCategoria.length > 0) {
                this.contenedor.appendChild(this.crearSeccion(categorias[i], productosCategoria));
            }
        }
    }

    /* Dibuja una sección única con los resultados del buscador. */
    renderizarResultados(productos, termino) {
        const titulo = document.createElement("h1");

        this.contenedor.textContent = "";
        titulo.textContent = "Resultados para “" + termino + "”";
        this.contenedor.appendChild(titulo);

        if (productos.length === 0) {
            const mensaje = document.createElement("p");
            mensaje.className = "empty-grid-msg";
            mensaje.textContent = "No encontramos libros con ese título, autor, ISBN o categoría.";
            this.contenedor.appendChild(mensaje);
            return;
        }

        this.contenedor.appendChild(this.crearSeccion("Libros encontrados", productos));
    }

    /* Construye una sección de libros con las tarjetas del CSS existente. */
    crearSeccion(nombre, productos) {
        const pagina = this;
        const seccion = document.createElement("section");
        const encabezado = document.createElement("div");
        const titulo = document.createElement("h2");
        const cuadricula = document.createElement("div");

        seccion.className = "book-list";
        encabezado.className = "section-header";
        cuadricula.className = "books-grid";
        titulo.textContent = nombre + " (" + productos.length + ")";
        encabezado.appendChild(titulo);
        seccion.appendChild(encabezado);

        for (let i = 0; i < productos.length; i = i + 1) {
            cuadricula.appendChild(crearTarjetaLibro(productos[i], "../assets/img/hero-features/libro.png",
                function (productoId) {
                    pagina.agregarProducto(productoId);
                },
                function (productoId) {
                    pagina.mostrarDetalle(productoId);
                }
            ));
        }

        seccion.appendChild(cuadricula);
        return seccion;
    }

    /* Recibe el ID; agrega una unidad y actualiza el número del carrito. */
    agregarProducto(productoId) {
        const producto = this.tienda.buscarProducto(productoId);

        if (producto === null) {
            return;
        }

        const agregado = this.tienda.agregarAlCarrito(productoId, 1);
        if (agregado) {
            actualizarIndicadorCarrito(this.tienda.carrito.obtenerCantidadTotal());
            this.mostrarMensaje("“" + producto.titulo + "” se agregó al carrito.");
        } else {
            this.mostrarMensaje("No es posible agregar más unidades: se alcanzó el stock.");
        }
    }

    /* Completa el modal con el libro que el usuario eligió. */
    mostrarDetalle(productoId) {
        const producto = this.tienda.buscarProducto(productoId);
        if (producto === null) {
            return;
        }

        this.productoSeleccionadoId = producto.id;
        document.getElementById("modalLibroTitulo").textContent = producto.titulo;
        document.getElementById("modalLibroAutor").textContent = producto.autor;
        document.getElementById("modalLibroCategoria").textContent = producto.categoria;
        document.getElementById("modalLibroIsbn").textContent = producto.isbn;
        document.getElementById("modalLibroEncuadernacion").textContent = producto.encuadernacion;
        document.getElementById("modalLibroEstado").textContent = producto.estado;
        document.getElementById("modalLibroStock").textContent = producto.stock === 0 ? "Agotado" : producto.stock + " ejemplares disponibles";
        document.getElementById("modalLibroSinopsis").textContent = producto.descripcion;
        document.getElementById("modalLibroPrecio").textContent = formatearMoneda(producto.obtenerPrecioUnitario());
        document.getElementById("modalLibroPortada").src = producto.imagen;
        this.botonAgregarModal.disabled = producto.stock === 0;
        this.modal.classList.add("active");
        this.modal.setAttribute("aria-hidden", "false");
    }

    /* Oculta el modal de detalle y limpia su selección. */
    cerrarDetalle() {
        if (this.modal !== null) {
            this.modal.classList.remove("active");
            this.modal.setAttribute("aria-hidden", "true");
        }
        this.productoSeleccionadoId = null;
    }

    /* Muestra un aviso temporal accesible sin utilizar alert(). */
    mostrarMensaje(texto) {
        let mensaje = document.getElementById("vintageToast");
        if (mensaje === null) {
            mensaje = document.createElement("div");
            mensaje.id = "vintageToast";
            mensaje.className = "vintage-toast";
            mensaje.setAttribute("role", "status");
            document.body.appendChild(mensaje);
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
    const pagina = new PaginaCatalogo();
    pagina.iniciar();
});
