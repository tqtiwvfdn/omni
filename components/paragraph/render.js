function render(data, properties) {
    const { text, fontSize, lineHeight, color, textAlign } = properties;
    
    // 处理变量替换
    const finalText = replaceVariables(text, data);
    
    const style = `
        font-size: ${fontSize};
        line-height: ${lineHeight};
        color: ${color};
        text-align: ${textAlign};
        margin: 0;
        padding: 0;
    `;
    
    return `
        <div class="paragraph-component">
            <p style="${style}">${finalText}</p>
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
    window.ParagraphRenderer = { render };
}