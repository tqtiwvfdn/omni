function render(data, properties) {
    const { text, type, action, size, disabled, icon } = properties;
    
    // 处理变量替换
    const finalText = replaceVariables(text, data);
    const finalAction = replaceVariables(action, data);
    const finalIcon = replaceVariables(icon, data);
    
    // 按钮样式映射
    const typeStyles = {
        primary: 'background: #2970FF; color: white; border: 1px solid #2970FF;',
        secondary: 'background: #f5f7fa; color: #1a202c; border: 1px solid #e1e8ed;',
        success: 'background: #10b981; color: white; border: 1px solid #10b981;',
        warning: 'background: #f59e0b; color: white; border: 1px solid #f59e0b;',
        danger: 'background: #ef4444; color: white; border: 1px solid #ef4444;'
    };
    
    const sizeStyles = {
        small: 'padding: 4px 8px; font-size: 12px;',
        medium: 'padding: 8px 16px; font-size: 14px;',
        large: 'padding: 12px 24px; font-size: 16px;'
    };
    
    const baseStyle = `
        border-radius: 6px;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        border: none;
        font-weight: 500;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        opacity: ${disabled ? '0.6' : '1'};
    `;
    
    const style = baseStyle + typeStyles[type] + sizeStyles[size];
    
    const iconHtml = finalIcon ? `<span>${finalIcon}</span>` : '';
    
    return `
        <div class="button-component">
            <button 
                style="${style}" 
                ${disabled ? 'disabled' : ''}
                onclick="${disabled ? '' : finalAction}"
            >
                ${iconHtml}${finalText}
            </button>
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
    window.ButtonRenderer = { render };
}