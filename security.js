// security.js

document.addEventListener('DOMContentLoaded', () => {
    // Deshabilita el clic derecho para evitar el menú contextual y "Inspeccionar elemento"
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });

    // Deshabilita la selección de texto (aunque ya está en CSS, esto refuerza)
    document.addEventListener('selectstart', event => {
        event.preventDefault();
    });

    // Deshabilita algunas combinaciones de teclado comunes para copiar/inspeccionar
    document.addEventListener('keydown', event => {
        // Bloquear Ctrl+C, Cmd+C (Copiar)
        if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            event.preventDefault();
        }
        // Bloquear Ctrl+A, Cmd+A (Seleccionar todo)
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            event.preventDefault();
        }
        // Bloquear Ctrl+U, Cmd+U (Ver código fuente)
        if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
            event.preventDefault();
        }
        // Bloquear Ctrl+Shift+I, Cmd+Option+I (Herramientas de desarrollador)
        if ((event.ctrlKey && event.shiftKey && event.key === 'I') || (event.metaKey && event.altKey && event.key === 'i')) {
            event.preventDefault();
        }
        // Bloquear F12 (Herramientas de desarrollador)
        if (event.key === 'F12') {
            event.preventDefault();
        }
    });

    // Pequeño truco para intentar detectar herramientas de desarrollador
    // Esto no es infalible y puede tener falsos positivos/negativos
    const devtools = /./;
    devtools.toString = function() {
        // Se ejecuta si las devtools están abiertas (o si se intenta convertir a string)
        // Puedes agregar una acción aquí, como redirigir o mostrar un mensaje
        // console.warn('¡Herramientas de desarrollador detectadas!');
        // window.location.href = 'about:blank'; // Ejemplo: redirigir
    };
    // No invocar directamente, el navegador lo hará si las devtools están abiertas
    // Esto es más un "truco" y su efectividad varía entre navegadores/versiones
    // debugger; // Si se usa "debugger;", puede detener la ejecución al abrir las devtools
});

// Nota importante: Ninguna de estas medidas es 100% infalible.
// Un usuario determinado siempre puede encontrar formas de eludir estas protecciones,
// especialmente a nivel de sistema operativo (ej. tomar una foto de la pantalla).
// El objetivo es dificultar la copia y la distribución no autorizada.