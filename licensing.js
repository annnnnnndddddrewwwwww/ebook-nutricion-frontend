// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    // **ACTUALIZADO**: Asegúrate de que estos IDs coincidan exactamente con tu index.html
    const userNameInput = document.getElementById('userNameInput');     // Coincide con tu HTML
    const userEmailInput = document.getElementById('userEmailInput');   // Coincide con tu HTML
    const licenseInput = document.getElementById('licenseKeyInput');    // Coincide con tu HTML
    const validateButton = document.getElementById('accessEbookBtn');   // Coincide con tu HTML

    // Asegúrate de que estos IDs también coincidan con tu HTML para el mensaje y el contenedor del ebook
    const licenseMessage = document.getElementById('responseMessage'); // Este es tu <p id="responseMessage">
    const ebookContainer = document.getElementById('ebookContent');    // Este es tu <div id="ebookContent">
    const licenseFormContainer = document.getElementById('access-container'); // Este es tu <div id="access-container">

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    const LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license';

    // Función para mostrar mensajes
    const showMessage = (msg, type = 'error') => {
        if (licenseMessage) { // Asegúrate de que el elemento exista antes de intentar manipularlo
            licenseMessage.textContent = msg;
            licenseMessage.className = `message ${type}`;
            setTimeout(() => {
                licenseMessage.textContent = '';
                licenseMessage.className = 'message';
            }, 5000); // El mensaje desaparece después de 5 segundos
        } else {
            console.warn('Elemento #responseMessage no encontrado en el DOM para mostrar el mensaje:', msg);
        }
    };

    // Función para mostrar el ebook y aplicar la animación
    const showEbook = () => {
        if (licenseFormContainer && ebookContainer) {
            // Oculta el formulario de licencia con la animación
            licenseFormContainer.classList.remove('show');
            licenseFormContainer.classList.add('hidden'); // Añade la clase 'hidden' para ocultar

            // Muestra el ebook con la animación
            ebookContainer.classList.add('visible'); // Añade la clase 'visible' para mostrar y animar
            document.body.classList.add('ebook-active'); // Cambia el fondo del body si es necesario

            // Agrega el efecto de brillo
            const glowOverlay = document.createElement('div');
            glowOverlay.classList.add('ebook-unlocked-overlay');
            document.body.appendChild(glowOverlay);
            setTimeout(() => {
                glowOverlay.remove(); // Elimina el brillo después de la animación
            }, 1500); // Duración de la animación en CSS

            showMessage('¡Licencia válida! Disfruta de tu Ebook.', 'success');
            
            // Opcional: Ocultar el botón de WhatsApp cuando el ebook está abierto
            const whatsappButton = document.querySelector('.whatsapp-button');
            if (whatsappButton) {
                whatsappButton.style.display = 'none';
            }
        } else {
            console.error('No se encontraron los contenedores del formulario o del ebook (access-container o ebookContent).');
        }
    };

    // **Función para obtener la IP del usuario desde un servicio externo**
    const getUserIp = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) {
                console.error(`Error al obtener IP: ${response.status} ${response.statusText}`);
                return 'UNKNOWN_FETCH_ERROR';
            }
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Fallo al conectar con api.ipify.org para obtener la IP:", error);
            return 'UNKNOWN_NETWORK_ERROR'; // Retorna un valor diferente si falla la red
        }
    };

    // Función para validar la licencia
    const validateLicense = async (license) => {
        // Asegúrate de que los elementos de input existen antes de intentar leer sus valores
        if (!userNameInput || !userEmailInput || !licenseInput) {
            console.error('Uno o más elementos de entrada (nombre, email, licencia) no fueron encontrados.');
            showMessage('Error interno: Faltan elementos de entrada en la página.');
            return false;
        }

        const userName = userNameInput.value.trim();
        const userEmail = userEmailInput.value.trim();
        const userIp = await getUserIp(); // <--- AQUÍ SE OBTIENE LA IP

        // Validar que todos los campos necesarios estén presentes
        // Ahora también validamos que la IP no sea uno de los valores de error
        if (!license || !userName || !userEmail || userIp === 'UNKNOWN_NETWORK_ERROR' || userIp === 'UNKNOWN_FETCH_ERROR') {
            let errorMessage = 'Por favor, ingresa tu nombre, correo y la clave de licencia.';
            if (userIp === 'UNKNOWN_NETWORK_ERROR' || userIp === 'UNKNOWN_FETCH_ERROR') {
                errorMessage += ' No se pudo obtener tu dirección IP. Intenta de nuevo.';
            }
            showMessage(errorMessage);
            // No retorna false inmediatamente para permitir que el servidor devuelva el 400 por userIp
            // si el cliente lo envía como 'UNKNOWN_...' pero el servidor aún lo espera.
            // Para pruebas, es mejor que el servidor maneje el 400 por IP faltante o inválida.
            if (!license || !userName || !userEmail) return false; // Solo retorna false si los campos básicos están vacíos
        }

        if (validateButton) validateButton.disabled = true; // Deshabilitar botón durante la validación
        showMessage('Validando licencia...', 'info'); // Mensaje de carga

        try {
            const response = await fetch(LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    license: license,
                    userName: userName,
                    userEmail: userEmail,
                    userIp: userIp // <--- AQUÍ SE ENVÍA LA IP
                })
            });

            const data = await response.json();

            if (data.success) {
                // Guarda la licencia, nombre y email en localStorage
                localStorage.setItem('ebook_license', license);
                localStorage.setItem('ebook_user_name', userName);
                localStorage.setItem('ebook_user_email', userEmail);
                showEbook();
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Error al validar la licencia:', error);
            showMessage('Error al conectar con el servidor de licencias. Inténtalo de nuevo más tarde.', 'error');
        } finally {
            if (validateButton) validateButton.disabled = false; // Habilitar el botón nuevamente
        }
    };

    // Asignar el evento click al botón de validación
    if (validateButton) {
        validateButton.addEventListener('click', () => {
            const license = licenseInput.value.trim();
            validateLicense(license);
        });
    } else {
        console.error('Elemento #accessEbookBtn no encontrado en el DOM.');
    }

    // Permitir validar la licencia también con la tecla Enter en los inputs
    const addEnterKeyListener = (inputElement) => {
        if (inputElement) {
            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Evitar el envío de formulario si está dentro de uno
                    const license = licenseInput.value.trim();
                    validateLicense(license);
                }
            });
        }
    };

    addEnterKeyListener(licenseInput);
    addEnterKeyListener(userNameInput);
    addEnterKeyListener(userEmailInput);

    // **IMPORTANTE**: Lógica para auto-validar al cargar la página
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_user_name');
    const storedUserEmail = localStorage.getItem('ebook_user_email');

    if (storedLicense && storedUserName && storedUserEmail) {
        // Precarga los valores en los inputs (solo si los inputs existen)
        if (licenseInput) licenseInput.value = storedLicense;
        if (userNameInput) userNameInput.value = storedUserName;
        if (userEmailInput) userEmailInput.value = storedUserEmail;
        
        // Intenta auto-validar solo si todos los inputs necesarios están presentes en el DOM
        if (licenseInput && userNameInput && userEmailInput) {
            validateLicense(storedLicense); // Intentar auto-validar
        } else {
            console.warn('No se pudo auto-validar al cargar la página porque faltan elementos de entrada.');
            showMessage('Por favor, ingresa tu información para acceder al ebook.');
        }
    }
});