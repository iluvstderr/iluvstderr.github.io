async function initNavigation() {
    const navContainer = document.getElementById('main-nav');
    if (!navContainer) return;

    navContainer.innerHTML = '';

    try {
        const navData = await fetch("/data/routes.json").then(res => res.json());

        let navLinks = '<span class="separator">: </span>';
        navData.forEach(nav => {
            navLinks += `
                <a href="${nav.reference}" ${nav.reference.startsWith('http') ? 'target="_blank"' : ''}>
                    ${nav.label}
                </a>
            <span class="separator">:</span>`;

            // Placeholder para íconos si decides usarlos luego
            // if (nav.icon_src) {
            //     navLinks += `<img src="${nav.icon_src}" alt="${nav.label}" class="nav-icon" style="height: 16px; filter: brightness(0) invert(1);">`;
            // }
        });

        navContainer.innerHTML = navLinks;

        // Navegación interna (sin recargar)
        document.querySelectorAll('.nav a').forEach(link => {
            if (!link.getAttribute('target')) {
                link.addEventListener('click', function(event) {
                    const href = this.getAttribute('href');
                    if (href.startsWith('?')) {
                        event.preventDefault();
                        const newUrl = window.location.pathname + href;
                        history.pushState(null, '', newUrl);
                        const path = new URLSearchParams(href).get('path');
                        loadContent(path); // asegúrate de tener esta función definida
                    }
                });
            }
        });

        // Soporte para botones atrás/adelante del navegador
        window.addEventListener('popstate', function () {
            const path = new URLSearchParams(window.location.search).get('path');
            loadContent(path);
        });
    } catch (error) {
        console.error('Error al inicializar navegación:', error);
    }
}

// Ejecutar automáticamente al cargar cualquier página
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
});
