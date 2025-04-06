document.addEventListener('DOMContentLoaded', async () => {
    try {
        const topicsStructure = await loadTopicsStructure();
        await initNavigation(topicsStructure);
        const urlParams = new URLSearchParams(window.location.search);
        const path = topicsStructure.length === 1 ? topicsStructure[0].path : urlParams.get('path') || '';
        urlParams.set('path', path);
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
                  ${topicsStructure.map(cat => `
                    <div class="topic-item">
                      • <a href="?path=${cat.path}">${cat.type === 'dir' ? cat.name + '/' : cat.name}</a>
                    </div>
                  `).join('')}
                </div>`;
            return;
        }
        if (!node) throw new Error(`Ruta no encontrada: ${path}`);
        if (node.type !== 'dir') {
            const mdFile = await loadMarkdownFile(node.download_url);
            contentContainer.innerHTML = `
                <div class="markdown-content">
                  ${renderMarkdown(mdFile)}
                </div>
          `;
            updateBreadcrumbs(path);
        } else {
            let html = `<div class="topic-list">
                <h2>Índice de /${path}</h2>
                <div class="topic-item">
                  • <a href="?path=${path.split('/').slice(0, -1).join('/')}">../</a>
                </div>`;
            html += node.children && node.children.length
                ? node.children.map(item => `
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
