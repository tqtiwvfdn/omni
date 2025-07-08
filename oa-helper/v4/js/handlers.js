// 意图处理器集合
window.IntentHandlers = {
    
    // 用户信息查询处理器
    async handleUserInfoQuery(intent, assistant) {
        try {
            console.log('处理用户信息查询:', intent);
            const userInfo = await assistant.searchUser(intent.userName);
            
            if (userInfo.length === 0) {
                return {
                    success: false,
                    message: `未找到用户 "${intent.userName}" 的信息`,
                    data: null
                };
            }
            
            return {
                success: true,
                message: '查询成功',
                data: {
                    userInfo: userInfo[0],
                    queryFields: intent.queryFields
                }
            };
        } catch (error) {
            console.error('用户信息查询失败:', error);
            return {
                success: false,
                message: '查询用户信息时发生错误',
                data: null
            };
        }
    },
    
    // 项目报工查询处理器
    async handleProjectQuery(intent, assistant) {
        try {
            console.log('处理项目查询:', intent);
            const userInfo = await assistant.searchUser(intent.userName);
            
            if (userInfo.length === 0) {
                return {
                    success: false,
                    message: `未找到用户 "${intent.userName}"`,
                    data: null
                };
            }
            
            const dateRange = await assistant.utils.parseTimeExpression(intent.timeExpression);
            const projectData = await assistant.queryProjects(
                userInfo[0].id, 
                dateRange.startDate, 
                dateRange.endDate
            );
            
            return {
                success: true,
                message: '查询成功',
                data: {
                    userInfo: userInfo[0],
                    projectData,
                    dateRange,
                    timeExpression: intent.timeExpression
                }
            };
        } catch (error) {
            console.error('项目查询失败:', error);
            return {
                success: false,
                message: '查询项目信息时发生错误',
                data: null
            };
        }
    },
    
    // 企业微信发送处理器
    async handleSendWechat(intent, assistant) {
        try {
            console.log('处理企业微信发送:', intent);
            const result = await assistant.sendWechatMessage(intent.sendToUser, intent.message);
            
            return {
                success: result.success,
                message: result.success ? '消息发送成功' : '消息发送失败',
                data: {
                    wechatResult: result,
                    sendToUser: intent.sendToUser,
                    message: intent.message
                }
            };
        } catch (error) {
            console.error('企业微信发送失败:', error);
            return {
                success: false,
                message: '发送企业微信消息时发生错误',
                data: null
            };
        }
    },
    
        // 查询并发送处理器
    async handleQueryAndSend(intent, assistant) {
        try {
            console.log('处理查询并发送:', intent);
            console.log('查询字段:', intent.queryFields);
            console.log('时间表达式:', intent.timeExpression);
            
            const userInfo = await assistant.searchUser(intent.userName);
            
            if (userInfo.length === 0) {
                return {
                    success: false,
                    message: `未找到用户 "${intent.userName}"`,
                    data: null
                };
            }
            
            const user = userInfo[0];
            let queryResults = {};
            let dateRange = null;
            
            // 处理各种查询字段
            for (const field of intent.queryFields) {
                console.log('处理字段:', field);
                
                if (field === '报工情况') {
                    console.log('开始查询报工数据...');
                    dateRange = await assistant.utils.parseTimeExpression(intent.timeExpression);
                    console.log('解析时间范围:', dateRange);
                    
                    const projectData = await assistant.queryProjects(user.id, dateRange.startDate, dateRange.endDate);
                    console.log('报工查询结果:', projectData);
                    
                    const projects = projectData.data?.userBgtList || [];
                    const totalDays = projects.reduce((sum, p) => sum + parseFloat(p.DL_WORKDAYS || 0), 0);
                    
                    queryResults.reportWork = {
                        projects: projects,
                        totalDays: totalDays,
                        projectCount: projects.length,
                        timeExpression: intent.timeExpression,
                        dateRange: dateRange
                    };
                    console.log('报工数据存储:', queryResults.reportWork);
                } else {
                    // 处理其他字段
                    queryResults[field] = this.extractUserField(user, field);
                    console.log(`字段 ${field} 的值:`, queryResults[field]);
                }
            }
            
            console.log('最终查询结果:', queryResults);
            
            // 构建要发送的消息
            const messageToSend = this.buildWechatMessage(user, queryResults, intent.queryFields, intent.timeExpression, dateRange);
            console.log('构建的企业微信消息:', messageToSend);
            
            // 发送到企业微信
            const wechatResult = await assistant.sendWechatMessage(
                localStorage.getItem('userName'), 
                messageToSend
            );
            
            return {
                success: true,
                message: wechatResult.success ? '查询并发送成功' : '查询成功但发送失败',
                data: {
                    userInfo: user,
                    queryResults,
                    messageToSend,
                    wechatResult,
                    queryFields: intent.queryFields,
                    dateRange,
                    timeExpression: intent.timeExpression
                }
            };
        } catch (error) {
            console.error('查询并发送失败:', error);
            return {
                success: false,
                message: '查询并发送时发生错误',
                data: null
            };
        }
    },
    
    // 一般对话处理器
    async handleGeneralChat(intent, assistant) {
        return {
            success: true,
            message: '一般对话',
            data: {
                isGeneralChat: true,
                originalMessage: intent.originalMessage
            }
        };
    },
    
    // 工具方法：提取用户字段
    extractUserField(user, field) {
        const fieldMap = {
            '电话': user.mobile || '未设置',
            '手机': user.mobile || '未设置',
            '职级': user.rank || '未设置',
            '成本': user.standardCost || '未设置',
            '邮箱': user.email || '未设置',
            '部门': user.orgName || '未设置',
            '姓名': user.realName || '未设置',
            '工号': user.accountId || '未设置',
            '全部': {
                name: user.realName,
                accountId: user.accountId,
                department: user.orgName || '未设置',
                phone: user.mobile || '未设置',
                email: user.email || '未设置',
                rank: user.rank || '未设置',
                cost: user.standardCost || '未设置'
            }
        };
        
        return fieldMap[field] || '未设置';
    },
    
    // 工具方法：构建企业微信消息
    buildWechatMessage(user, queryResults, queryFields, timeExpression, dateRange) {
        let message = `${user.realName}的信息：\n\n`;
        
        for (const field of queryFields) {
            if (field === '报工情况' && queryResults.reportWork) {
                const { projects, totalDays, projectCount } = queryResults.reportWork;
                message += `**报工情况(${timeExpression || '默认时间段'})：**\n`;
                if (dateRange) {
                    message += `查询时间: ${dateRange.startDate} 至 ${dateRange.endDate}\n`;
                }
                message += `总工作天数: ${totalDays.toFixed(1)}天\n`;
                message += `项目总数: ${projectCount}个\n\n`;
                
                if (projects.length > 0) {
                    message += `项目详情:\n`;
                    projects.forEach(p => {
                        message += `• ${p.S_BGTNAME}: ${p.DL_WORKDAYS}天 (负责人: ${p.S_BGTOWNER})\n`;
                    });
                } else {
                    message += `暂无报工记录\n`;
                }
                message += '\n';
            } else if (field === '全部' && queryResults.fullInfo) {
                const info = queryResults.fullInfo;
                message += `**基本信息：**\n`;
                message += `姓名: ${info.name}\n`;
                message += `工号: ${info.accountId}\n`;
                message += `部门: ${info.department}\n`;
                message += `电话: ${info.phone}\n`;
                message += `邮箱: ${info.email}\n`;
                message += `职级: ${info.rank}\n`;
                message += `成本: ${info.cost}\n\n`;
            } else {
                // 处理单个字段
                const fieldValue = queryResults[field];
                const fieldNames = {
                    '电话': '电话',
                    '手机': '电话',
                    '职级': '职级', 
                    '成本': '成本',
                    '邮箱': '邮箱',
                    '部门': '部门'
                };
                
                if (fieldNames[field] && fieldValue !== undefined && fieldValue !== '未设置') {
                    message += `${fieldNames[field]}: ${fieldValue}\n`;
                } else if (fieldNames[field]) {
                    message += `${fieldNames[field]}: 未设置\n`;
                }
            }
        }
        
        message += `\n如需进一步协助，请随时告知！`;
        return message;
    },
    
    // 动态调用处理器
    async callHandler(handlerName, intent, assistant) {
        if (typeof this[handlerName] === 'function') {
            return await this[handlerName](intent, assistant);
        } else {
            console.error(`处理器 ${handlerName} 不存在`);
            return {
                success: false,
                message: `未找到处理器 ${handlerName}`,
                data: null
            };
        }
    }
};