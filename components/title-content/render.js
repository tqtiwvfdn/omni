function render(data, properties) {
    const { title, content, titleLevel, titleStyle, contentStyle } = properties;
    
    // 处理变量替换
    const finalTitle = replaceVariables(title, data);
    const finalContent = replaceVariables(content, data);
    
    return `
        <div class="title-content-component">
            <${titleLevel} style="${titleStyle}">${finalTitle}</${titleLevel}>
            <div class="content" style="${contentStyle}">${finalContent}</div>
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
    window.TitleContentRenderer = { render };
}