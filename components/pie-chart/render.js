function render(data, properties) {
    const { content } = properties;
    
    // 处理变量替换
    const finalContent = replaceVariables(content, data);
    
    return `
        <div class="pie-chart-component">
            <div>${finalContent}</div>
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
    window.PieChartRenderer = { render };
}