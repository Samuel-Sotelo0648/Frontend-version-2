# Pendiente en Páginas del Tiempo

El inicio de sesión ya reconoce los roles `User`, `Admin` y `Proveedor` en [auth.js](assets/js/auth.js). Por ahora, solo `User` tiene una página conectada después de iniciar sesión.

## Admin

- Conectar el inicio de sesión de `Admin` con su HTML cuando el equipo decida utilizarlo.
- Ya existe [admin/index.html](admin/index.html), pero **no está conectado** al inicio de sesión. Actualmente puede abrirse mediante su URL directa; antes de usarlo como panel de administración hay que controlar ese acceso.

## Proveedor

- Crear el HTML del proveedor cuando se defina su funcionalidad.
- Conectar el inicio de sesión de `Proveedor` con ese HTML cuando esté listo.

## Para ambos roles

- La identificación solo funciona después de validar la contraseña de una cuenta existente con el rol correspondiente. No se han inventado cuentas ni contraseñas de `Admin` o `Proveedor`.
- La protección basada únicamente en `localStorage` sirve para esta versión educativa, pero no es seguridad real para funciones de administración.
