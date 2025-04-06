function fixRelativePaths(md, mdPath) {
    const fullBase = mdPath.substring(0, mdPath.lastIndexOf("/") + 1);

    return md.replace(/!\[([^\]]*)]\((?!http)([^)]+)\)/g, (match, alt, imgPath) => {
        const normalized = imgPath.replace(/^\.\//, ''); // elimina './' inicial si lo hay
        return `![${alt}](${fullBase}${normalized})`;
    });
}

function getMarkdownTitle(md) {
    const match = md.match(/^# (.+)$/m);
    return match ? match[1].trim() : "Sin título";
}

function getExtension(fileName) {
    return fileName.split('/').pop().split('.').pop();
}