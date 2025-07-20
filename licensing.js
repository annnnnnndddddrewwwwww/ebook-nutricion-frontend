// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    const licenseInput = document.getElementById('license-input');
    const validateButton = document.getElementById('validate-license-btn');
    const licenseMessage = document.getElementById('license-message');
    const ebookContainer = document.getElementById('ebook-container');
    const licenseFormContainer = document.getElementById('license-form-container');

    // **IMPORTANTE**: Reemplaza esta URL con la URL REAL de tu servicio de licencias en OnRender.
    const LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license'; // Asegúrate de que esta URL sea la correcta para la validación
    const USER_DATA_COLLECT_URL = 'https://mi-ebook-licencias-api.onrender.com/collect-user-data'; // URL para el nuevo endpoint de recopilación de datos

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
    const validateLicense = async () => { // Ya no recibe 'license' como parámetro directo
        const license = licenseInput.value.trim();
        const userName = userNameInput.value.trim(); // Obtener el valor del nombre de usuario
        const userEmail = userEmailInput.value.trim(); // Obtener el valor del email de usuario

        if (!license || !userName || !userEmail) {
            showMessage('Por favor, ingresa la clave de licencia, tu nombre y tu email.');
            return;
        }

        try {
            // Paso 1: Validar y registrar la licencia
            const response = await fetch(LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    licenseKey: license,
                    userName: userName, // Enviar userName
                    userEmail: userEmail // Enviar userEmail
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Si la validación de la licencia es exitosa, guardar en localStorage y mostrar ebook
                localStorage.setItem('ebook_license', license);
                localStorage.setItem('ebook_user_name', userName); // Guardar nombre
                localStorage.setItem('ebook_user_email', userEmail); // Guardar email

                showEbook();

                // Paso 2: Recopilar datos de usuario (se puede hacer en segundo plano si la licencia es válida)
                try {
                    const userDataResponse = await fetch(USER_DATA_COLLECT_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userName: userName,
                            userEmail: userEmail,
                            licenseKey: license,
                            timestamp: new Date().toISOString()
                        }),
                    });

                    const userData = await userDataResponse.json();
                    if (userData.success) {
                        console.log('Datos de usuario recopilados con éxito.');
                    } else {
                        console.warn('Error al recopilar datos de usuario:', userData.message);
                    }
                } catch (userError) {
                    console.error('Fallo en la conexión al recopilar datos de usuario:', userError);
                }

            } else {
                showMessage(`Error: ${data.message || 'Licencia inválida.'}`);
            }
        } catch (error) {
            console.error('Error al validar la licencia:', error);
            showMessage('Error de conexión con el servidor. Inténtalo de nuevo más tarde.');
        }
    };

    // Asignar el evento click al botón de validación
    validateButton.addEventListener('click', validateLicense);

    // Permitir validar la licencia también con la tecla Enter en los inputs
    licenseInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevenir el envío de formularios si hay uno
            validateLicense();
        }
    });

    userNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            validateLicense();
        }
    });

    userEmailInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            validateLicense();
        }
    });

    // **IMPORTANTE**: Lógica para auto-validar al cargar la página
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_user_name');
    const storedUserEmail = localStorage.getItem('ebook_user_email');

    // Si existen todos los datos guardados, precargarlos y mostrar el ebook directamente
    if (storedLicense && storedUserName && storedUserEmail) {
        licenseInput.value = storedLicense;
        userNameInput.value = storedUserName;
        userEmailInput.value = storedUserEmail;
        // Aquí podrías llamar a validateLicense() si quieres re-validar con el servidor cada vez,
        // pero para una experiencia fluida, si ya tienes los datos, puedes simplemente mostrar el ebook.
        // Si el estado de la licencia es crítico y puede cambiar en el servidor, sí deberías re-validar.
        // Por ahora, solo mostramos el ebook si ya hay datos guardados.
        showEbook();
    }
});