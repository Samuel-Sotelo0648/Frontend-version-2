import { Libro } from "../models/product.js";

/* Construye instancias nuevas para el catálogo inicial del marketplace. */
export function crearCatalogoInicial() {
    const libros = [];

    libros.push(new Libro(101, "Drácula", 35000, "https://covers.openlibrary.org/b/isbn/9788415618836-M.jpg", "Clásico del terror gótico ambientado en Transilvania e Inglaterra.", 8, "Bram Stoker", "9788415618836", "Terror", "Dura", "Bueno"));
    libros.push(new Libro(102, "Harry Potter y la piedra filosofal", 50000, "https://covers.openlibrary.org/b/isbn/9788478884452-M.jpg", "El inicio del joven mago en el Colegio Hogwarts de Magia y Hechicería.", 10, "J. K. Rowling", "9788478884452", "Fantasía", "Blanda", "Bueno"));
    libros.push(new Libro(103, "Breves respuestas a las grandes preguntas", 42000, "https://covers.openlibrary.org/b/isbn/9788491990437-M.jpg", "Reflexiones sobre el universo y el futuro de la humanidad.", 6, "Stephen Hawking", "9788491990437", "Ciencia", "Dura", "Excelente"));
    libros.push(new Libro(104, "Veinte poemas de amor y una canción desesperada", 25000, "https://covers.openlibrary.org/b/isbn/9788437604947-M.jpg", "Una obra reconocida de la poesía amorosa en lengua castellana.", 7, "Pablo Neruda", "9788437604947", "Poesía", "Blanda", "Bueno"));
    libros.push(new Libro(105, "Orgullo y prejuicio", 38000, "https://covers.openlibrary.org/b/isbn/9788491050292-M.jpg", "Una historia sobre las apariencias, el amor y los prejuicios sociales.", 9, "Jane Austen", "9788491050292", "Romance", "Dura", "Excelente"));
    libros.push(new Libro(106, "Sapiens: De animales a dioses", 60000, "https://covers.openlibrary.org/b/isbn/9788499924212-M.jpg", "Un recorrido por la historia y evolución de nuestra especie.", 5, "Yuval Noah Harari", "9788499924212", "Historia", "Dura", "Excelente"));
    libros.push(new Libro(107, "Mi historia", 47000, "https://covers.openlibrary.org/b/isbn/9788401021282-M.jpg", "Memorias y reflexiones de la ex primera dama de los Estados Unidos.", 4, "Michelle Obama", "9788401021282", "Biografía", "Blanda", "Bueno"));
    libros.push(new Libro(108, "El principito", 30000, "https://covers.openlibrary.org/b/isbn/9788498381498-M.jpg", "Relato poético e ilustrado sobre la inocencia, el amor y la amistad.", 15, "Antoine de Saint-Exupéry", "9788498381498", "Infantil", "Dura", "Excelente"));
    libros.push(new Libro(109, "Hábitos atómicos", 55000, "https://covers.openlibrary.org/b/isbn/9788418118036-M.jpg", "Guía práctica para conseguir cambios mediante pequeños hábitos.", 12, "James Clear", "9788418118036", "Autoayuda", "Blanda", "Excelente"));
    libros.push(new Libro(110, "Padre rico, padre pobre", 40000, "https://covers.openlibrary.org/b/isbn/9788403522121-M.jpg", "Lecciones sobre educación financiera y mentalidad de crecimiento.", 11, "Robert T. Kiyosaki", "9788403522121", "Economía", "Dura", "Bueno"));
    libros.push(new Libro(1, "Cien años de soledad", 45000, "https://covers.openlibrary.org/b/isbn/9788420471839-M.jpg", "Obra del realismo mágico sobre la familia Buendía en Macondo.", 12, "Gabriel García Márquez", "9788420471839", "Novela clásica", "Dura", "Excelente"));
    libros.push(new Libro(2, "Don Quijote de la Mancha", 65000, "https://covers.openlibrary.org/b/isbn/9788424116040-M.jpg", "Las inolvidables andanzas del hidalgo de la literatura universal.", 8, "Miguel de Cervantes", "9788424116040", "Novela clásica", "Dura", "Bueno"));
    libros.push(new Libro(3, "Los tres mosqueteros", 48000, "https://covers.openlibrary.org/b/isbn/9788497592208-M.jpg", "Aventuras, honor y camaradería en la Francia del siglo XVII.", 0, "Alexandre Dumas", "9788497592208", "Novela clásica", "Blanda", "Aceptable"));
    libros.push(new Libro(4, "El señor de los anillos", 85000, "https://covers.openlibrary.org/b/isbn/9788445071403-M.jpg", "La gran epopeya de la Tierra Media y el viaje para destruir el Anillo Único.", 5, "J. R. R. Tolkien", "9788445071403", "Fantasía", "Dura", "Excelente"));

    return libros;
}
