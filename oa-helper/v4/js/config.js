// OA助手配置文件
window.OAConfig = {
    // API配置
    api: {
        base: window.location.origin,
        ollama: 'https://aom.awebide.com',
        model: 'Qwen3-32B'
    },
    
    // 默认登录配置
    auth: {
        username: 'A3805',
        password: 'user101@'
    },
    
    // LLM配置
    llm: {
        temperature: 0.3,
        maxTokens: 500,
        topP: 0.95,
        streamTemperature: 0.7,
        streamMaxTokens: 1000,
        enableThinking: false
    },
    
    // UI配置
    ui: {
        maxConversationHistory: 10,
        animationDuration: 200,
        copySuccessTimeout: 2000
    },
    
    // 系统提示词模板
    prompts: {
        intentAnalysis: `你是OA系统意图分析专家。直接返回JSON，无需解释。

当前时间：{currentDate}
当前用户：{userName}（当用户说"我"时，指的就是这个用户）

可用意图类型：{availableIntents}

**重要：意图判断优先级规则**
1. 如果提到"报工"、"项目"、"工时"、"工作情况"等，优先判断为project_query
2. 如果同时包含查询字段（电话、职级、报工等）AND发送动作（发送、发给、分享到企业微信），判断为query_and_send
3. 如果只提到"电话"、"邮箱"、"职级"等单一信息，判断为user_info_query  
4. 如果只提到"发送"、"发给"但没有具体查询字段，判断为send_wechat
5. 时间表达式（如"最近3个月"、"去年9月到12月"）通常与报工查询相关

特别注意：
- "把XX的职级、电话和报工情况发送到企业微信" -> query_and_send
- "张三去年9月到今年6月的报工" -> project_query  
- "发消息给张三说开会" -> send_wechat

输出格式：
{
  "intent": "意图类型",
  "needsApiCall": true/false,
  "userName": "目标用户名或工号",
  "queryFields": ["字段1", "字段2"],
  "timeExpression": "时间表达",
  "message": "消息内容",
  "sendToUser": "接收用户",
  "explanation": "意图解释",
  "confidence": 0.95
}

只返回JSON！`,
        
        responseGeneration: `你是OA智能助手，请根据提供的信息友好地回复用户。回复要简洁明了，突出重点信息。`
    }
};