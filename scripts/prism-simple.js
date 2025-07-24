/*
 * Simple PrismJS replacement for basic syntax highlighting
 * Minimal implementation for offline use
 */
window.Prism = {
    languages: {
        javascript: true,
        js: true,
        json: true,
        java: true,
        python: true,
        bash: true,
        shell: true
    },
    
    highlight: function(code, grammar, language) {
        // Don't double-escape - marked.js already handles this
        let processedCode = code;
        
        // Basic syntax highlighting - simple token replacement
        if (language === 'json') {
            return processedCode
                .replace(/(".*?")/g, '<span class="token string">$1</span>')
                .replace(/\b(true|false|null)\b/g, '<span class="token boolean">$1</span>')
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>')
                .replace(/([{}[\]:,])/g, '<span class="token punctuation">$1</span>');
        }
        
        if (language === 'javascript' || language === 'js') {
            return processedCode
                .replace(/(\/\/.*$)/gm, '<span class="token comment">$1</span>')
                .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>')
                .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="token string">$1</span>')
                .replace(/\b(true|false|null|undefined)\b/g, '<span class="token boolean">$1</span>')
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>')
                .replace(/\b(function|var|let|const|if|else|for|while|return|class|extends|import|export|from|async|await|new|this)\b/g, '<span class="token keyword">$1</span>');
        }
        
        if (language === 'java') {
            return processedCode
                .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="token comment">$1</span>')
                .replace(/(".*?")/g, '<span class="token string">$1</span>')
                .replace(/\b(public|private|protected|static|final|class|interface|extends|implements|import|package|void|int|String|boolean|if|else|for|while|return|new|try|catch|finally)\b/g, '<span class="token keyword">$1</span>');
        }
        
        return processedCode;
    },
    
    highlightAll: function() {
        document.querySelectorAll('pre code').forEach((block) => {
            const classList = Array.from(block.classList);
            const languageClass = classList.find(cls => cls.startsWith('language-'));
            
            if (languageClass && !block.classList.contains('highlighted')) {
                const lang = languageClass.substring(9); // Remove 'language-' prefix
                if (this.languages[lang]) {
                    const originalText = block.textContent || block.innerText;
                    block.innerHTML = this.highlight(originalText, null, lang);
                    block.classList.add('highlighted');
                }
            }
        });
    }
};