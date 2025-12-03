const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class CompilerService {
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.outputDir = path.join(dataDir, 'compiled');
        this.appsFile = path.join(dataDir, 'applications.json');
        this.agentsFile = path.join(dataDir, 'agents.json');
        this.agentVersionsFile = path.join(dataDir, 'agent-versions.json');
        this.mcpsFile = path.join(dataDir, 'mcps.json');
        this.appMcpFile = path.join(dataDir, 'appMcp.json');
        this.luisFile = path.join(dataDir, 'luis.json');
        
        this.initialize();
    }

    async initialize() {
        // 确保输出目录存在
        await fs.ensureDir(this.outputDir);
    }

    /**
     * 编译应用程序的配置为arcp-helper.js文件
     * @param {string} appId - 应用ID
     * @param {string} tenantId - 租户ID
     * @returns {Promise<Object>} 编译结果
     */
    async compileApp(appId, tenantId = 'lAseKW') {
        try {
            console.log(`开始编译应用: ${appId}, 租户: ${tenantId}`);
            
            // 获取应用程序信息
            const appInfo = await this.getAppInfo(appId, tenantId);
            if (!appInfo) {
                throw new Error(`应用 ${appId} 不存在`);
            }
            
            // 获取智能体配置
            const agentConfig = await this.getAgentConfig(appId);
            
            // 获取MCP服务配置
            const mcpConfig = await this.getMcpConfig(appId);
            
            // 获取LUI卡片配置
            const luiConfig = await this.getLUIConfig(appId);
            
            // 生成AI_CONFIG
            const aiConfig = this.generateAIConfig(appInfo, agentConfig);
            
            // 生成INTENT_MAP
            const intentMap = this.generateIntentMap(mcpConfig);
            
            // 生成getSystemPrompt
            const systemPrompt = this.generateSystemPrompt(agentConfig);
            
            // 生成ProjectAIAssistant类
            const projectAIAssistant = this.generateProjectAIAssistant(aiConfig, intentMap, systemPrompt);
            
            // 生成AIAssistantUI类
            const aiAssistantUI = this.generateAIAssistantUI(luiConfig, appInfo);
            
            // 组合完整的arcp-helper.js内容
            const helperContent = this.generateHelperContent(aiConfig, intentMap, systemPrompt, projectAIAssistant, aiAssistantUI, appInfo);
            
            // 保存编译后的文件
            const outputPath = path.join(this.outputDir, `${appId}-helper.js`);
            await fs.writeFile(outputPath, helperContent, 'utf8');
            
            return {
                success: true,
                message: '编译成功',
                appId,
                outputPath,
                downloadUrl: `/compiled/${appId}-helper.js`,
                compiledAt: moment().format('YYYY-MM-DD HH:mm:ss')
            };
        } catch (error) {
            console.error('编译失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取应用程序信息
     */
    async getAppInfo(appId, tenantId) {
        try {
            const appsData = await fs.readJson(this.appsFile);
            const tenantApps = appsData[tenantId] || [];
            return tenantApps.find(app => app.appId === appId);
        } catch (error) {
            console.error('获取应用信息失败:', error);
            return null;
        }
    }

    /**
     * 获取智能体配置
     */
    async getAgentConfig(appId) {
        try {
            const agentsData = await fs.readJson(this.agentsFile);
            const agentVersionsData = await fs.readJson(this.agentVersionsFile);
            
            // 查找关联到该应用的智能体
            let agentConfig = null;
            
            for (const [agentId, agent] of Object.entries(agentsData)) {
                if (agent.appId === appId) {
                    // 获取当前版本
                    const currentVersionId = agent.currentVersionId;
                    if (currentVersionId && agentVersionsData[agentId]) {
                        const version = agentVersionsData[agentId].find(v => v.id === currentVersionId);
                        if (version) {
                            agentConfig = {
                                agentId,
                                name: agent.name,
                                description: agent.description,
                                promptContent: version.promptTemplate,
                                variables: version.variables || [],
                                settings: version.settings || {}
                            };
                            break;
                        }
                    }
                }
            }
            
            return agentConfig;
        } catch (error) {
            console.error('获取智能体配置失败:', error);
            return null;
        }
    }

    /**
     * 获取MCP服务配置
     */
    async getMcpConfig(appId) {
        try {
            const appMcpData = await fs.readJson(this.appMcpFile);
            const mcps = appMcpData.data[appId] || [];
            
            // 构建INTENT_MAP所需的数据结构
            const intentMap = {};
            
            mcps.forEach(mcp => {
                if (mcp.endpoints && Array.isArray(mcp.endpoints)) {
                    mcp.endpoints.forEach(endpoint => {
                        const intentName = this.convertToCamelCase(endpoint.name || endpoint.path.split('/').pop());
                        intentMap[intentName] = {
                            name: endpoint.name,
                            description: endpoint.description || mcp.description,
                            apiPath: endpoint.path,
                            method: endpoint.method || 'GET',
                            requiredParams: endpoint.requiredParams || [],
                            optionalParams: endpoint.optionalParams || [],
                            successTemplate: endpoint.successTemplate || '操作成功',
                            errorTemplate: endpoint.errorTemplate || '操作失败'
                        };
                    });
                }
            });
            
            return intentMap;
        } catch (error) {
            console.error('获取MCP配置失败:', error);
            return {};
        }
    }

    /**
     * 获取LUI卡片配置
     */
    async getLUIConfig(appId) {
        try {
            const luisData = await fs.readJson(this.luisFile);
            return luisData.luis || [];
        } catch (error) {
            console.error('获取LUI配置失败:', error);
            return [];
        }
    }

    /**
     * 生成AI_CONFIG
     */
    generateAIConfig(appInfo, agentConfig) {
        const config = {
            // 基础配置
            BASE_URL: "https://api.example.com",
            API_VERSION: "v1",
            APP_ID: appInfo.appId,
            
            // LLM配置
            LLM_ENDPOINT: "https://api.example.com/llm/completions",
            LLM_MODEL: "gpt-4",
            LLM_API_KEY: "{{LLM_API_KEY}}",
            
            // 知识库配置
            KNOWLEDGE_BASE_ID: appInfo.metadata?.knowledgeBaseId || "",
            VECTOR_CONFIG_ID: appInfo.metadata?.vectorConfigId || "",
            
            // 助手配置
            ASSISTANT_NAME: appInfo.name,
            ASSISTANT_LOGO: appInfo.metadata?.assistantConfig?.logo || "",
            ASSISTANT_THEME: appInfo.metadata?.assistantConfig?.theme || "default",
            WELCOME_MESSAGE: appInfo.metadata?.assistantConfig?.welcomeMessage || `欢迎使用${appInfo.name}`,
            
            // 性能配置
            TIMEOUT: 30000,
            RETRY_COUNT: 3,
            STREAM_ENABLED: true,
            
            // 其他配置
            DEBUG: false,
            ENV: "production"
        };
        
        return config;
    }

    /**
     * 生成INTENT_MAP
     */
    generateIntentMap(mcpConfig) {
        return mcpConfig;
    }

    /**
     * 生成getSystemPrompt函数
     */
    generateSystemPrompt(agentConfig) {
        if (!agentConfig) {
            // 默认的系统提示词
            return `function getSystemPrompt() {
    return \`"""
# 系统角色
你是一个智能助手，帮助用户完成各种任务。

# 意图识别规则
请根据用户输入识别正确的意图，并按照指定格式输出。

# 返回格式
{
    "intent": "意图名称",
    "params": {
        "参数名": "参数值"
    }
}
""\`;
}`;
        }
        
        // 使用智能体配置生成系统提示词
        return `function getSystemPrompt() {
    return \`"""
${agentConfig.promptContent}
""\`;
}`;
    }

    /**
     * 生成ProjectAIAssistant类
     */
    generateProjectAIAssistant(aiConfig, intentMap, systemPrompt) {
        return `class ProjectAIAssistant {
    constructor(config = {}) {
        this.config = { ...${JSON.stringify(aiConfig)}, ...config };
        this.projectId = this.getCurrentProjectId();
        this.userId = this.getCurrentUserId();
        this.sessionId = this.generateSessionId();
        this.chatHistory = [];
        
        if (this.config.DEBUG) {
            console.log('ProjectAIAssistant initialized with config:', this.config);
        }
    }

    getCurrentProjectId() {
        // 从URL参数或本地存储获取项目ID
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('projectId') || localStorage.getItem('currentProjectId') || '';
    }

    getCurrentUserId() {
        // 获取当前用户ID
        return localStorage.getItem('userId') || 'anonymous';
    }

    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    getSystemPrompt() {
        ${systemPrompt.replace('function getSystemPrompt() {', '').replace('}', '')}
    }

    async recognizeIntent(userQuery) {
        try {
            const systemPrompt = this.getSystemPrompt();
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userQuery }
            ];

            const requestBody = {
                model: this.config.LLM_MODEL,
                messages: messages,
                temperature: 0.3,
                max_tokens: 1024,
                response_format: { type: 'json_object' }
            };

            const response = await fetch(this.config.LLM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${this.config.LLM_API_KEY}\`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(\`API错误: \${response.status}\`);
            }

            const data = await response.json();
            const intentResult = JSON.parse(data.choices[0].message.content);
            
            return intentResult;
        } catch (error) {
            console.error('意图识别失败:', error);
            throw error;
        }
    }

    async executeAPI(intent, params = {}) {
        try {
            const intentConfig = ${JSON.stringify(intentMap)}[intent];
            
            if (!intentConfig) {
                throw new Error(\`未知意图: \${intent}\`);
            }

            // 验证必填参数
            const missingParams = intentConfig.requiredParams.filter(
                param => !params.hasOwnProperty(param)
            );

            if (missingParams.length > 0) {
                throw new Error(\`缺少必填参数: \${missingParams.join(', ')}\`);
            }

            // 构建请求URL
            const url = \`\${this.config.BASE_URL}/\${this.config.API_VERSION}\${intentConfig.apiPath}\`;

            // 准备请求选项
            const requestOptions = {
                method: intentConfig.method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-App-Id': this.config.APP_ID,
                    'X-Project-Id': this.projectId,
                    'X-User-Id': this.userId,
                    'X-Session-Id': this.sessionId
                }
            };

            // 根据请求方法设置请求体
            if (['POST', 'PUT', 'PATCH'].includes(intentConfig.method.toUpperCase())) {
                requestOptions.body = JSON.stringify(params);
            } else if (intentConfig.method.toUpperCase() === 'GET') {
                // 对于GET请求，将参数添加到URL
                const queryParams = new URLSearchParams(params).toString();
                requestUrl = queryParams ? \`\${url}?\${queryParams}\` : url;
            }

            // 发送请求
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(\`API请求失败: \${response.status}\`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API执行失败:', error);
            throw error;
        }
    }

    async processUserQuery(userQuery) {
        try {
            // 识别用户意图
            const intentResult = await this.recognizeIntent(userQuery);
            const { intent, params } = intentResult;

            // 执行相应的API
            const result = await this.executeAPI(intent, params);

            // 记录对话历史
            this.chatHistory.push({
                role: 'user',
                content: userQuery,
                timestamp: new Date().toISOString()
            });

            this.chatHistory.push({
                role: 'assistant',
                content: result,
                intent: intent,
                params: params,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                intent: intent,
                result: result
            };
        } catch (error) {
            console.error('处理用户查询失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 智能参数解析
    smartParseParams(userQuery, requiredParams = []) {
        // 实现智能参数解析逻辑
        const params = {};
        
        // 简单的参数提取示例
        requiredParams.forEach(param => {
            // 这里可以实现更复杂的自然语言参数提取
            // 例如使用正则表达式、命名实体识别等
            if (userQuery.includes(param)) {
                // 提取参数值的简单逻辑
                const match = userQuery.match(new RegExp(\`${param}[：:]\s*([^，,。.\s]+)\`));
                if (match && match[1]) {
                    params[param] = match[1];
                }
            }
        });
        
        return params;
    }

    // 获取对话历史
    getChatHistory() {
        return this.chatHistory;
    }

    // 清除对话历史
    clearChatHistory() {
        this.chatHistory = [];
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}
`;
    }

    /**
     * 生成AIAssistantUI类
     */
    generateAIAssistantUI(luiConfig, appInfo) {
        return `class AIAssistantUI {
    constructor(assistant, containerId = 'ai-assistant-container') {
        this.assistant = assistant;
        this.containerId = containerId;
        this.container = null;
        this.chatContainer = null;
        this.inputContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.isOpen = false;
        
        // 预定义的LUI卡片
        this.luiCards = ${JSON.stringify(luiConfig)};
        
        this.init();
    }

    init() {
        this.createContainer();
        this.createChatInterface();
        this.bindEvents();
        this.renderWelcomeMessage();
    }

    createContainer() {
        // 创建主容器
        this.container = document.createElement('div');
        this.container.id = this.containerId;
        this.container.className = 'ai-assistant-container';
        document.body.appendChild(this.container);
    }

    createChatInterface() {
        // 聊天界面HTML结构
        const html = \`
            <div class="ai-assistant-header">
                <div class="ai-assistant-title">${appInfo.name}</div>
                <div class="ai-assistant-close">×</div>
            </div>
            <div class="ai-assistant-chat-container">
                <div class="ai-assistant-messages"></div>
            </div>
            <div class="ai-assistant-input-container">
                <input type="text" class="ai-assistant-message-input" placeholder="输入您的问题..." />
                <button class="ai-assistant-send-button">发送</button>
            </div>
        \`;
        
        this.container.innerHTML = html;
        
        // 获取DOM元素
        this.chatContainer = this.container.querySelector('.ai-assistant-messages');
        this.inputContainer = this.container.querySelector('.ai-assistant-input-container');
        this.messageInput = this.container.querySelector('.ai-assistant-message-input');
        this.sendButton = this.container.querySelector('.ai-assistant-send-button');
    }

    bindEvents() {
        // 绑定发送按钮点击事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // 绑定输入框回车事件
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // 绑定关闭按钮事件
        this.container.querySelector('.ai-assistant-close').addEventListener('click', () => {
            this.close();
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) return;
        
        // 清空输入框
        this.messageInput.value = '';
        
        // 显示用户消息
        this.addMessage('user', message);
        
        // 显示加载状态
        const loadingElement = this.addLoadingMessage();
        
        try {
            // 处理用户查询
            const result = await this.assistant.processUserQuery(message);
            
            // 移除加载状态
            loadingElement.remove();
            
            if (result.success) {
                // 根据结果类型显示不同的响应
                if (result.intent && this.shouldShowLUI(result.intent)) {
                    this.renderLUI(result.intent, result.result);
                } else {
                    this.addMessage('assistant', this.formatResponse(result.result));
                }
            } else {
                this.addMessage('assistant', \`错误: \${result.error}\`);
            }
        } catch (error) {
            // 移除加载状态
            loadingElement.remove();
            this.addMessage('assistant', \`发生错误: \${error.message}\`);
        }
    }

    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = \`ai-assistant-message ai-assistant-message-\${role}\`;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'ai-assistant-message-content';
        
        if (typeof content === 'string') {
            contentElement.textContent = content;
        } else {
            // 对于非字符串内容（如对象），显示格式化的JSON
            contentElement.textContent = JSON.stringify(content, null, 2);
            contentElement.className += ' ai-assistant-message-json';
        }
        
        messageElement.appendChild(contentElement);
        this.chatContainer.appendChild(messageElement);
        
        // 滚动到底部
        this.scrollToBottom();
        
        return messageElement;
    }

    addLoadingMessage() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'ai-assistant-message ai-assistant-message-assistant ai-assistant-loading';
        loadingElement.innerHTML = '<div class="ai-assistant-loading-indicator">正在思考...</div>';
        
        this.chatContainer.appendChild(loadingElement);
        this.scrollToBottom();
        
        return loadingElement;
    }

    renderWelcomeMessage() {
        const welcomeMessage = this.assistant.config.WELCOME_MESSAGE || '欢迎使用智能助手！';
        this.addMessage('assistant', welcomeMessage);
    }

    renderLUI(intent, data) {
        // 查找对应的LUI卡片
        const card = this.luiCards.find(c => c.id === intent || c.name.toLowerCase().includes(intent.toLowerCase()));
        
        if (card) {
            const luiElement = document.createElement('div');
            luiElement.className = 'ai-assistant-lui-card';
            luiElement.setAttribute('data-card-id', card.id);
            
            // 根据卡片类型渲染不同的内容
            luiElement.innerHTML = this.renderCardContent(card, data);
            
            this.chatContainer.appendChild(luiElement);
            this.scrollToBottom();
        } else {
            // 如果没有找到对应的LUI卡片，显示普通文本响应
            this.addMessage('assistant', this.formatResponse(data));
        }
    }

    renderCardContent(card, data) {
        // 这里实现不同类型LUI卡片的渲染逻辑
        // 简化版实现，实际项目中需要根据卡片类型进行更复杂的渲染
        let html = \`<div class="lui-card-header"><h3>\${card.name}</h3></div>\`;
        html += \`<div class="lui-card-content">\`;
        
        // 简单的数据展示
        if (typeof data === 'object') {
            html += \`<pre>\${JSON.stringify(data, null, 2)}</pre>\`;
        } else {
            html += \`<p>\${data}</p>\`;
        }
        
        html += \`</div>\`;
        return html;
    }

    shouldShowLUI(intent) {
        // 判断是否应该显示LUI卡片
        return this.luiCards.some(card => 
            card.id === intent || 
            (card.tags && card.tags.includes(intent))
        );
    }

    formatResponse(response) {
        // 格式化响应内容
        if (typeof response === 'string') {
            return response;
        } else if (response.message) {
            return response.message;
        } else if (response.data) {
            return JSON.stringify(response.data, null, 2);
        } else {
            return JSON.stringify(response, null, 2);
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    open() {
        this.isOpen = true;
        this.container.classList.add('ai-assistant-open');
    }

    close() {
        this.isOpen = false;
        this.container.classList.remove('ai-assistant-open');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // 更新UI主题
    updateTheme(theme) {
        this.container.setAttribute('data-theme', theme);
    }

    // 加载预设问题
    loadPresetQuestions(questions) {
        if (!questions || questions.length === 0) return;
        
        const presetContainer = document.createElement('div');
        presetContainer.className = 'ai-assistant-preset-questions';
        
        questions.forEach(question => {
            const button = document.createElement('button');
            button.className = 'ai-assistant-preset-button';
            button.textContent = question;
            button.addEventListener('click', () => {
                this.messageInput.value = question;
                this.sendMessage();
            });
            presetContainer.appendChild(button);
        });
        
        this.chatContainer.appendChild(presetContainer);
    }
}
`;
    }

    /**
     * 生成完整的arcp-helper.js内容
     */
    generateHelperContent(aiConfig, intentMap, systemPrompt, projectAIAssistant, aiAssistantUI, appInfo) {
        return `/**
 * ${appInfo.name} - AI助手模块
 * 自动生成时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}
 * App ID: ${appInfo.appId}
 */

// 配置常量
const AI_CONFIG = ${JSON.stringify(aiConfig, null, 2)};

// 意图映射表
const INTENT_MAP = ${JSON.stringify(intentMap, null, 2)};

// 系统提示词生成函数
${systemPrompt}

// 项目AI助手类
${projectAIAssistant}

// AI助手UI类
${aiAssistantUI}

// 初始化函数
function initializeAIAssistant(config = {}) {
    // 合并配置
    const mergedConfig = { ...AI_CONFIG, ...config };
    
    // 创建AI助手实例
    const assistant = new ProjectAIAssistant(mergedConfig);
    
    // 创建UI实例
    const ui = new AIAssistantUI(assistant);
    
    // 加载预设问题
    if (mergedConfig.presetQuestions && mergedConfig.presetQuestions.length > 0) {
        ui.loadPresetQuestions(mergedConfig.presetQuestions);
    }
    
    // 更新主题
    if (mergedConfig.ASSISTANT_THEME) {
        ui.updateTheme(mergedConfig.ASSISTANT_THEME);
    }
    
    // 暴露公共API
    window.AIAssistant = {
        assistant,
        ui,
        open: () => ui.open(),
        close: () => ui.close(),
        toggle: () => ui.toggle(),
        sendMessage: (message) => {
            ui.messageInput.value = message;
            ui.sendMessage();
        },
        updateConfig: (newConfig) => assistant.updateConfig(newConfig)
    };
    
    // 自动打开助手
    if (mergedConfig.autoOpen !== false) {
        ui.open();
    }
    
    console.log('${appInfo.name} 初始化完成');
    return window.AIAssistant;
}

// 默认导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProjectAIAssistant,
        AIAssistantUI,
        initializeAIAssistant,
        AI_CONFIG,
        INTENT_MAP
    };
}

// 自动初始化
if (typeof document !== 'undefined' && window.autoInitializeAIAssistant !== false) {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAIAssistant();
    });
}
`;
    }

    /**
     * 辅助函数：转换为驼峰命名
     */
    convertToCamelCase(str) {
        return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
    }

    /**
     * 获取所有已编译的应用
     */
    async getCompiledApps() {
        try {
            const files = await fs.readdir(this.outputDir);
            const helperFiles = files.filter(file => file.endsWith('-helper.js'));
            
            const apps = [];
            for (const file of helperFiles) {
                const stats = await fs.stat(path.join(this.outputDir, file));
                const appId = file.replace('-helper.js', '');
                
                apps.push({
                    appId,
                    fileName: file,
                    downloadUrl: `/compiled/${file}`,
                    lastModified: stats.mtime,
                    size: stats.size
                });
            }
            
            return apps;
        } catch (error) {
            console.error('获取已编译应用失败:', error);
            return [];
        }
    }

    /**
     * 删除编译文件
     */
    async deleteCompiledApp(appId) {
        try {
            const filePath = path.join(this.outputDir, `${appId}-helper.js`);
            
            if (await fs.pathExists(filePath)) {
                await fs.unlink(filePath);
                return { success: true, message: '编译文件已删除' };
            }
            
            return { success: false, error: '编译文件不存在' };
        } catch (error) {
            console.error('删除编译文件失败:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = CompilerService;