const fs = require('fs-extra');
const path = require('path');

class ComponentService {
    constructor(dataDir) {
        this.dataDir = dataDir;
        // Fix the path to point to the correct components directory
        // dataDir is ai-server/data, so we need to go up two levels to reach the root
        this.rootDir = path.join(dataDir, '..', '..');
        this.componentsDir = path.join(this.rootDir, 'components');
    }

    /**
     * 获取所有可用组件的清单
     */
    async getComponents() {
        try {
            const components = {};
            
            // 确保 components 目录存在
            await fs.ensureDir(this.componentsDir);
            
            // 读取 components 目录下的所有子目录
            const componentDirs = await fs.readdir(this.componentsDir);
            
            for (const componentDir of componentDirs) {
                const componentPath = path.join(this.componentsDir, componentDir);
                const stat = await fs.stat(componentPath);
                
                if (stat.isDirectory()) {
                    try {
                        const component = await this.loadComponent(componentDir);
                        if (component) {
                            components[componentDir] = component;
                        }
                    } catch (error) {
                        console.warn(`Failed to load component ${componentDir}:`, error.message);
                    }
                }
            }
            
            return {
                success: true,
                data: components,
                count: Object.keys(components).length
            };
        } catch (error) {
            console.error('Error getting components:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 加载单个组件的定义
     */
    async loadComponent(componentName) {
        const componentPath = path.join(this.componentsDir, componentName);
        const packagePath = path.join(componentPath, 'package.json');
        const renderPath = path.join(componentPath, 'render.js');
        
        // 检查必需文件是否存在
        const packageExists = await fs.pathExists(packagePath);
        const renderExists = await fs.pathExists(renderPath);
        
        if (!packageExists) {
            console.warn(`Component ${componentName} missing package.json`);
            return null;
        }
        
        // 读取 package.json
        const packageContent = await fs.readJson(packagePath);
        
        // 创建组件对象
        const component = {
            name: componentName,
            ...packageContent,
            hasRenderer: renderExists,
            paths: {
                package: `/components/${componentName}/package.json`,
                render: renderExists ? `/components/${componentName}/render.js` : null
            }
        };
        
        // 如果没有渲染器，记录警告
        if (!renderExists) {
            console.warn(`Component ${componentName} missing render.js`);
        }
        
        return component;
    }

    /**
     * 获取单个组件的详细信息
     */
    async getComponent(componentName) {
        try {
            const component = await this.loadComponent(componentName);
            
            if (!component) {
                return {
                    success: false,
                    error: 'Component not found'
                };
            }
            
            return {
                success: true,
                data: component
            };
        } catch (error) {
            console.error(`Error getting component ${componentName}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 确保组件有完整的文件结构
     */
    async ensureComponentFiles(componentName) {
        const componentPath = path.join(this.componentsDir, componentName);
        const packagePath = path.join(componentPath, 'package.json');
        const renderPath = path.join(componentPath, 'render.js');
        
        // 确保组件目录存在
        await fs.ensureDir(componentPath);
        
        const result = {
            created: [],
            existing: [],
            errors: []
        };
        
        try {
            // 检查 package.json
            if (!await fs.pathExists(packagePath)) {
                const defaultPackage = this.getDefaultPackage(componentName);
                await fs.writeJson(packagePath, defaultPackage, { spaces: 2 });
                result.created.push('package.json');
            } else {
                result.existing.push('package.json');
            }
            
            // 检查 render.js
            if (!await fs.pathExists(renderPath)) {
                const defaultRender = this.getDefaultRenderer(componentName);
                await fs.writeFile(renderPath, defaultRender);
                result.created.push('render.js');
            } else {
                result.existing.push('render.js');
            }
            
        } catch (error) {
            result.errors.push(error.message);
        }
        
        return result;
    }

    /**
     * 获取默认的 package.json 模板
     */
    getDefaultPackage(componentName) {
        const displayName = this.toDisplayName(componentName);
        
        return {
            name: componentName,
            displayName: displayName,
            description: `${displayName}组件`,
            version: "1.0.0",
            category: "general",
            icon: "📦",
            properties: {
                content: {
                    type: "string",
                    label: "内容",
                    defaultValue: `{{${componentName}_content}}`,
                    description: "组件内容"
                }
            },
            variables: [`${componentName}_content`],
            defaultSpan: {
                rowSpan: 1,
                colSpan: 1
            }
        };
    }

    /**
     * 获取默认的 render.js 模板
     */
    getDefaultRenderer(componentName) {
        const className = this.toCamelCase(componentName) + 'Renderer';
        
        return `function render(data, properties) {
    const { content } = properties;
    
    // 处理变量替换
    const finalContent = replaceVariables(content, data);
    
    return \`
        <div class="${componentName}-component">
            <div>\${finalContent}</div>
        </div>
    \`;
}

function replaceVariables(text, data) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\\{\\{([^}]+)\\}\\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
}

// 导出渲染函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { render };
} else if (typeof window !== 'undefined') {
    window.${className} = { render };
}`;
    }

    /**
     * 批量确保所有组件都有完整文件
     */
    async ensureAllComponentFiles() {
        try {
            const results = {};
            
            // 确保 components 目录存在
            await fs.ensureDir(this.componentsDir);
            
            // 读取所有组件目录
            const componentDirs = await fs.readdir(this.componentsDir);
            
            for (const componentDir of componentDirs) {
                const componentPath = path.join(this.componentsDir, componentDir);
                const stat = await fs.stat(componentPath);
                
                if (stat.isDirectory()) {
                    results[componentDir] = await this.ensureComponentFiles(componentDir);
                }
            }
            
            return {
                success: true,
                data: results
            };
        } catch (error) {
            console.error('Error ensuring component files:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 工具方法：转换为显示名称
     */
    toDisplayName(componentName) {
        const nameMap = {
            'button': '按钮',
            'image': '图片',
            'paragraph': '段落',
            'table': '表格',
            'title-content': '标题内容',
            'line-chart': '折线图',
            'bar-chart': '柱状图',
            'pie-chart': '饼图',
            'gauge-chart': '仪表盘'
        };
        
        return nameMap[componentName] || componentName;
    }

    /**
     * 工具方法：转换为驼峰命名
     */
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
                  .replace(/^[a-z]/, letter => letter.toUpperCase());
    }
}

module.exports = ComponentService;