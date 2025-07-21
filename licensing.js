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

    // **Referencias a los inputs de Nombre y Correo Electrónico (todavía necesarios para el email de bienvenida)**
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
        // Solo intenta enviar si tenemos ambos, nombre y correo
        if (!userName || !userEmail) {
            console.warn("No se puede enviar el correo de bienvenida: faltan nombre o correo electrónico.");
            return;
        }
        try {
            const response = await fetch(SEND_WELCOME_EMAIL_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, userEmail, licenseKey }),
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
        const license = licenseInput.value.trim();
        // Recogemos userName y userEmail, pero solo para el email de bienvenida, no para la validación de licencia
        const userName = userNameInput.value.trim();
        const userEmail = userEmailInput.value.trim();

        if (!license) {
            showMessage('Por favor, ingresa tu clave de licencia.', 'error');
            return;
        }

        showMessage('Validando licencia...', 'info');

        try {
            const response = await fetch(VALIDATE_LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ licenseKey: license }), // Solo enviamos la licencia
            });

            const data = await response.json();

            if (data.success) {
                // Licencia válida
                localStorage.setItem('ebook_license', license);
                // Guardamos nombre y email para persistencia si el usuario accede de nuevo
                localStorage.setItem('ebook_userName', userName);
                localStorage.setItem('ebook_userEmail', userEmail);

                showEbook();

                // Dispara el envío del correo de bienvenida aquí
                // Se envía SOLO si userName y userEmail están presentes
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

    // Lógica para auto-validar al cargar la página si ya hay datos guardados
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_userName');
    const storedUserEmail = localStorage.getItem('ebook_userEmail');

    if (storedLicense) { // Si hay una licencia guardada, precargamos los campos
        licenseInput.value = storedLicense;
        // Solo precargamos nombre y email si también están guardados
        if (storedUserName) userNameInput.value = storedUserName;
        if (storedUserEmail) userEmailInput.value = storedUserEmail;

        // Intentamos auto-validar si todos los campos necesarios para el acceso están presentes
        // Para la validación de licencia, solo se necesita la licencia.
        // Para el email de bienvenida (si se vuelve a disparar), se necesita nombre y email.
        // Aquí se decide si se valida automáticamente o se requiere interacción del usuario.
        // Por la nueva lógica, solo la licencia es indispensable para el acceso.
        // PERO, para evitar reenviar emails innecesariamente, solo validamos la licencia
        // automáticamente y el email se dispara con la primera interacción "manual" (o si no se envió antes).
        validateLicense(); // Llama a la validación, que ahora solo necesita la licencia.
    }
});