// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    const licenseInput = document.getElementById('license-input');
    const validateButton = document.getElementById('validate-license-btn');
    const licenseMessage = document.getElementById('license-message');
    const ebookContainer = document.getElementById('ebook-container');
    const licenseFormContainer = document.getElementById('license-form-container');

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    const VALIDATE_LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license';
    const SEND_WELCOME_EMAIL_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/send-welcome-on-login';

    // Referencias a los inputs de Nombre y Correo Electrónico (todavía necesarios para el email de bienvenida)
    const userNameInput = document.getElementById('user-name-input');
    const userEmailInput = document.getElementById('user-email-input');

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

    // Función para notificar al servidor que envíe el correo de bienvenida
    const notifyServerToSendWelcomeEmail = async (userName, userEmail, licenseKey) => {
        // Solo intenta enviar si tenemos ambos, nombre y correo, y la licencia (opcional, pero buena práctica)
        if (!userName || !userEmail || !licenseKey) {
            console.warn("No se puede enviar el correo de bienvenida: faltan nombre, correo electrónico o clave de licencia.");
            return; // No intentar enviar si faltan datos
        }
        try {
            const response = await fetch(SEND_WELCOME_EMAIL_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, userEmail, licenseKey }), // Se envía licenseKey aquí para el registro de usuario si fuera necesario en el futuro
            });

            const data = await response.json();
            if (data.success) {
                console.log('Notificación de envío de correo de bienvenida al servidor exitosa:', data.message);
            } else {
                console.warn('Fallo al notificar al servidor para enviar correo de bienvenida:', data.message);
            }
        } catch (error) {
            console.error('Error de red al notificar al servidor para enviar correo de bienvenida:', error);
        }
    };


    // Función para validar la licencia
    const validateLicense = async () => {
        const license = licenseInput.value.trim(); // Obtiene el valor directamente del input
        const userName = userNameInput.value.trim(); // Recoger para email
        const userEmail = userEmailInput.value.trim(); // Recoger para email

        // *** CAMBIO CRÍTICO AQUÍ: VALIDACIÓN FRONEND DE CAMPO VACÍO ***
        if (!license) {
            showMessage('Por favor, ingresa tu clave de licencia.', 'error');
            return; // DETIENE la ejecución si la licencia está vacía ANTES de enviar al servidor
        }
        // ***************************************************************

        // Este bloque es para la advertencia del email de bienvenida, no bloquea el acceso
        if (!userName || !userEmail) {
             console.warn("Nombre o correo electrónico no proporcionados. El email de bienvenida no se enviará.");
        }

        showMessage('Validando licencia...', 'info');

        try {
            const response = await fetch(VALIDATE_LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // *** Esto es correcto: SOLO se envía licenseKey al endpoint de validación ***
                body: JSON.stringify({ licenseKey: license }),
            });

            const data = await response.json();

            if (data.success) {
                // Licencia válida
                localStorage.setItem('ebook_license', license);
                if (userName) localStorage.setItem('ebook_userName', userName);
                if (userEmail) localStorage.setItem('ebook_userEmail', userEmail);

                showEbook();

                // Dispara el envío del correo de bienvenida aquí.
                notifyServerToSendWelcomeEmail(userName, userEmail, license);

            } else {
                // Licencia inválida o expirada o límite de IPs
                showMessage(data.message, 'error');
                localStorage.removeItem('ebook_license');
                localStorage.removeItem('ebook_userName');
                localStorage.removeItem('ebook_userEmail');
            }
        } catch (error) {
            console.error('Error al validar la licencia:', error);
            showMessage('Error de conexión con el servidor. Intenta de nuevo más tarde.', 'error');
            localStorage.removeItem('ebook_license');
            localStorage.removeItem('ebook_userName');
            localStorage.removeItem('ebook_userEmail');
        }
    };

    validateButton.addEventListener('click', validateLicense);

    licenseInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            validateLicense();
        }
    });
    // También para los otros campos para comodidad del usuario
    userNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            validateLicense();
        }
    });
    userEmailInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            validateLicense();
        }
    });


    // Lógica para auto-validar al cargar la página si ya hay datos guardados
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_userName');
    const storedUserEmail = localStorage.getItem('ebook_userEmail');

    if (storedLicense) {
        licenseInput.value = storedLicense;
        if (storedUserName) userNameInput.value = storedUserName;
        if (storedUserEmail) userEmailInput.value = storedUserEmail;

        // **AHORA SÍ LLAMAMOS A validateLicense AUTOMÁTICAMENTE AL CARGAR**
        validateLicense();
    }
});