// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    // Asegúrate de que estos IDs coincidan exactamente con tu index.html
    const userNameInput = document.getElementById('userNameInput');
    const userEmailInput = document.getElementById('userEmailInput');
    const licenseInput = document.getElementById('licenseKeyInput');
    const validateButton = document.getElementById('accessEbookBtn');

    // Asegúrate de que estos IDs también coincidan con tu HTML para el mensaje y el contenedor del ebook
    const licenseMessage = document.getElementById('responseMessage');
    const ebookContainer = document.getElementById('ebookContent');
    const licenseFormContainer = document.getElementById('access-container');

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    const LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license';

    // Función para mostrar mensajes
    const showMessage = (msg, type = 'error') => {
        if (licenseMessage) {
            licenseMessage.textContent = msg;
            licenseMessage.className = `message ${type}`;
            setTimeout(() => {
                licenseMessage.textContent = '';
                licenseMessage.className = 'message';
            }, 5000);
        } else {
            console.warn('Elemento #responseMessage no encontrado en el DOM para mostrar el mensaje:', msg);
        }
    };

    // Función para mostrar el ebook y aplicar la animación
    const showEbook = () => {
        if (licenseFormContainer && ebookContainer) {
            licenseFormContainer.classList.remove('show');
            licenseFormContainer.classList.add('hidden');

            ebookContainer.classList.add('visible');
            document.body.classList.add('ebook-active');

            const glowOverlay = document.createElement('div');
            glowOverlay.classList.add('ebook-unlocked-overlay');
            document.body.appendChild(glowOverlay);
            setTimeout(() => {
                glowOverlay.remove();
            }, 1500);

            showMessage('¡Licencia válida! Disfruta de tu Ebook.', 'success');

            const whatsappButton = document.querySelector('.whatsapp-button');
            if (whatsappButton) {
                whatsappButton.style.display = 'none';
            }
        } else {
            console.error('No se encontraron los contenedores del formulario o del ebook (access-container o ebookContent).');
        }
    };

    // Función para validar la licencia (userIp ya no se obtiene ni se usa aquí)
    const validateLicense = async (license) => {
        if (!userNameInput || !userEmailInput || !licenseInput) {
            console.error('Uno o más elementos de entrada (nombre, email, licencia) no fueron encontrados.');
            showMessage('Error interno: Faltan elementos de entrada en la página.');
            return false;
        }

        const userName = userNameInput.value.trim();
        const userEmail = userEmailInput.value.trim();

        // Validar que los campos necesarios estén presentes (userIp ya no se valida aquí)
        if (!license || !userName || !userEmail) {
            showMessage('Por favor, ingresa tu nombre, correo y la clave de licencia.');
            return false;
        }

        if (validateButton) validateButton.disabled = true;
        showMessage('Validando licencia...', 'info');

        try {
            const response = await fetch(LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    license: license,
                    userName: userName,
                    userEmail: userEmail
                    // userIp ya no se incluye aquí
                })
            });

            const data = await response.json();

            if (data.success) {
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
            if (validateButton) validateButton.disabled = false;
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
                    event.preventDefault();
                    const license = licenseInput.value.trim();
                    validateLicense(license);
                }
            });
        }
    };

    addEnterKeyListener(licenseInput);
    addEnterKeyListener(userNameInput);
    addEnterKeyListener(userEmailInput);

    // Lógica para auto-validar al cargar la página
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_user_name');
    const storedUserEmail = localStorage.getItem('ebook_user_email');

    if (storedLicense && storedUserName && storedUserEmail) {
        if (licenseInput) licenseInput.value = storedLicense;
        if (userNameInput) userNameInput.value = storedUserName;
        if (userEmailInput) userEmailInput.value = storedUserEmail;

        if (licenseInput && userNameInput && userEmailInput) {
            validateLicense(storedLicense);
        } else {
            console.warn('No se pudo auto-validar al cargar la página porque faltan elementos de entrada.');
            showMessage('Por favor, ingresa tu información para acceder al ebook.');
        }
    }
});