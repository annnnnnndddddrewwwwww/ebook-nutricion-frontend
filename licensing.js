// licensing.js

document.addEventListener('DOMContentLoaded', async () => {
    const licenseInput = document.getElementById('license-input');
    const validateButton = document.getElementById('validate-license-btn');
    const licenseMessage = document.getElementById('license-message');
    const ebookContainer = document.getElementById('ebook-container');
    const licenseFormContainer = document.getElementById('license-form-container');

    const LICENSE_SERVER_URL = 'https://mi-ebook-licencias-api.onrender.com/validate-and-register-license'; // Asegúrate de que esta URL sea la correcta para la validación

    const userNameInput = document.getElementById('user-name-input');
    const userEmailInput = document.getElementById('user-email-input');

    // --- Nuevas Referencias para el Ebook ---
    const ebookContentWrapper = document.getElementById('ebook-content-wrapper');
    const tocList = document.getElementById('toc-list');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const progressBar = document.getElementById('progress-bar');


    // Función para mostrar mensajes
    const showMessage = (msg, type = 'error') => {
        licenseMessage.textContent = msg;
        licenseMessage.className = `message ${type}`;
    };

    // Función para mostrar el ebook
    const showEbook = () => {
        licenseFormContainer.classList.add('hidden');
        ebookContainer.classList.remove('hidden');
        ebookContainer.classList.add('show'); // Añadir clase 'show' para la animación
        showMessage('¡Licencia válida! Disfruta de tu Ebook.', 'success');

        // *** Inicializar las nuevas funcionalidades del Ebook ***
        initializeEbookFeatures();
    };

    // Función para validar la licencia
    const validateLicense = async (license) => {
        if (!license) {
            showMessage('Por favor, introduce una clave de licencia.');
            return false;
        }

        const userName = userNameInput.value.trim();
        const userEmail = userEmailInput.value.trim();

        if (!userName || !userEmail) {
            showMessage('Por favor, rellena tu nombre y email.');
            return false;
        }

        try {
            const response = await fetch(LICENSE_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    license: license,
                    userName: userName,
                    userEmail: userEmail
                })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                localStorage.setItem('ebook_license', license);
                localStorage.setItem('ebook_userName', userName);
                localStorage.setItem('ebook_userEmail', userEmail);
                showEbook();
                return true;
            } else {
                showMessage(data.message || 'Licencia inválida. Inténtalo de nuevo.');
                localStorage.removeItem('ebook_license');
                localStorage.removeItem('ebook_userName');
                localStorage.removeItem('ebook_userEmail');
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

    // Lógica para auto-validar al cargar la página
    const storedLicense = localStorage.getItem('ebook_license');
    const storedUserName = localStorage.getItem('ebook_userName');
    const storedUserEmail = localStorage.getItem('ebook_userEmail');

    if (storedLicense && storedUserName && storedUserEmail) {
        licenseInput.value = storedLicense;
        userNameInput.value = storedUserName;
        userEmailInput.value = storedUserEmail;
        validateLicense(storedLicense); // Intenta auto-validar
    }


    // --- FUNCIONES PARA LAS NUEVAS CARACTERÍSTICAS DEL EBOOK ---

    function initializeEbookFeatures() {
        generateTableOfContents();
        setupFullScreen();
        setupReadingProgressBar();
    }

    /**
     * Genera el índice de contenidos dinámicamente.
     */
    function generateTableOfContents() {
        const ebookContent = document.getElementById('ebook-content');
        const headings = ebookContent.querySelectorAll('h1[id], h2[id], h3[id]'); // Selecciona h1, h2, h3 con IDs

        if (!headings.length) {
            console.warn("No se encontraron encabezados con IDs para generar el índice.");
            return;
        }

        headings.forEach(heading => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;

            // Añadir clase para indentación y estilo
            if (heading.tagName === 'H1') {
                li.classList.add('h1-level');
            } else if (heading.tagName === 'H2') {
                li.classList.add('h2-level');
            } else if (heading.tagName === 'H3') {
                li.classList.add('h3-level');
            }

            li.appendChild(a);
            tocList.appendChild(li);

            // Smooth scroll al hacer clic en el índice
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(heading.id).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    /**
     * Configura el botón de pantalla completa.
     */
    function setupFullScreen() {
        const htmlElement = document.documentElement; // Elemento para poner en pantalla completa (todo el documento)

        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                // Entrar en modo pantalla completa
                htmlElement.requestFullscreen().then(() => {
                    document.body.classList.add('fullscreen');
                    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>'; // Cambiar icono a "salir"
                    fullscreenBtn.title = "Salir de Pantalla Completa";
                }).catch(err => {
                    console.error(`Error al intentar entrar en pantalla completa: ${err.message} (${err.name})`);
                    showMessage('No se pudo activar el modo pantalla completa.', 'error');
                });
            } else {
                // Salir del modo pantalla completa
                document.exitFullscreen().then(() => {
                    document.body.classList.remove('fullscreen');
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>'; // Cambiar icono a "entrar"
                    fullscreenBtn.title = "Pantalla Completa";
                }).catch(err => {
                    console.error(`Error al intentar salir de pantalla completa: ${err.message} (${err.name})`);
                });
            }
        });

        // Actualizar el botón si el usuario sale con ESC o por otros medios
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                document.body.classList.remove('fullscreen');
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.title = "Pantalla Completa";
            }
        });
    }

    /**
     * Configura la barra de progreso de lectura.
     */
    function setupReadingProgressBar() {
        if (!ebookContentWrapper || !progressBar) {
            console.warn("Elementos de barra de progreso no encontrados.");
            return;
        }

        ebookContentWrapper.addEventListener('scroll', () => {
            const scrollTop = ebookContentWrapper.scrollTop;
            const scrollHeight = ebookContentWrapper.scrollHeight;
            const clientHeight = ebookContentWrapper.clientHeight;

            // Calcula el porcentaje de desplazamiento
            let scrollPercentage = 0;
            if (scrollHeight > clientHeight) { // Evita división por cero si no hay scroll
                scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
            }
            // Asegura que el porcentaje esté entre 0 y 100
            scrollPercentage = Math.max(0, Math.min(100, scrollPercentage));

            progressBar.style.width = `${scrollPercentage}%`;
        });

        // Asegurarse de que el cálculo se haga también al cargar (en caso de que el contenido ya sea desplazable)
        ebookContentWrapper.dispatchEvent(new Event('scroll'));
    }
});