document.addEventListener('DOMContentLoaded', async () => {
    try {
        const topicsStructure = await loadTopicsStructure();
        await initNavigation(topicsStructure);
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path') || '';
        await loadContent(path);
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        document.getElementById('content-container').innerHTML = `
              <div class="error">
                <h2>Error al cargar el contenido</h2>
                <p>${error.message}</p>
              </div>
            `;
    }
});

async function loadContent(path = '') {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = '<div class="loading">Cargando contenido...</div>';
    try {
        const topicsStructure = await loadTopicsStructure();
        const node = findNode(path, topicsStructure);
        if (!path) {
            contentContainer.innerHTML = `
                <div class="topic-list">
                  <h2>Índice de /</h2>
                  ${topicsStructure
                    .filter(file => !RESERVED_WORDS.includes(file.name))
                    .map(file => `
                        <div class="topic-item">
                            <a href="?path=${file.path}">
                               • ${file.type === 'dir' ? file.name + '/' : file.name}
                            </a>
                        </div>
                      `).join('')}
                </div>`;
            return;
        }

        if (!node) {
            throw new Error(`Ruta no encontrada: ${path}`);
        }

        if (node.type === 'file') {
            const mdFile = await loadMarkdownFile(node.download_url);
            const mdContent = renderMarkdown(mdFile);
            contentContainer.innerHTML = `
                <div class="markdown-wrapper">
                    <div class="top-nav">
                        <a class="nav-link" href="?path=${path.split('/').slice(0, -1).join('/')}">← Volver al índice</a>
                    </div>
                    <div class="markdown-content" id="markdown-content">
                        ${mdContent || '<p>No hay contenido en este archivo.</p>'}
                    </div>
                    <div class="bottom-nav" id="bottom-nav" style="display: none;">
                        <a class="nav-link" href="#">↑ Volver arriba</a>
                    </div>
                </div>
            `;
            updateBreadcrumbs(path);

            function handleScroll() {
                const content = document.getElementById('markdown-content');
                const bottomNav = document.getElementById('bottom-nav');
                if (!content || !bottomNav) return;

                const contentRect = content.getBoundingClientRect();
                const contentVisible = contentRect.top >= 0 && contentRect.bottom <= window.innerHeight;
                const scrolledPast = window.scrollY > content.offsetTop + content.offsetHeight * 0.6;

                if (!contentVisible && scrolledPast) {
                    bottomNav.style.display = 'block';
                } else {
                    bottomNav.style.display = 'none';
                }
            }

            window.addEventListener('scroll', handleScroll);
            requestAnimationFrame(handleScroll); // primera verificación

        } else {
            let html = `<div class="topic-list">
                <h2>Índice de /${path}</h2>
                <div class="topic-item">
                  • <a href="?path=${path.split('/').slice(0, -1).join('/')}">../</a>
                </div>`;
            html += node.children && node.children.length
                ? node.children.filter(item => !RESERVED_WORDS.includes(item.name))
                                .map(item => `
                  <div class="topic-item">
                    • <a href="?path=${item.path}">${item.type === 'dir' ? item.name + '/' : item.name}</a>
                  </div>
                `).join('')
                : `<p>No hay contenido en este directorio.</p>`;
            html += '</div>';
            contentContainer.innerHTML = html;
            updateBreadcrumbs(path);
        }

        hljs.highlightAll();

    } catch (error) {
        console.error('Error al cargar el contenido:', error);
        contentContainer.innerHTML = `
          <div class="error">
            <h2>Error al cargar el contenido</h2>
            <p>${error.message}</p>
          </div>
        `;
    }
}

function updateBreadcrumbs(path) {
    const breadcrumbContainer = document.getElementById('breadcrumb');
    if (!breadcrumbContainer) return;
    const parts = path.split('/').filter(Boolean);
    let currentPath = '';
    breadcrumbContainer.innerHTML = parts.map(part => {
        currentPath += (currentPath ? '/' : '') + part;
        return ` > <a href="?path=${currentPath}">${part}</a>`;
    }).join('');
}

function findNode(path, tree) {
    return path.split('/').filter(Boolean).reduce((current, part) =>
        current && current.children ?
            current.children.find(item => item.name === part) : null, { children: tree });
}