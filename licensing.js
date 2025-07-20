// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    // **ACTUALIZADO**: Nuevos IDs de tus inputs y botón
    const userNameInput = document.getElementById('userNameInput'); // Coincide con tu HTML
    const userEmailInput = document.getElementById('userEmailInput'); // Coincide con tu HTML
    const licenseInput = document.getElementById('licenseKeyInput'); // Coincide con tu HTML
    const validateButton = document.getElementById('accessEbookBtn'); // Coincide con tu HTML

    // Estos asumo que no han cambiado
    const licenseMessage = document.getElementById('responseMessage'); // Asumo que 'responseMessage' es tu elemento de mensaje
    const ebookContainer = document.getElementById('ebookContent'); // Asumo que 'ebookContent' es tu contenedor de ebook
    const licenseFormContainer = document.getElementById('access-container'); // Asumo que 'access-container' es el formulario

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    const LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license';

    // Función para mostrar mensajes
    const showMessage = (msg, type = 'error') => {
        licenseMessage.textContent = msg;
        licenseMessage.className = `message ${type}`;
        // Opcional: limpiar el mensaje después de un tiempo
        setTimeout(() => {
            licenseMessage.textContent = '';
            licenseMessage.className = 'message';
        }, 5000);
    };

    // Función para mostrar el ebook y aplicar la animación
    const showEbook = () => {
        // Oculta el formulario de licencia con la animación
        licenseFormContainer.classList.remove('show');
        licenseFormContainer.classList.add('hidden');

        // Muestra el ebook con la animación
        ebookContainer.classList.add('visible');
        document.body.classList.add('ebook-active'); // Cambia el fondo del body

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
    };


    // Función para obtener la IP del usuario desde un servicio externo
    const getUserIp = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Error al obtener la IP del usuario:", error);
            return 'UNKNOWN'; // Retorna 'UNKNOWN' si falla para no bloquear la validación
        }
    };

    // Función para validar la licencia
    const validateLicense = async (license) => {
        const userName = userNameInput.value.trim();
        const userEmail = userEmailInput.value.trim();
        const userIp = await getUserIp(); // Obtener la IP

        // Validar que todos los campos necesarios estén presentes
        if (!license || !userName || !userEmail) { // userIp no se valida aquí porque podría ser 'UNKNOWN'
            showMessage('Por favor, ingresa tu nombre, correo y la clave de licencia.');
            return false;
        }

        showMessage('Validando licencia...', 'info'); // Mensaje de carga
        validateButton.disabled = true; // Deshabilitar botón durante la validación

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
                    userIp: userIp // Incluir la IP en la solicitud
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
            validateButton.disabled = false; // Habilitar el botón nuevamente
        }
    };

    // Asignar el evento click al botón de validación
    validateButton.addEventListener('click', () => {
        const license = licenseInput.value.trim();
        validateLicense(license);
    });

    // Permitir validar la licencia también con la tecla Enter en el input de licencia
    licenseInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const license = licenseInput.value.trim();
            validateLicense(license);
        }
    });

    // Permitir validar también con Enter en los campos de nombre y email
    userNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const license = licenseInput.value.trim();
            validateLicense(license);
        }
    });

    userEmailInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const license = licenseInput.value.trim();
            validateLicense(license);
        }
    });

    // **IMPORTANTE**: Lógica para auto-validar al cargar la página
    // Si la licencia y los datos del usuario están guardados, precargarlos y validar automáticamente.
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_user_name');
    const storedUserEmail = localStorage.getItem('ebook_user_email');

    if (storedLicense && storedUserName && storedUserEmail) {
        licenseInput.value = storedLicense;
        userNameInput.value = storedUserName;
        userEmailInput.value = storedUserEmail;
        validateLicense(storedLicense); // Intentar auto-validar
    }
});