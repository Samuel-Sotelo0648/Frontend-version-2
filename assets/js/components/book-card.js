import { formatearMoneda } from "../services/format-service.js";

// Recibe etiqueta, clase y texto; devuelve un elemento HTML.
function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// Recibe un libro, una imagen de respaldo y las dos acciones de sus botones.
// Devuelve una tarjeta que conserva las clases del CSS existente.
export function crearTarjetaLibro(libro, rutaImagen, alAgregar, alVerDetalle) {
    const tarjeta = crearElemento("article", "book-card");
    const portada = crearElemento("div", "book-card-cover");
    const categoria = crearElemento("span", "book-badge category", libro.categoria);
    const imagen = document.createElement("img");
    const informacion = crearElemento("div", "book-card-info");
    const titulo = crearElemento("h3", "book-card-title", libro.titulo);
    const autor = crearElemento("p", "book-card-author", libro.autor);
    const filaPrecio = crearElemento("div", "book-card-price-row");
    const precio = crearElemento("div", "book-card-price", formatearMoneda(libro.precio));
    const stock = crearElemento("div", "book-card-stock available", "✓ En stock (" + libro.stock + ")");
    const acciones = crearElemento("div", "book-card-actions");
    const botonDetalle = crearElemento("button", "btn-card-detail", "Ver libro");
    const botonAgregar = crearElemento("button", "btn-card-cart", "Añadir");

    imagen.src = libro.imagen;
    imagen.alt = "Portada de " + libro.titulo;
    imagen.onerror = function () {
        this.onerror = null;
        this.src = rutaImagen;
    };
    if (libro.stock === 0) {
        stock.className = "book-card-stock out";
        stock.textContent = "Agotado";
        botonAgregar.disabled = true;
    }
    botonDetalle.type = "button";
    botonAgregar.type = "button";
    botonDetalle.addEventListener("click", function () { alVerDetalle(libro.id); });
    botonAgregar.addEventListener("click", function () { alAgregar(libro.id); });

    portada.appendChild(categoria);
    portada.appendChild(imagen);
    filaPrecio.appendChild(precio);
    filaPrecio.appendChild(stock);
    acciones.appendChild(botonDetalle);
    acciones.appendChild(botonAgregar);
    informacion.appendChild(titulo);
    informacion.appendChild(autor);
    informacion.appendChild(filaPrecio);
    informacion.appendChild(acciones);
    tarjeta.appendChild(portada);
    tarjeta.appendChild(informacion);
    return tarjeta;
}
