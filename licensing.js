// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    const licenseInput = document.getElementById('license-input');
    const validateButton = document.getElementById('validate-license-btn');
    const licenseMessage = document.getElementById('license-message');
    const ebookContainer = document.getElementById('ebook-container');
    const licenseFormContainer = document.getElementById('license-form-container');

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    // Una vez desplegado tu generador de licencias, OnRender te dará una URL (ej: https://mi-generador-licencias-abcde.onrender.com)
    const LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-license';

    // Función para mostrar mensajes
    const showMessage = (msg, type = 'error') => {
        licenseMessage.textContent = msg;
        licenseMessage.className = `message ${type}`;
    };

    // Función para mostrar el ebook
    const showEbook = () => {
        licenseFormContainer.classList.add('hidden');
        ebookContainer.classList.remove('hidden');
        showMessage('¡Licencia válida! Disfruta de tu Ebook.', 'success');
    };

    // Función para validar la licencia
    const validateLicense = async (license) => {
        if (!license) {
            showMessage('Por favor, introduce una clave de licencia.');
            return false;
        }

        try {
            const response = await fetch(LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ license: license })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                // Licencia válida: la guardamos en localStorage y mostramos el ebook
                localStorage.setItem('ebook_license', license);
                showEbook();
                return true;
            } else {
                // Licencia inválida o error del servidor
                showMessage(data.message || 'Licencia inválida. Inténtalo de nuevo.');
                localStorage.removeItem('ebook_license'); // Borra cualquier licencia inválida almacenada
                return false;
            }
        } catch (error) {
            console.error('Error al validar la licencia:', error);
            showMessage('Error de conexión con el servidor de licencias. Por favor, inténtalo de nuevo más tarde.');
            return false;
        }
    };

    // Event listener para el botón de validar
    validateButton.addEventListener('click', () => {
        const license = licenseInput.value.trim();
        validateLicense(license);
    });

    // Permitir validar la licencia también con la tecla Enter en el input
    licenseInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const license = licenseInput.value.trim();
            validateLicense(license);
        }
    });

    // Al cargar la página, intentar validar una licencia guardada en localStorage
    const storedLicense = localStorage.getItem('ebook_license');
    if (storedLicense) {
        // Intentar validar la licencia almacenada automáticamente
        await validateLicense(storedLicense);
    }
});