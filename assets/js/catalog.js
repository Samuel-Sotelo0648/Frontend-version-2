// Catálogo de la página principal. Usa los IDs y clases que ya existen en el HTML.
let libroAbierto = null;

// Recibe un valor numérico y devuelve su presentación en pesos colombianos.
function moneda(valor) {
    return "$" + Number(valor).toLocaleString("es-CO");
}

// Recibe un identificador y devuelve el libro correspondiente, o null.
function buscarLibroInicio(id) {
    const libros = window.leerDatosTienda("paginas_libros_v4", []);
    for (let i = 0; i < libros.length; i = i + 1) {
        if (String(libros[i].id) === String(id)) {
            return libros[i];
        }
    }
    return null;
}

// Recibe cantidad del carrito; actualiza el número visible junto al icono.
function actualizarNumeroCarrito() {
    const enlace = document.querySelector(".icon-actions a[href$='cart.html']");
    if (enlace === null) {
        return;
    }
    const items = window.leerDatosTienda("paginas_carrito_v1", []);
    let cantidad = 0;
    for (let i = 0; i < items.length; i = i + 1) {
        cantidad = cantidad + Number(items[i].cantidad);
    }
    let indicador = enlace.querySelector(".cart-count-badge");
    if (cantidad > 0) {
        if (indicador === null) {
            indicador = document.createElement("span");
            indicador.className = "cart-count-badge";
            enlace.appendChild(indicador);
        }
        indicador.textContent = cantidad;
    } else if (indicador !== null) {
        indicador.remove();
    }
}

// Recibe el ID del libro; agrega una unidad si la suma no supera el stock.
function agregarLibroInicio(id) {
    const libro = buscarLibroInicio(id);
    if (libro === null || Number(libro.stock) === 0) {
        alert("Este libro está agotado.");
        return;
    }
    const items = window.leerDatosTienda("paginas_carrito_v1", []);
    for (let i = 0; i < items.length; i = i + 1) {
        if (String(items[i].productoId) === String(id)) {
            if (Number(items[i].cantidad) >= Number(libro.stock)) {
                alert("No hay suficiente stock de este libro.");
                return;
            }
            items[i].cantidad = Number(items[i].cantidad) + 1;
            localStorage.setItem("paginas_carrito_v1", JSON.stringify(items));
            actualizarNumeroCarrito();
            alert("Libro agregado al carrito.");
            return;
        }
    }
    items.push({ productoId: id, cantidad: 1 });
    localStorage.setItem("paginas_carrito_v1", JSON.stringify(items));
    actualizarNumeroCarrito();
    alert("Libro agregado al carrito.");
}

// Recibe etiqueta, clase y texto; devuelve un elemento listo para el HTML.
function elementoInicio(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// Recibe un libro; devuelve su tarjeta con botones de detalle y carrito.
function tarjetaInicio(libro) {
    const tarjeta = elementoInicio("article", "book-card");
    const portada = elementoInicio("div", "book-card-cover");
    const categoria = elementoInicio("span", "book-badge category", libro.categoria);
    const imagen = document.createElement("img");
    const datos = elementoInicio("div", "book-card-info");
    const titulo = elementoInicio("h3", "book-card-title", libro.titulo);
    const autor = elementoInicio("p", "book-card-author", libro.autor);
    const precioFila = elementoInicio("div", "book-card-price-row");
    const precio = elementoInicio("div", "book-card-price", moneda(libro.precio));
    const stock = elementoInicio("div", "book-card-stock available", "✓ En stock (" + libro.stock + ")");
    const acciones = elementoInicio("div", "book-card-actions");
    const detalle = elementoInicio("button", "btn-card-detail", "Ver libro");
    const agregar = elementoInicio("button", "btn-card-cart", "Añadir");

    imagen.src = libro.portada || libro.imagen || "https://covers.openlibrary.org/b/isbn/" + libro.isbn + "-M.jpg";
    imagen.alt = "Portada de " + libro.titulo;
    imagen.onerror = function () {
        this.onerror = null;
        this.src = "./assets/img/hero-features/libro.png";
    };
    if (Number(libro.stock) === 0) {
        stock.className = "book-card-stock out";
        stock.textContent = "Agotado";
        agregar.disabled = true;
    }
    detalle.type = "button";
    agregar.type = "button";
    detalle.onclick = function () { abrirLibroInicio(libro.id); };
    agregar.onclick = function () { agregarLibroInicio(libro.id); };

    portada.appendChild(categoria);
    portada.appendChild(imagen);
    precioFila.appendChild(precio);
    precioFila.appendChild(stock);
    acciones.appendChild(detalle);
    acciones.appendChild(agregar);
    datos.appendChild(titulo);
    datos.appendChild(autor);
    datos.appendChild(precioFila);
    datos.appendChild(acciones);
    tarjeta.appendChild(portada);
    tarjeta.appendChild(datos);
    return tarjeta;
}

// Recibe una categoría y un texto de búsqueda; llena las cuadrículas existentes.
function mostrarLibrosInicio(categoria, texto) {
    const secciones = ["featured-books", "best-sellers", "top-rated", "new-releases"];
    const libros = window.leerDatosTienda("paginas_libros_v4", []);
    const filtrados = [];
    for (let i = 0; i < libros.length; i = i + 1) {
        const libro = libros[i];
        const coincideCategoria = categoria === "" || libro.categoria === categoria;
        const palabras = (libro.titulo + " " + libro.autor + " " + libro.isbn).toLowerCase();
        if (coincideCategoria && palabras.indexOf(texto.toLowerCase()) !== -1) {
            filtrados.push(libro);
        }
    }
    for (let i = 0; i < secciones.length; i = i + 1) {
        const seccion = document.getElementById(secciones[i]);
        const cuadricula = seccion.querySelector(".books-grid");
        cuadricula.textContent = "";
        seccion.hidden = (categoria !== "" || texto !== "") && i > 0;
        if (!seccion.hidden) {
            // El HTML tiene apartados de ventas y calificaciones, pero no hay
            // datos para afirmar qué libros ocupan esos puestos.
            if (categoria === "" && texto === "" && (i === 1 || i === 2)) {
                const aviso = i === 1 ? "No hay un ranking de ventas disponible." : "No hay calificaciones disponibles.";
                cuadricula.appendChild(elementoInicio("p", "empty-grid-msg", aviso));
                continue;
            }
            const inicio = 0;
            const fin = (categoria !== "" || texto !== "") ? filtrados.length : 4;
            for (let j = inicio; j < fin && j < filtrados.length; j = j + 1) {
                cuadricula.appendChild(tarjetaInicio(filtrados[j]));
            }
        }
    }
    const banner = document.getElementById("filtroBannerContenedor");
    if (banner !== null) {
        banner.textContent = categoria !== "" ? "Categoría: " + categoria : (texto !== "" ? "Resultados para: " + texto : "");
    }
}

// Lee los libros y conecta las categorías con la cuadrícula ya existente.
function mostrarCategoriasInicio() {
    const lista = document.getElementById("categoriesList");
    if (lista === null) {
        return;
    }
    const libros = window.leerDatosTienda("paginas_libros_v4", []);
    const categorias = [];
    for (let i = 0; i < libros.length; i = i + 1) {
        let repetida = false;
        for (let j = 0; j < categorias.length; j = j + 1) {
            if (categorias[j] === libros[i].categoria) {
                repetida = true;
            }
        }
        if (!repetida) {
            categorias.push(libros[i].categoria);
        }
    }
    lista.textContent = "";
    for (let i = 0; i < categorias.length; i = i + 1) {
        const item = document.createElement("li");
        const enlace = elementoInicio("a", "", categorias[i]);
        enlace.href = "#featured-books";
        enlace.onclick = function () { mostrarLibrosInicio(categorias[i], ""); };
        item.appendChild(enlace);
        lista.appendChild(item);
    }
}

// Recibe el ID y llena el modal de detalle que ya está en el HTML.
function abrirLibroInicio(id) {
    const libro = buscarLibroInicio(id);
    if (libro === null) {
        return;
    }
    libroAbierto = libro.id;
    document.getElementById("modalLibroTitulo").textContent = libro.titulo;
    document.getElementById("modalLibroAutor").textContent = libro.autor;
    document.getElementById("modalLibroCategoria").textContent = libro.categoria;
    document.getElementById("modalLibroIsbn").textContent = libro.isbn;
    document.getElementById("modalLibroEncuadernacion").textContent = libro.encuadernacion;
    document.getElementById("modalLibroEstado").textContent = libro.estado;
    document.getElementById("modalLibroStock").textContent = Number(libro.stock) === 0 ? "Agotado" : libro.stock + " disponibles";
    document.getElementById("modalLibroSinopsis").textContent = libro.descripcion;
    document.getElementById("modalLibroPrecio").textContent = moneda(libro.precio);
    document.getElementById("modalLibroPortada").src = libro.portada || libro.imagen || "https://covers.openlibrary.org/b/isbn/" + libro.isbn + "-M.jpg";
    document.getElementById("modalBtnAgregarCarrito").disabled = Number(libro.stock) === 0;
    document.getElementById("modalDetalleLibro").classList.add("active");
}

// El botón de cerrar del HTML llama esta función directamente.
function cerrarModalDetalle() {
    const modal = document.getElementById("modalDetalleLibro");
    if (modal !== null) {
        modal.classList.remove("active");
    }
    libroAbierto = null;
}

document.addEventListener("DOMContentLoaded", function () {
    actualizarNumeroCarrito();
    const buscador = document.getElementById("search");
    const botonBuscar = document.querySelector(".search button");
    if (buscador !== null && botonBuscar !== null) {
        botonBuscar.onclick = function (evento) {
            evento.preventDefault();
            if (document.getElementById("featured-books") !== null) {
                mostrarLibrosInicio("", buscador.value.trim());
            } else {
                window.location.href = "./book-categories.html?buscar=" + encodeURIComponent(buscador.value.trim());
            }
        };
    }
    if (document.getElementById("featured-books") !== null) {
        mostrarCategoriasInicio();
        mostrarLibrosInicio("", "");
        document.getElementById("modalBtnAgregarCarrito").onclick = function () {
            if (libroAbierto !== null) {
                agregarLibroInicio(libroAbierto);
            }
        };
        document.getElementById("modalDetalleLibro").onclick = function (evento) {
            if (evento.target === this) {
                cerrarModalDetalle();
            }
        };
    }
    const abrirMenu = document.querySelector(".menu-toggle");
    const cerrarMenu = document.querySelector(".close-menu");
    const menu = document.querySelector(".mobile-sidebar");
    const fondo = document.querySelector(".overlay");
    if (abrirMenu !== null && cerrarMenu !== null && menu !== null && fondo !== null) {
        abrirMenu.onclick = function () { menu.classList.add("active"); fondo.classList.add("active"); };
        cerrarMenu.onclick = function () { menu.classList.remove("active"); fondo.classList.remove("active"); };
        fondo.onclick = function () { menu.classList.remove("active"); fondo.classList.remove("active"); };
    }
});
