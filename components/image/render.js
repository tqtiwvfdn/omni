function render(data, properties) {
    const { url, alt, width, height, borderRadius, objectFit } = properties;
    
    // 处理变量替换
    const finalUrl = replaceVariables(url, data);
    const finalAlt = replaceVariables(alt, data);
    
    const style = `
        width: ${width};
        height: ${height};
        border-radius: ${borderRadius};
        object-fit: ${objectFit};
        display: block;
    `;
    
    return `
        <div class="image-component">
            <img src="${finalUrl}" alt="${finalAlt}" style="${style}" />
        </div>
    `;
}

function replaceVariables(text, data) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
}

// 导出渲染函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { render };
} else if (typeof window !== 'undefined') {
    window.ImageRenderer = { render };
}