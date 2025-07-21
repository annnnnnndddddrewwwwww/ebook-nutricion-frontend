// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    const licenseInput = document.getElementById('license-input');
    const validateButton = document.getElementById('validate-license-btn');
    const licenseMessage = document.getElementById('license-message');
    const ebookContainer = document.getElementById('ebook-container');
    const licenseFormContainer = document.getElementById('license-form-container');

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    // Esta URL es para VALIDAR la licencia
    const VALIDATE_LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license'; 
    // NUEVA URL para enviar el correo de bienvenida al iniciar sesión
    const SEND_WELCOME_EMAIL_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/send-welcome-on-login';
    
    // **NUEVAS REFERENCIAS A LOS INPUTS**
    const userNameInput = document.getElementById('user-name-input');
    const userEmailInput = document.getElementById('user-email-input');
    // **********************************

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

    // NUEVA Función para notificar al servidor que envíe el correo de bienvenida
    const notifyServerToSendWelcomeEmail = async (userName, userEmail, licenseKey) => {
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
    const validateLicense = async () => { // Ya no recibe 'license' como parámetro directo, la lee del input
        const license = licenseInput.value.trim();
        const userName = userNameInput.value.trim();
        const userEmail = userEmailInput.value.trim();

        if (!license || !userName || !userEmail) {
            showMessage('Por favor, ingresa tu nombre, correo electrónico y clave de licencia.', 'error');
            return;
        }

        showMessage('Validando licencia...', 'info');

        try {
            const response = await fetch(VALIDATE_LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ licenseKey: license, userName, userEmail }),
            });

            const data = await response.json();

            if (data.success) {
                // Licencia válida
                localStorage.setItem('ebook_license', license);
                localStorage.setItem('ebook_userName', userName); // Guarda también el nombre
                localStorage.setItem('ebook_userEmail', userEmail); // Guarda también el email

                showEbook();

                // *** DISPARA EL ENVÍO DEL CORREO DE BIENVENIDA AQUÍ ***
                await notifyServerToSendWelcomeEmail(userName, userEmail, license);
                // ******************************************************

            } else {
                // Licencia inválida o expirada
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
            validateLicense(); // Llama a la función sin parámetros, leerá de los inputs
        }
    });

    // Lógica para auto-validar al cargar la página si ya hay datos guardados
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_userName');
    const storedUserEmail = localStorage.getItem('ebook_userEmail');

    if (storedLicense && storedUserName && storedUserEmail) {
        licenseInput.value = storedLicense;
        userNameInput.value = storedUserName;
        userEmailInput.value = storedUserEmail;

        // Auto-validar la licencia al cargar si los datos están completos
        // Esto imita un "inicio de sesión" automático
        validateLicense(); 
    }
});