/* Centraliza el acceso a localStorage para no mezclar almacenamiento con la interfaz. */
export class ServicioAlmacenamiento {
    constructor() {
        // Esta es la misma clave que usa la administración para su inventario.
        this.claveCatalogo = "paginas_libros_v4";
        this.claveOrdenes = "paginas_pedidos_v1";
        this.claveSesion = "paginas_sesion_actual";
        this.claveCarrito = "paginas_carrito_v1";
    }

    /* Recibe una clave; devuelve los datos guardados o el valor alternativo. */
    leer(clave, valorAlternativo) {
        const texto = localStorage.getItem(clave);
        if (texto === null) {
            return valorAlternativo;
        }
        return JSON.parse(texto);
    }

    /* Convierte un valor a JSON y lo guarda en el navegador. */
    guardar(clave, valor) {
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    /* Recupera la sesión creada por auth.js al iniciar sesión. */
    obtenerSesion() {
        return window.obtenerUsuarioActual();
    }

    /* Guarda el catálogo convirtiendo cada clase en datos sencillos. */
    guardarCatalogo(productos) {
        const datos = [];
        for (let i = 0; i < productos.length; i = i + 1) {
            datos.push(productos[i].convertirADatos());
        }
        return this.guardar(this.claveCatalogo, datos);
    }

    /* Recupera los datos del catálogo; las clases se reconstruyen en ServicioTienda. */
    cargarCatalogo() {
        return this.leer(this.claveCatalogo, null);
    }

    /* Guarda únicamente identificador y cantidad de cada línea del carrito. */
    guardarCarrito(carrito) {
        const datos = [];
        for (let i = 0; i < carrito.items.length; i = i + 1) {
            datos.push({
                productoId: carrito.items[i].producto.id,
                cantidad: carrito.items[i].cantidad
            });
        }
        return this.guardar(this.claveCarrito, datos);
    }

    /* Recupera las líneas sencillas del carrito. */
    cargarCarrito() {
        return this.leer(this.claveCarrito, []);
    }

    /* Agrega una orden al historial sin sobrescribir las compras anteriores. */
    guardarOrden(orden) {
        const ordenes = this.leer(this.claveOrdenes, []);
        // Administración muestra una fila por ejemplar. Así conserva las cantidades.
        const items = [];
        for (let i = 0; i < orden.detalles.length; i = i + 1) {
            for (let j = 0; j < orden.detalles[i].cantidad; j = j + 1) {
                items.push({ titulo: orden.detalles[i].titulo, precio: orden.detalles[i].precioUnitario });
            }
        }
        ordenes.push({
            id: orden.numero,
            usuarioId: orden.cliente.id,
            usuario: orden.cliente.nombre,
            email: orden.cliente.correo,
            items: items,
            total: orden.total,
            fecha: orden.fecha,
            estado: orden.estado
        });
        return this.guardar(this.claveOrdenes, ordenes);
    }
}
