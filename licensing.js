// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    const licenseInput = document.getElementById('license-input');
    const validateButton = document.getElementById('validate-license-btn');
    const licenseMessage = document.getElementById('license-message');
    const ebookContainer = document.getElementById('ebook-container');
    const licenseFormContainer = document.getElementById('license-form-container');

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    const LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license'; // Asegúrate de que esta URL sea la correcta para la validación

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

    // Función para validar la licencia
    const validateLicense = async (license) => {
        if (!license) {
            showMessage('Por favor, introduce una clave de licencia.');
            return false;
        }

        // **AHORA OBTENEMOS LOS VALORES DE LOS NUEVOS INPUTS**
        const userName = userNameInput.value.trim();
        const userEmail = userEmailInput.value.trim();

        if (!userName || !userEmail) {
            showMessage('Por favor, rellena tu nombre y email.');
            return false;
        }
        // ***************************************************

        try {
            const response = await fetch(LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    licenseKey: license,
                    userName: userName, // AHORA ESTO VIENE DEL INPUT
                    userEmail: userEmail // AHORA ESTO VIENE DEL INPUT
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('ebook_license', license);
                // Opcional: También guardar userName y userEmail si necesitas revalidar automáticamente más tarde
                // localStorage.setItem('ebook_userName', userName);
                // localStorage.setItem('ebook_userEmail', userEmail);
                showEbook();
                return true;
            } else {
                showMessage(data.message || 'Licencia inválida. Inténtalo de nuevo.');
                localStorage.removeItem('ebook_license');
                // localStorage.removeItem('ebook_userName');
                // localStorage.removeItem('ebook_userEmail');
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

    // Permitir validar la licencia también con la tecla Enter en el input de licencia
    licenseInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const license = licenseInput.value.trim();
            validateLicense(license);
        }
    });

    // **IMPORTANTE**: Lógica para auto-validar al cargar la página
    // Si quieres que el ebook se muestre automáticamente si ya hay una licencia en localStorage,
    // y dado que ahora necesitas userName y userEmail, tienes dos opciones:
    // 1. Guardar también userName y userEmail en localStorage cuando la licencia es válida.
    // 2. Pedir al usuario que los ingrese de nuevo cada vez que acceda, aunque la licencia esté guardada.

    const storedLicense = localStorage.getItem('ebook_license');
    // Para simplificar por ahora, vamos a auto-validar si existe una licencia guardada,
    // pero el usuario deberá reingresar su nombre/email si no los guardas también.
    // Una implementación más robusta guardaría también el nombre/email.
    if (storedLicense) {
        licenseInput.value = storedLicense; // Precarga la licencia guardada
        // Aquí no llamamos a validateLicense automáticamente, ya que requeriría nombre/email.
        // El usuario deberá presionar "Validar Licencia" con los campos rellenos.
        // Si necesitas auto-validación completa, tendrías que guardar más datos en localStorage
        // y pasarlos a validateLicense aquí.
    }
});