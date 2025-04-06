function renderMarkdown(markdownContent, basePath = '') {
    try {
        let html = marked.parse(markdownContent);

        html = processImages(html, basePath);

        return html;
    } catch (error) {
        console.error('Error al renderizar Markdown:', error);
        return `<div class="error">Error al renderizar el contenido: ${error.message}</div>`;
    }
}

function processImages(htmlContent, basePath) {
    if (!basePath) return htmlContent;

    const baseDir = basePath.split('/').slice(0, -1).join('/');

    return htmlContent.replace(
        /<img src="([^"]+)"/g,
        (match, src) => {
            if (src.startsWith('http') || src.startsWith('/')) {
                return match;
            }

            const imagePath = baseDir ? `mataburros/${baseDir}/${src}` : `mataburros/${src}`;
            return `<img src="${imagePath}"`;
        }
    );
}

function renderCodeFile(content, extension) {
    // FIXME: Sanitizar el contenido para evitar inyecciones de código.

    const highlighted = hljs.highlight(content, { language: extension }).value;
    return `<pre><code class="hljs language-${extension}">${highlighted}</code></pre>`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}