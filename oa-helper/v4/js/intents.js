// 意图配置清单
window.IntentConfig = {
    // 意图定义
    intents: {
        user_info_query: {
            name: '用户信息查询',
            description: '查询用户的基本信息，如电话、职级、部门等',
            needsApiCall: true,
            handler: 'handleUserInfoQuery',
            fields: ['电话', '职级', '成本', '邮箱', '部门', '全部'],
            keywords: ['查询', '电话', '手机', '职级', '邮箱', '部门', '信息'],
            examples: [
                '查询张三的电话',
                '帮我找一下李四的邮箱',
                '王五的职级是什么'
            ]
        },
        
        project_query: {
            name: '报工查询',
            description: '查询用户的项目报工情况',
            needsApiCall: true,
            handler: 'handleProjectQuery',
            fields: ['报工情况'],
            supportTimeExpression: true,
            keywords: ['报工', '项目', '工作情况', '工时'],
            examples: [
                '我本月的报工情况',
                '张三去年3到6月的报工',
                '最近3个月的项目情况'
            ]
        },
        
        send_wechat: {
            name: '发送企业微信',
            description: '向指定用户发送企业微信消息',
            needsApiCall: true,
            handler: 'handleSendWechat',
            fields: ['message', 'sendToUser'],
            keywords: ['发送', '发给', '通知', '告诉', '消息'],
            examples: [
                '发消息给张三说明天开会',
                '通知李四会议取消了',
                '告诉王五项目延期'
            ]
        },
        
        query_and_send: {
            name: '查询并发送',
            description: '查询信息后发送到企业微信',
            needsApiCall: true,
            handler: 'handleQueryAndSend',
            fields: ['电话', '职级', '成本', '邮箱', '部门', '报工情况'],
            supportTimeExpression: true,
            keywords: ['发送', '发到', '分享', '报工', '查询'],
            examples: [
                '把我的报工情况发到企业微信',
                '将张三的联系方式发给李四',
                '分享本月项目进度'
            ]
        },
        
        general_chat: {
            name: '一般对话',
            description: '常规聊天和帮助',
            needsApiCall: false,
            handler: 'handleGeneralChat',
            fields: [],
            keywords: ['你好', '帮助', '谢谢', '再见'],
            examples: [
                '你好',
                '你能做什么',
                '谢谢你的帮助'
            ]
        }
    },
    
    // 快速操作配置
    quickActions: [
        {
            title: '查询电话',
            subtitle: '查看联系方式',
            icon: 'phone',
            gradient: 'gradient-blue',
            query: '查询我的电话'
        },
        {
            title: '本月报工',
            subtitle: '查看工作统计',
            icon: 'chart',
            gradient: 'gradient-green',
            query: '我本月的报工情况'
        },
        {
            title: '季度报工',
            subtitle: '3个月工作汇总',
            icon: 'calendar',
            gradient: 'gradient-orange',
            query: '我最近3个月的报工情况'
        },
        {
            title: '发送报工',
            subtitle: '分享到企业微信',
            icon: 'message',
            gradient: 'gradient-purple',
            query: '把我本月的报工情况发到企业微信'
        }
    ],
    
    // 意图匹配规则（用于fallback）
    matchRules: {
        // 基于关键词的简单匹配规则
        user_info_query: {
            patterns: [
                /查询.*?(电话|手机|职级|邮箱|部门|信息)/,
                /(电话|手机|职级|邮箱|部门).*?是/,
                /帮.*?查.*?(电话|邮箱|职级)/
            ]
        },
        project_query: {
            patterns: [
                /报工.*?情况/,
                /(本月|上月|去年|今年|最近).*?报工/,
                /项目.*?(情况|进度|工时)/
            ]
        },
        send_wechat: {
            patterns: [
                /(发送|发给|通知|告诉).*?(?!企业微信)/,
                /消息.*?给/
            ]
        },
        query_and_send: {
            patterns: [
                /(发送|发到|分享).*?企业微信/,
                /把.*?(报工|信息|联系方式).*?(发送|发到|分享)/
            ]
        }
    },
    
    // 获取意图列表
    getIntentList() {
        return Object.keys(this.intents);
    },
    
    // 获取意图配置
    getIntent(intentName) {
        return this.intents[intentName];
    },
    
    // 根据关键词匹配意图（fallback方法）
    matchIntent(message) {
        const text = message.toLowerCase();
        
        for (const [intentName, rules] of Object.entries(this.matchRules)) {
            if (rules.patterns.some(pattern => pattern.test(text))) {
                return intentName;
            }
        }
        
        return 'general_chat';
    }
};