// 工具方法集合
window.OAUtils = {
    
    // 时间表达式解析（异步LLM增强版）
    async parseTimeExpression(expression, currentDate = new Date()) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        // 如果没有表达式，默认返回当月
        if (!expression) {
            return {
                startDate: `${year}${month.toString().padStart(2, '0')}01`,
                endDate: `${year}${month.toString().padStart(2, '0')}${new Date(year, month, 0).getDate()}`
            };
        }
        
        // 使用LLM增强的时间解析
        return await this.parseLLMTimeExpression(expression, currentDate);
    },
    
    // LLM增强的时间解析
    async parseLLMTimeExpression(expression, currentDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        
        const prompt = `当前时间：${year}年${month}月${day}日
时间表达式："${expression}"

请解析这个时间表达式，返回JSON格式：
{
  "startDate": "YYYYMMDD",
  "endDate": "YYYYMMDD", 
  "description": "解析说明"
}

解析规则和示例：
- 本月/这个月 -> 当前月份1号到月末
- 上月/上个月 -> 上个月1号到月末  
- 今年 -> 当年1月1日到12月31日
- 去年 -> 去年1月1日到12月31日
- 最近N个月 -> N个月前1号到当前月末
- 具体年月如"2023年3月" -> 该年月1号到月末
- 跨月范围如"去年9月到12月" -> 去年9月1日到去年12月31日
- 跨年范围如"去年9月到今年6月" -> 去年9月1日到今年6月30日
- 季度如"Q1"、"第一季度" -> 对应季度的起止日期

注意：
- 去年指${year-1}年
- 今年指${year}年
- 跨年时间范围要准确计算起止年份

只返回JSON，不要其他内容。`;

        try {
            const response = await fetch(`${window.OAConfig.api.ollama}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: window.OAConfig.api.model,
                    messages: [
                        { role: 'system', content: '你是时间解析专家，只返回JSON格式的解析结果。' },
                        { role: 'user', content: prompt }
                    ],
                    stream: false,
                    temperature: 0.1,
                    max_tokens: 200,
                    top_p: 0.9,
                    "chat_template_kwargs": { "enable_thinking": false }
                })
            });

            if (!response.ok) {
                throw new Error(`LLM时间解析API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // 清理并解析LLM返回的JSON
            const cleanedContent = this.cleanThinkingContent(content);
            const timeResult = JSON.parse(cleanedContent);
            
            // 验证返回格式
            if (timeResult.startDate && timeResult.endDate) {
                console.log('LLM时间解析成功:', timeResult);
                return {
                    startDate: timeResult.startDate,
                    endDate: timeResult.endDate,
                    description: timeResult.description || `解析"${expression}"`
                };
            } else {
                throw new Error('LLM返回格式不正确');
            }
            
        } catch (error) {
            console.error('LLM时间解析失败，使用fallback:', error);
            return this.fallbackTimeParser(expression, currentDate);
        }
    },
    
    // 简化的时间解析器（fallback）
    fallbackTimeParser(expression, currentDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const expr = expression.toLowerCase();
        
        // 常用时间表达式映射
        const timeMap = {
            '今天': () => {
                const dateStr = `${year}${month.toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
                return { startDate: dateStr, endDate: dateStr };
            },
            '本月': () => ({
                startDate: `${year}${month.toString().padStart(2, '0')}01`,
                endDate: `${year}${month.toString().padStart(2, '0')}${new Date(year, month, 0).getDate()}`
            }),
            '上月': () => {
                const lastMonth = month === 1 ? 12 : month - 1;
                const lastMonthYear = month === 1 ? year - 1 : year;
                return {
                    startDate: `${lastMonthYear}${lastMonth.toString().padStart(2, '0')}01`,
                    endDate: `${lastMonthYear}${lastMonth.toString().padStart(2, '0')}${new Date(lastMonthYear, lastMonth, 0).getDate()}`
                };
            },
            '今年': () => ({
                startDate: `${year}0101`,
                endDate: `${year}1231`
            }),
            '去年': () => ({
                startDate: `${year - 1}0101`,
                endDate: `${year - 1}1231`
            })
        };
        
        // 直接匹配
        for (const [key, func] of Object.entries(timeMap)) {
            if (expr.includes(key)) {
                return func();
            }
        }
        
        // 复杂表达式的简单匹配
        const recentMonthsMatch = expr.match(/最近(\d+)个?月/);
        if (recentMonthsMatch) {
            const months = parseInt(recentMonthsMatch[1]);
            const startMonth = month - months + 1;
            let startYear = year;
            let adjustedStartMonth = startMonth;
            
            if (startMonth <= 0) {
                startYear = year - 1;
                adjustedStartMonth = 12 + startMonth;
            }
            
            return {
                startDate: `${startYear}${adjustedStartMonth.toString().padStart(2, '0')}01`,
                endDate: `${year}${month.toString().padStart(2, '0')}${new Date(year, month, 0).getDate()}`
            };
        }
        
        // 默认返回当月
        return {
            startDate: `${year}${month.toString().padStart(2, '0')}01`,
            endDate: `${year}${month.toString().padStart(2, '0')}${new Date(year, month, 0).getDate()}`
        };
    },
    
    // 格式化时间戳
    formatTimestamp(timestamp) {
        if (!timestamp) return '未设置';
        try {
            const date = new Date(parseInt(timestamp));
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '-');
        } catch (e) {
            return '格式错误';
        }
    },
    
    // 格式化报工数据为HTML表格
    formatReportData(projects, userInfo, timeInfo) {
        if (!projects || projects.length === 0) {
            return `<div class="glass-dark rounded-xl p-4 text-center my-3">
                <h3 class="text-high-contrast font-semibold mb-2 text-sm">${userInfo.realName}的报工情况</h3>
                <p class="text-medium-contrast text-xs mb-2">查询时间: ${timeInfo}</p>
                <p class="text-medium-contrast text-sm">暂无报工记录</p>
            </div>`;
        }

        const totalDays = projects.reduce((sum, p) => sum + parseFloat(p.DL_WORKDAYS || 0), 0);

        const summary = `<div class="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-4 my-3 border border-white/20">
            <h3 class="text-high-contrast font-bold mb-2 text-sm">${userInfo.realName}的报工汇总</h3>
            <p class="text-medium-contrast text-xs mb-3">查询时间: ${timeInfo}</p>
            <div class="grid grid-cols-2 gap-3">
                <div class="text-center">
                    <div class="text-xl font-bold text-high-contrast">${totalDays.toFixed(1)}</div>
                    <div class="text-medium-contrast text-xs">总工作天数</div>
                </div>
                <div class="text-center">
                    <div class="text-xl font-bold text-high-contrast">${projects.length}</div>
                    <div class="text-medium-contrast text-xs">项目数量</div>
                </div>
            </div>
        </div>`;

        const table = `<div class="table-container my-3">
            <div class="glass-dark rounded-xl overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-white/10">
                        <tr class="text-high-contrast font-medium text-xs">
                            <th class="px-3 py-2 text-left">项目名称</th>
                            <th class="px-3 py-2 text-left">工作天数</th>
                            <th class="px-3 py-2 text-left">开始时间</th>
                            <th class="px-3 py-2 text-left">结束时间</th>
                            <th class="px-3 py-2 text-left">负责人</th>
                        </tr>
                    </thead>
                    <tbody class="text-medium-contrast">
                        ${projects.map((project, index) => `
                            <tr class="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                                <td class="px-3 py-2 font-medium text-xs">${project.S_BGTNAME}</td>
                                <td class="px-3 py-2 font-semibold text-blue-300 text-xs">${project.DL_WORKDAYS}天</td>
                                <td class="px-3 py-2 text-xs">${this.formatTimestamp(project.DT_STARTDATE)}</td>
                                <td class="px-3 py-2 text-xs">${this.formatTimestamp(project.DT_ENDDATE)}</td>
                                <td class="px-3 py-2 text-xs">${project.S_BGTOWNER}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        return summary + table;
    },
    
    // 格式化电话号码为可点击链接
    formatPhoneNumbers(text) {
        const phoneRegex = /(\b1[3-9]\d{9}\b)/g;
        
        return text.replace(phoneRegex, (match) => {
            return `<a href="tel:${match}" class="phone-link">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                ${match}
            </a>`;
        });
    },
    
    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            return false;
        }
    },
    
    // 清理LLM响应中的thinking内容
    cleanThinkingContent(content) {
        if (!content || typeof content !== 'string') {
            return '{"intent": "general_chat", "needsApiCall": false, "queryFields": ["全部"], "explanation": "无效内容"}';
        }

        let cleaned = content
            .replace(/^.*?思考[：:].*/gm, '')
            .replace(/^.*?分析[：:].*/gm, '')
            .replace(/^.*?让我.*/gm, '')
            .replace(/<think>.*?<\/think>/gs, '')
            .replace(/^首先.*$/gm, '')
            .replace(/^然后.*$/gm, '')
            .replace(/^根据.*$/gm, '')
            .replace(/^我需要.*$/gm, '')
            .trim();

        const jsonMatch = cleaned.match(/\{.*\}/s);
        if (jsonMatch) {
            return jsonMatch[0];
        }

        return '{"intent": "general_chat", "needsApiCall": false, "queryFields": ["全部"], "explanation": "一般对话"}';
    },
    
    // 生成随机背景图片
    setRandomBackground() {
        const r = Math.floor(Math.random() * 2000 + 1);
        const style = document.createElement('style');
        style.innerHTML = `
            body {
                background-image: url('https://img.infinitynewtab.com/wallpaper/${r}.jpg');
                background-repeat: no-repeat;
                background-size: cover;
                background-position: center;
            }
        `;
        document.body.append(style);
    }
};