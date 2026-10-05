import { crearCatalogoInicial } from "../data/catalog-data.js";
import "../auth.js";
import { crearProductoDesdeDatos } from "../models/product.js";
import { Carrito } from "../models/cart.js";
import { OrdenCompra } from "../models/order.js";
import { ServicioAlmacenamiento } from "./storage-service.js";

/* Coordina libros, carrito, stock y almacenamiento sin manipular el HTML. */
export class ServicioTienda {
    constructor() {
        this.almacenamiento = new ServicioAlmacenamiento();
        this.catalogo = [];
        this.carrito = new Carrito();
        this.cargarCatalogo();
        this.cargarCarrito();
    }

    /* Recupera el catálogo o crea sus datos iniciales en la primera visita. */
    cargarCatalogo() {
        const datos = this.almacenamiento.cargarCatalogo();

        if (datos === null) {
            this.catalogo = crearCatalogoInicial();
            this.almacenamiento.guardarCatalogo(this.catalogo);
            return;
        }

        for (let i = 0; i < datos.length; i = i + 1) {
            this.catalogo.push(crearProductoDesdeDatos(datos[i]));
        }
    }

    /* Relaciona cada línea guardada con su producto real del catálogo. */
    cargarCarrito() {
        const datos = this.almacenamiento.cargarCarrito();

        for (let i = 0; i < datos.length; i = i + 1) {
            const producto = this.buscarProducto(datos[i].productoId);
            if (producto !== null && producto.tieneStock(datos[i].cantidad)) {
                this.carrito.agregarProducto(producto, datos[i].cantidad);
            }
        }
    }

    /* Recupera libros y stock actualizados desde localStorage. */
    actualizarStockDesdeStorage() {
        const datos = this.almacenamiento.cargarCatalogo();
        if (datos === null) {
            return;
        }
        const librosActuales = [];
        for (let i = 0; i < datos.length; i = i + 1) {
            librosActuales.push(crearProductoDesdeDatos(datos[i]));
        }
        for (let i = 0; i < this.carrito.items.length; i = i + 1) {
            let encontrado = false;
            for (let j = 0; j < librosActuales.length; j = j + 1) {
                if (String(this.carrito.items[i].producto.id) === String(librosActuales[j].id)) {
                    this.carrito.items[i].producto = librosActuales[j];
                    encontrado = true;
                }
            }
            if (!encontrado) {
                this.carrito.items[i].producto.stock = 0;
            }
        }
        this.catalogo = librosActuales;
    }

    /* Busca un producto recorriendo el catálogo. */
    buscarProducto(productoId) {
        for (let i = 0; i < this.catalogo.length; i = i + 1) {
            if (String(this.catalogo[i].id) === String(productoId)) {
                return this.catalogo[i];
            }
        }
        return null;
    }

    /* Obtiene nombres de categorías sin repetir. */
    obtenerCategorias() {
        const categorias = [];

        for (let i = 0; i < this.catalogo.length; i = i + 1) {
            let existe = false;
            for (let j = 0; j < categorias.length; j = j + 1) {
                if (categorias[j] === this.catalogo[i].categoria) {
                    existe = true;
                }
            }
            if (!existe) {
                categorias.push(this.catalogo[i].categoria);
            }
        }
        return categorias;
    }

    /* Busca por título, autor, ISBN o categoría con comparaciones básicas. */
    buscarProductos(termino) {
        const resultado = [];
        const texto = String(termino || "").toLowerCase();

        for (let i = 0; i < this.catalogo.length; i = i + 1) {
            const producto = this.catalogo[i];
            let coincide = producto.titulo.toLowerCase().indexOf(texto) !== -1;
            coincide = coincide || producto.autor.toLowerCase().indexOf(texto) !== -1;
            coincide = coincide || producto.isbn.toLowerCase().indexOf(texto) !== -1;
            coincide = coincide || producto.categoria.toLowerCase().indexOf(texto) !== -1;

            if (coincide) {
                resultado.push(producto);
            }
        }
        return resultado;
    }

    /* Agrega una cantidad y guarda el carrito cuando la operación es válida. */
    agregarAlCarrito(productoId, cantidad) {
        this.actualizarStockDesdeStorage();
        const producto = this.buscarProducto(productoId);
        if (producto === null || !this.carrito.agregarProducto(producto, cantidad)) {
            return false;
        }
        this.almacenamiento.guardarCarrito(this.carrito);
        return true;
    }

    /* Modifica la cantidad y persiste el cambio válido. */
    actualizarCantidad(productoId, cantidad) {
        this.actualizarStockDesdeStorage();
        const actualizado = this.carrito.actualizarCantidad(productoId, cantidad);
        if (actualizado) {
            this.almacenamiento.guardarCarrito(this.carrito);
        }
        return actualizado;
    }

    /* Elimina un producto y persiste el carrito actualizado. */
    eliminarDelCarrito(productoId) {
        const eliminado = this.carrito.eliminarProducto(productoId);
        if (eliminado) {
            this.almacenamiento.guardarCarrito(this.carrito);
        }
        return eliminado;
    }

    /*
     * Valida todo el inventario, crea la orden, descuenta stock y vacía el carrito.
     * Primero valida todas las líneas para evitar una compra procesada parcialmente.
     */
    confirmarCompra(cliente) {
        const sesion = this.almacenamiento.obtenerSesion();
        if (sesion === null || !sesion.id || this.carrito.items.length === 0) {
            return null;
        }

        // Leemos el stock más reciente por si otra pestaña compró antes.
        this.actualizarStockDesdeStorage();

        for (let i = 0; i < this.carrito.items.length; i = i + 1) {
            if (!this.carrito.items[i].producto.tieneStock(this.carrito.items[i].cantidad)) {
                return null;
            }
        }

        const orden = new OrdenCompra(cliente, this.carrito);

        for (let i = 0; i < this.carrito.items.length; i = i + 1) {
            this.carrito.items[i].producto.comprar(this.carrito.items[i].cantidad);
        }

        this.almacenamiento.guardarCatalogo(this.catalogo);
        this.almacenamiento.guardarOrden(orden);
        this.carrito.vaciar();
        this.almacenamiento.guardarCarrito(this.carrito);
        return orden;
    }
}
