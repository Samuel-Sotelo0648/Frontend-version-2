// Esta clase conserva los libros, las cantidades y los precios de una compra.
export class OrdenCompra {
    constructor(cliente, carrito) {
        this.numero = "PDT-" + new Date().getTime();
        this.cliente = cliente;
        this.fecha = new Date().toISOString();
        this.estado = "Confirmada";
        this.detalles = [];
        this.subtotal = 0;
        this.iva = 0;
        this.total = 0;

        // Cada detalle guarda el precio al comprar; el stock puede cambiar después.
        for (let i = 0; i < carrito.items.length; i = i + 1) {
            const item = carrito.items[i];
            const precio = item.producto.precio;
            const subtotal = precio * item.cantidad;
            this.detalles.push({
                productoId: item.producto.id,
                titulo: item.producto.titulo,
                precioUnitario: precio,
                cantidad: item.cantidad,
                subtotal: subtotal
            });
            this.subtotal = this.subtotal + subtotal;
        }

        // La orden usa el mismo IVA que muestra el carrito.
        this.iva = carrito.calcularIva();
        this.total = this.subtotal + this.iva;
    }
}
