async function loadTopicsStructure() {
    const now = Date.now();
    const cached = sessionStorage.getItem(CACHE_KEY);
    const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime && now - cachedTime < CACHE_LIFETIME) {
        return JSON.parse(cached);
    }

    try {
        const tree = await fetchDirectory();
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(tree));
        sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
        return tree;
    } catch (err) {
        console.error("Error cargando estructura:", err);
        throw err;
    }
}

async function fetchDirectory(path = "") {
    // TODO: Puede que en un futuro se demore demasiado, actualmente se se le hace request
    //        recursivamente a cada uno de los dirs del repo, debo establecer un limite de
    //        o ver que medida tomo para optimizar y salir del O(n), al menos luchar por O(log(n))
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) throw new Error(`Error en ${path}: ${response.statusText}`);

    const contents = await response.json();

    return (await Promise.all(contents.map(async item => {
        if (item.type === "dir") {
            const children = await fetchDirectory(item.path);
            return {
                name: item.name,
                path: item.path,
                type: "dir",
                children: children
            };
        } else {
            return {
                name: item.name,
                path: item.path,
                type: "file",
                download_url: item.download_url
            };
        }
    }))).filter(item => item !== null);
}

async function loadMarkdownFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al cargar el archivo: ${response.statusText}`);
        }

        const rawResponse = await response.text();
        const extension = getExtension(url);

        if (extension !== 'md') {
            try {
                if (extension === 'svg') {
                    return `<img src="${url}" alt="Imagen" />`;
                }
                return renderCodeFile(rawResponse, extension);
            } catch (error) {
                // render el contenido sin markdown en caso de ser una imagen
                // o un archivo de texto
                const IMG_FILE_REGEX = /\.(png|jpg|jpeg|gif|webp)$/i;
                if (IMG_FILE_REGEX.test(url)) {
                    return `<img src="${url}" alt="Imagen" />`;
                } else {
                    return `<p>Nada que ver aquí, pero el archivo es de tipo <b>${extension.toUpperCase()}</b>.</p>`;
                }
            }
        }

        return fixRelativePaths(rawResponse, url);
    } catch (error) {
        console.error('Error al cargar el archivo: ', error);
        throw error;
    }
}

