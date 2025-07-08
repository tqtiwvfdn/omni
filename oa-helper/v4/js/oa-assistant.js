// OA智能助手主类（重构版）
class OAAssistant {
    constructor() {
        this.token = '';
        this.currentUser = '';
        this.isStreaming = false;
        this.conversationHistory = [];
        
        // 引用配置和工具
        this.config = window.OAConfig;
        this.intents = window.IntentConfig;
        this.handlers = window.IntentHandlers;
        this.utils = window.OAUtils;
        
        this.initEventListeners();
        this.autoLogin();
    }

    initEventListeners() {
        document.getElementById('send-btn').addEventListener('click', this.sendMessage.bind(this));
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isStreaming) this.sendMessage();
        });
        document.getElementById('clear-chat').addEventListener('click', this.clearChat.bind(this));
    }

    // 快速操作处理
    handleQuickAction(query) {
        const target = event.target.closest('.quick-card');
        if (target) {
            target.classList.add('clicked');
            setTimeout(() => {
                target.classList.remove('clicked');
            }, this.config.ui.animationDuration);
        }

        const input = document.getElementById('chat-input');
        input.value = query;
        
        setTimeout(() => {
            this.sendMessage();
        }, 100);
    }

    // 自动登录
    async autoLogin() {
        this.showLoading(true);

        try {
            const response = await fetch('./login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.config.auth)
            });

            const data = await response.json();
            if (data.obj && data.obj.access_token) {
                this.token = data.obj.access_token;
            }

            this.currentUser = window.localStorage.getItem('userName');
            localStorage.setItem('oaToken', this.token);

            document.getElementById('user-name').textContent = this.currentUser;
            this.updateConnectionStatus(true);

            console.log('自动登录成功');
        } catch (error) {
            console.error('Auto login error:', error);
            this.updateConnectionStatus(false);
            this.addMessage('系统', '自动登录失败，部分功能可能不可用。', 'ai');
        } finally {
            this.showLoading(false);
        }
    }

    // 发送消息主流程（简化）
    async sendMessage() {
        if (this.isStreaming) return;

        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        input.value = '';
        this.addMessage('我', message, 'user');

        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        this.isStreaming = true;

        try {
            // 1. 意图分析（简化，更依赖LLM）
            const intent = await this.analyzeIntent(message);
            console.log('意图分析结果:', intent);

            // 2. 调用对应处理器
            let handlerResult = null;
            if (intent.needsApiCall) {
                const intentConfig = this.intents.getIntent(intent.intent);
                if (intentConfig && intentConfig.handler) {
                    handlerResult = await this.handlers.callHandler(intentConfig.handler, intent, this);
                }
            } else {
                handlerResult = await this.handlers.handleGeneralChat(intent, this);
            }

            // 3. 生成流式响应
            await this.generateStreamResponse(message, intent, handlerResult);

        } catch (error) {
            console.error('Message processing error:', error);
            this.addMessage('系统', '抱歉，处理您的请求时出现了错误，请稍后重试。', 'ai');
        } finally {
            this.isStreaming = false;
        }
    }

    // 简化的意图分析（更依赖LLM）
    async analyzeIntent(message) {
        try {
            const userName = localStorage.getItem('userName') || '';
            const currentDate = new Date();
            const dateString = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
            const availableIntents = this.intents.getIntentList().join(', ');

            const prompt = this.config.prompts.intentAnalysis
                .replace('{currentDate}', dateString)
                .replace('{userName}', userName)
                .replace('{availableIntents}', availableIntents);

            const messages = [
                { role: 'system', content: prompt },
                { role: 'user', content: message }
            ];

            const response = await fetch(`${this.config.api.ollama}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.api.model,
                    messages: messages,
                    stream: false,
                    temperature: this.config.llm.temperature,
                    max_tokens: this.config.llm.maxTokens,
                    top_p: this.config.llm.topP,
                    "chat_template_kwargs": { "enable_thinking": this.config.llm.enableThinking }
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            try {
                const cleanedContent = this.utils.cleanThinkingContent(content);
                const intent = JSON.parse(cleanedContent);
                
                // 兼容处理
                if (intent.queryField && !intent.queryFields) {
                    intent.queryFields = [intent.queryField];
                }
                if (!intent.queryFields) {
                    intent.queryFields = ["全部"];
                }
                
                intent.originalMessage = message;
                return intent;
            } catch (e) {
                console.error('JSON解析失败，使用fallback:', content);
                return this.fallbackIntentAnalysis(message);
            }
        } catch (error) {
            console.error('Intent analysis error:', error);
            return this.fallbackIntentAnalysis(message);
        }
    }

    // Fallback意图分析（基于规则）
    fallbackIntentAnalysis(message) {
        const userName = localStorage.getItem('userName') || '';
        const processedMessage = message.toLowerCase();
        
        // 优先检查报工相关查询
        if (processedMessage.includes('报工') || 
            processedMessage.includes('项目') || 
            processedMessage.includes('工时') ||
            processedMessage.includes('工作情况') ||
            (processedMessage.includes('最近') && (processedMessage.includes('月') || processedMessage.includes('季度'))) ||
            (processedMessage.includes('本月') && processedMessage.includes('情况')) ||
            (processedMessage.includes('上月') && processedMessage.includes('情况'))) {
            
            // 提取时间表达式
            let timeExpression = '本月';
            if (processedMessage.match(/最近\d+个?月/)) {
                timeExpression = processedMessage.match(/最近\d+个?月/)[0];
            } else if (processedMessage.includes('本月')) {
                timeExpression = '本月';
            } else if (processedMessage.includes('上月')) {
                timeExpression = '上月';
            } else if (processedMessage.includes('今年')) {
                timeExpression = '今年';
            } else if (processedMessage.includes('去年')) {
                timeExpression = '去年';
            }
            
            return {
                intent: 'project_query',
                needsApiCall: true,
                userName: userName,
                queryFields: ['报工情况'],
                timeExpression: timeExpression,
                message: '',
                sendToUser: '',
                explanation: `Fallback分析：报工查询 - ${timeExpression}`,
                confidence: 0.8,
                originalMessage: message
            };
        }
        
        // 检查发送相关
        if (processedMessage.includes('发送') || processedMessage.includes('发给') || processedMessage.includes('发到') || processedMessage.includes('分享')) {
            if (processedMessage.includes('企业微信')) {
                // 提取查询字段
                const queryFields = [];
                if (processedMessage.includes('职级') || processedMessage.includes('级别')) queryFields.push('职级');
                if (processedMessage.includes('电话') || processedMessage.includes('手机')) queryFields.push('电话');
                if (processedMessage.includes('邮箱') || processedMessage.includes('email')) queryFields.push('邮箱');
                if (processedMessage.includes('部门') || processedMessage.includes('组织')) queryFields.push('部门');
                if (processedMessage.includes('成本')) queryFields.push('成本');
                if (processedMessage.includes('报工') || processedMessage.includes('项目') || processedMessage.includes('工时') || processedMessage.includes('工作情况')) {
                    queryFields.push('报工情况');
                }
                if (queryFields.length === 0) queryFields.push('全部');
                
                // 提取时间表达式（主要用于报工查询）
                let timeExpression = '';
                if (processedMessage.match(/去年\d+月?到\d+月?/)) {
                    timeExpression = processedMessage.match(/去年\d+月?到\d+月?/)[0];
                } else if (processedMessage.match(/今年\d+月?到\d+月?/)) {
                    timeExpression = processedMessage.match(/今年\d+月?到\d+月?/)[0];
                } else if (processedMessage.match(/\d+月?到\d+月?/)) {
                    timeExpression = processedMessage.match(/\d+月?到\d+月?/)[0];
                } else if (processedMessage.match(/最近\d+个?月/)) {
                    timeExpression = processedMessage.match(/最近\d+个?月/)[0];
                } else if (processedMessage.includes('本月')) {
                    timeExpression = '本月';
                } else if (processedMessage.includes('上月')) {
                    timeExpression = '上月';
                } else if (queryFields.includes('报工情况')) {
                    timeExpression = '本月'; // 默认时间
                }
                
                // 提取用户名
                const namePattern = /([a-zA-Z0-9]+|[\u4e00-\u9fa5]{2,4})/g;
                const names = message.match(namePattern) || [];
                const extractedName = names.find(name =>
                    name !== '把' && name !== '的' && name !== '职级' && name !== '电话' &&
                    name !== '和' && name !== '报工' && name !== '情况' && name !== '发送' &&
                    name !== '到' && name !== '企业' && name !== '微信' && name !== '去年' &&
                    name !== '今年' && name !== '月' && !name.match(/^\d+$/) && name.length >= 2
                ) || userName;
                
                return {
                    intent: 'query_and_send',
                    needsApiCall: true,
                    userName: extractedName,
                    queryFields: queryFields,
                    timeExpression: timeExpression,
                    message: '',
                    sendToUser: '企业微信',
                    explanation: `Fallback分析：查询并发送 - ${queryFields.join('、')}`,
                    confidence: 0.8,
                    originalMessage: message
                };
            } else {
                return {
                    intent: 'send_wechat',
                    needsApiCall: true,
                    userName: userName,
                    queryFields: [],
                    timeExpression: '',
                    message: message,
                    sendToUser: userName,
                    explanation: 'Fallback分析：发送消息',
                    confidence: 0.7,
                    originalMessage: message
                };
            }
        }
        
        // 检查用户信息查询
        if (processedMessage.includes('电话') || 
            processedMessage.includes('手机') || 
            processedMessage.includes('邮箱') || 
            processedMessage.includes('职级') || 
            processedMessage.includes('部门')) {
            
            const queryFields = [];
            if (processedMessage.includes('电话') || processedMessage.includes('手机')) queryFields.push('电话');
            if (processedMessage.includes('职级')) queryFields.push('职级');
            if (processedMessage.includes('邮箱')) queryFields.push('邮箱');
            if (processedMessage.includes('部门')) queryFields.push('部门');
            if (queryFields.length === 0) queryFields.push('全部');
            
            return {
                intent: 'user_info_query',
                needsApiCall: true,
                userName: userName,
                queryFields: queryFields,
                timeExpression: '',
                message: '',
                sendToUser: '',
                explanation: `Fallback分析：用户信息查询 - ${queryFields.join('、')}`,
                confidence: 0.7,
                originalMessage: message
            };
        }
        
        // 默认为一般对话
        return {
            intent: 'general_chat',
            needsApiCall: false,
            userName: userName,
            queryFields: ["全部"],
            timeExpression: '',
            message: message,
            sendToUser: '',
            explanation: 'Fallback分析：一般对话',
            confidence: 0.6,
            originalMessage: message
        };
    }

    // 生成流式响应（简化）
    async generateStreamResponse(originalMessage, intent, handlerResult) {
        try {
            let contextPrompt = this.buildContextPrompt(originalMessage, intent, handlerResult);
            let hasReportData = false;
            let reportDataInfo = null;

            // 检查是否有报工数据需要展示
            if (handlerResult && handlerResult.data) {
                if (handlerResult.data.projectData || handlerResult.data.queryResults?.reportWork) {
                    hasReportData = true;
                    reportDataInfo = this.extractReportDataInfo(handlerResult.data, intent);
                }
            }

            const messages = [
                { role: 'system', content: this.config.prompts.responseGeneration },
                ...this.conversationHistory.slice(-6),
                { role: 'user', content: contextPrompt }
            ];

            const response = await fetch(`${this.config.api.ollama}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.api.model,
                    messages: messages,
                    stream: true,
                    temperature: this.config.llm.streamTemperature,
                    max_tokens: this.config.llm.streamMaxTokens,
                    top_p: this.config.llm.topP,
                    "chat_template_kwargs": { "enable_thinking": this.config.llm.enableThinking }
                })
            });

            if (!response.ok) {
                throw new Error(`流式请求失败: ${response.status}`);
            }

            await this.handleStreamResponse(response, hasReportData, reportDataInfo);

        } catch (error) {
            console.error('Stream response error:', error);
            this.addMessage('系统', '抱歉，生成回复时出现错误。', 'ai');
        }
    }

    // 构建上下文提示（简化）
    buildContextPrompt(originalMessage, intent, handlerResult) {
        if (!handlerResult || !handlerResult.success) {
            return `用户消息: ${originalMessage}\n这是一个一般性对话，请作为OA智能助手友好地回复用户。保持简洁专业。`;
        }

        const { data } = handlerResult;
        let contextPrompt = `用户询问: ${originalMessage}\n\n`;

        // 根据不同的意图类型构建上下文
        switch (intent.intent) {
            case 'user_info_query':
                if (data.userInfo) {
                    const user = data.userInfo;
                    contextPrompt += `查询到的用户信息:\n`;
                    contextPrompt += `- 姓名: ${user.realName}\n`;
                    contextPrompt += `- 工号: ${user.accountId}\n`;
                    contextPrompt += `- 部门: ${user.orgName || '未设置'}\n`;
                    contextPrompt += `- 电话: ${user.mobile || '未设置'}\n`;
                    contextPrompt += `- 邮箱: ${user.email || '未设置'}\n`;
                    contextPrompt += `- 职级: ${user.rank || '未设置'}\n`;
                    contextPrompt += `- 成本: ${user.standardCost || '未设置'}\n`;
                }
                break;
                
            case 'project_query':
                if (data.projectData && data.userInfo) {
                    const projects = data.projectData.data?.userBgtList || [];
                    const totalDays = projects.reduce((sum, p) => sum + parseFloat(p.DL_WORKDAYS || 0), 0);
                    contextPrompt += `查询到的报工信息:\n`;
                    contextPrompt += `- 用户: ${data.userInfo.realName} (${data.userInfo.accountId})\n`;
                    contextPrompt += `- 查询时间: ${intent.timeExpression || '默认时间段'}\n`;
                    contextPrompt += `- 项目总数: ${projects.length}个\n`;
                    contextPrompt += `- 总工作天数: ${totalDays.toFixed(1)}天\n`;
                    if (projects.length > 0) {
                        contextPrompt += `- 主要项目: ${projects.slice(0, 3).map(p => p.S_BGTNAME).join('、')}\n`;
                    }
                    contextPrompt += `\n注意：具体的报工数据会以表格形式单独展示，你只需要做概括性的说明即可。`;
                }
                break;
                
            case 'query_and_send':
                if (data.userInfo && data.queryResults) {
                    const user = data.userInfo;
                    let queryDetails = `\n查询结果:`;
                    
                    // 处理报工情况
                    if (data.queryResults.reportWork) {
                        const { totalDays, projectCount, timeExpression, dateRange } = data.queryResults.reportWork;
                        queryDetails += `\n- 报工情况(${timeExpression}): 总工作天数${totalDays.toFixed(1)}天，项目${projectCount}个`;
                        if (dateRange) {
                            queryDetails += `\n- 查询时间范围: ${dateRange.startDate} 至 ${dateRange.endDate}`;
                        }
                    }
                    
                    // 处理其他字段
                    for (const field of data.queryFields) {
                        if (field !== '报工情况' && data.queryResults[field]) {
                            queryDetails += `\n- ${field}: ${data.queryResults[field]}`;
                        }
                    }
                    
                    contextPrompt += `查询并发送结果:`;
                    contextPrompt += `\n- 查询对象: ${user.realName} (${user.accountId})`;
                    contextPrompt += `\n- 查询字段: ${data.queryFields.join('、')}`;
                    contextPrompt += queryDetails;
                    contextPrompt += `\n- 发送状态: ${data.wechatResult.success ? '成功' : '失败'}`;
                    if (data.wechatResult.success) {
                        contextPrompt += `\n- 消息ID: ${data.wechatResult.msgid || '已生成'}`;
                    }
                    if (data.wechatResult.error) {
                        contextPrompt += `\n- 错误信息: ${data.wechatResult.error}`;
                    }
                    
                    contextPrompt += `\n\n请友好地告知用户查询和发送的完整结果。如果发送成功，要表达积极正面的态度。重点说明查询到了哪些信息并成功发送。`;
                    
                    if (data.queryResults.reportWork) {
                        contextPrompt += `\n注意：具体的报工数据会以表格形式单独展示，你只需要做概括性的说明即可。`;
                    }
                }
                break;
                
            default:
                contextPrompt += `处理结果: ${handlerResult.message}\n`;
        }

        contextPrompt += `\n请用友好简洁的语气回复用户，告知查询结果。`;
        
        return contextPrompt;
    }

    // 处理流式响应
    async handleStreamResponse(response, hasReportData, reportDataInfo) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = '';

        const messageEl = this.addMessage('系统', '', 'ai');
        const contentEl = messageEl.querySelector('.message-content');
        contentEl.classList.add('stream-cursor');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data: '));

            for (const line of lines) {
                const jsonStr = line.replace('data: ', '');
                if (jsonStr === '[DONE]') continue;

                try {
                    const data = JSON.parse(jsonStr);
                    if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                        const content = data.choices[0].delta.content;
                        aiResponse += content;
                        const formattedContent = this.utils.formatPhoneNumbers(aiResponse);
                        contentEl.innerHTML = formattedContent;
                        this.scrollToBottom();
                    }
                } catch (e) {
                    console.log('Stream parse error:', e, jsonStr);
                }
            }
        }

        contentEl.classList.remove('stream-cursor');
        
        let finalFormattedContent = this.utils.formatPhoneNumbers(aiResponse);
        
        // 添加报工数据表格
        if (hasReportData && reportDataInfo) {
            const reportTable = this.utils.formatReportData(
                reportDataInfo.projects, 
                reportDataInfo.userInfo, 
                reportDataInfo.timeInfo
            );
            finalFormattedContent += '<br>' + reportTable;
        }
        
        contentEl.innerHTML = finalFormattedContent;

        // 更新对话历史
        this.conversationHistory.push({
            role: 'assistant',
            content: aiResponse
        });

        if (this.conversationHistory.length > this.config.ui.maxConversationHistory) {
            this.conversationHistory = this.conversationHistory.slice(-this.config.ui.maxConversationHistory);
        }
    }

    // 提取报工数据信息
    extractReportDataInfo(data, intent) {
        if (data.projectData && data.userInfo) {
            return {
                projects: data.projectData.data?.userBgtList || [],
                userInfo: data.userInfo,
                timeInfo: data.dateRange ? `${data.dateRange.startDate} 至 ${data.dateRange.endDate}` : intent.timeExpression
            };
        }
        if (data.queryResults?.reportWork) {
            return {
                projects: data.queryResults.reportWork.projects,
                userInfo: data.userInfo,
                timeInfo: data.dateRange ? `${data.dateRange.startDate} 至 ${data.dateRange.endDate}` : intent.timeExpression
            };
        }
        return null;
    }

    // === 保留的原有API方法 ===
    
    async searchUser(searchKey) {
        try {
            const response = await fetch('/api/rpcServer/afa4j/3/auth/A02009', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    searchKey: searchKey,
                    orgCode: null,
                    orgId: null,
                    status: 1
                })
            });

            const data = await response.json();
            if (data.data && data.data.record) {
                const users = [];
                for (const user of data.data.record) {
                    try {
                        const detailResponse = await fetch('/api/rpcServer/afa4j/3/hrNew/HRSP00003', {
                            method: 'POST',
                            headers: this.getHeaders(),
                            body: JSON.stringify({ PRMEMBER_S_USERID: user.id })
                        });
                        const detail = await detailResponse.json();

                        users.push({
                            ...user,
                            rank: detail.data?.rank || '-',
                            standardCost: detail.data?.standardCost || '-'
                        });
                    } catch (e) {
                        users.push(user);
                    }
                }
                return users;
            }
            return [];

        } catch (error) {
            console.error('Search user error:', error);
            return [];
        }
    }

    async queryProjects(userId, startDate, endDate) {
        try {
            console.log('查询报工项目:', { userId, startDate, endDate });

            const response = await fetch('/api/rpcServer/afa4j/3/saleNew/SACP01036', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    reload: true,
                    userId: userId,
                    startDate: startDate,
                    endDate: endDate
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Query projects error:', error);
            return { data: { userBgtList: [] } };
        }
    }

    async sendWechatMessage(userName, message) {
        try {
            console.log('发送企业微信消息:', { userName, message });

            const response = await fetch('/workchat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "userId": userName,
                    "message": message,
                    "domain": 'www.awebide.com',
                    "method": "send-message"
                })
            })
            
            if (!response.ok) {
                throw new Error(`企业微信接口请求失败: ${response.status}`);
            }

            const result = await response.json();
            console.log('企业微信发送结果:', result);
            
            if (result.status && result.obj && result.obj.success) {
                return { 
                    success: true, 
                    message: result.obj.message || '消息发送成功',
                    msgid: result.obj.data?.msgid
                };
            } else {
                return { 
                    success: false, 
                    error: result.obj?.message || result.message || '发送失败' 
                };
            }
        } catch (error) {
            console.error('Send wechat message error:', error);
            return { success: false, error: error.message };
        }
    }

    getHeaders() {
        const authorization = `bearer ${this.token}`;
        const changeNo = 'q8EPXtTdIQEqtqlKppjC7V3';
        const timestamp = new Date().getTime();

        return {
            Accept: "application/json, text/plain, */*",
            "authorization": authorization,
            'channel-code': 'C000001',
            'channel-no': changeNo,
            'channel-time': timestamp,
            "timestamp": window.Timestamp(authorization, timestamp, changeNo),
            "content-type": "application/json;charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        };
    }

    // === UI相关方法 ===
    
    addMessage(sender, content, type) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'} fade-in`;

        const formattedContent = type === 'ai' ? this.utils.formatPhoneNumbers(content) : content;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="max-w-sm lg:max-w-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-br-lg px-4 py-3 shadow-lg relative group">
                    <div class="message-content text-sm">${formattedContent}</div>
                    <button class="absolute top-2 right-2 p-1 rounded-lg glass hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100" onclick="oaAssistant.copyMessage(this)" title="复制消息">
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="max-w-full glass-dark rounded-2xl rounded-bl-lg px-4 py-3 shadow-xl relative group">
                    <div class="message-content text-high-contrast text-sm">${formattedContent}</div>
                    <button class="absolute top-2 right-2 p-1 rounded-lg glass hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100" onclick="oaAssistant.copyMessage(this)" title="复制消息">
                        <svg class="w-3 h-3 text-high-contrast" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        return messageDiv;
    }

    async copyMessage(button) {
        const messageContent = button.parentElement.querySelector('.message-content');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageContent.innerHTML;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        const success = await this.utils.copyToClipboard(plainText);
        
        if (success) {
            const originalHTML = button.innerHTML;
            button.innerHTML = `<svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
            button.title = '复制成功！';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.title = '复制消息';
            }, this.config.ui.copySuccessTimeout);
        }
    }

    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        container.scrollTop = container.scrollHeight;
    }

    clearChat() {
        this.conversationHistory = [];
        // 重置为欢迎消息
        this.renderWelcomeMessage();
    }

    renderWelcomeMessage() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = this.generateWelcomeHTML();
    }

    generateWelcomeHTML() {
        const quickActions = this.intents.quickActions.map(action => `
            <div class="quick-card glass rounded-xl p-3 text-center" onclick="oaAssistant.handleQuickAction('${action.query}')">
                <div class="w-8 h-8 mx-auto mb-2 rounded-lg ${action.gradient} flex items-center justify-center">
                    ${this.getIconSVG(action.icon)}
                </div>
                <div class="text-high-contrast font-medium text-xs">${action.title}</div>
                <div class="text-medium-contrast text-xs mt-1">${action.subtitle}</div>
            </div>
        `).join('');

        return `
            <div class="flex justify-start">
                <div class="max-w-full glass-dark rounded-2xl p-4 shadow-xl relative group">
                    <div class="message-content">
                        <p class="text-high-contrast font-semibold mb-2">👋 您好！我是OA智能助手</p>
                        <p class="text-medium-contrast text-sm mb-4">我可以帮您查询人员信息、报工情况和发送企业微信消息。</p>
                        
                        <div class="mb-4">
                            <h3 class="text-high-contrast font-medium mb-3 text-sm">🚀 快速查询</h3>
                            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                ${quickActions}
                            </div>
                        </div>

                        <div class="border-t border-white/20 pt-3">
                            <h4 class="text-high-contrast font-medium mb-2 text-sm">💡 更多示例</h4>
                            <div class="space-y-1 text-xs text-medium-contrast">
                                <p>• "帮我查一下张三的电话"</p>
                                <p>• "他的报工情况"（支持代词指代）</p>
                                <p>• "发消息给张三说明天开会"</p>
                                <p>• "我去年3到6月的报工情况"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getIconSVG(iconName) {
        const icons = {
            phone: '<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
            chart: '<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
            calendar: '<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 7h6"/></svg>',
            message: '<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>'
        };
        return icons[iconName] || icons.message;
    }

    showLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        if (show) {
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    }

    updateConnectionStatus(connected) {
        const statusEl = document.getElementById('connection-status');
        const dot = statusEl.querySelector('div');
        const text = statusEl.querySelector('span');

        if (connected) {
            dot.className = 'w-2 h-2 bg-green-400 rounded-full shadow-sm';
            text.textContent = '已连接';
        } else {
            dot.className = 'w-2 h-2 bg-red-400 rounded-full shadow-sm';
            text.textContent = '连接失败';
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.oaAssistant = new OAAssistant();
    // 设置随机背景
    window.OAUtils.setRandomBackground();
});