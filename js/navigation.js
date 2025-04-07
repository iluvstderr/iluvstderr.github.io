async function initNavigation() {
    const navContainer = document.getElementById('main-nav');
    if (!navContainer) return;

    navContainer.innerHTML = '';

    try {
        const navData = await fetch("/data/routes.json").then(res => res.json());
        const SEPARATOR = ' . ';
        let navLinks = `<span class="separator">${SEPARATOR}</span>`;
        navData.forEach(nav => {
            navLinks += `
                <a href="${nav.reference}"} 
                    ${nav.props ? Object.entries(nav.props).map(([key, value]) => `${key}="${value}"`).join(' ') : ''}>
                    ${nav.label}${nav.icon_src? `<img src="${nav.icon_src}" alt="${nav.label}" class="nav-icon" style="height: 10px; filter: brightness(0) invert(1);">` : ''}
                </a>
            <span class="separator">${SEPARATOR}</span>
        `;
        });

        navContainer.innerHTML = navLinks;

        document.querySelectorAll('.nav a').forEach(link => {
            if (!link.getAttribute('target')) {
                link.addEventListener('click', function(event) {
                    const href = this.getAttribute('href');
                    if (href.startsWith('?')) {
                        event.preventDefault();
                        const newUrl = window.location.pathname + href;
                        history.pushState(null, '', newUrl);
                    }
                });
            }
        });
    } catch (error) {
        console.error("Error al inicializar navegación: ", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
});
