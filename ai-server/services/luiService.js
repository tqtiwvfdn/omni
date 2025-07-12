const fs = require('fs-extra');
const path = require('path');
const Joi = require('joi');

class LUIService {
    constructor(dataDir) {
        this.LUIS_FILE = path.join(dataDir, 'luis.json');
        this.OA_HELPER_DIR = path.join(__dirname, '../../oa-helper');
    }

    // 验证schemas
    getLUIValidationSchema() {
        return Joi.object({
            name: Joi.string().required().min(1).max(100),
            description: Joi.string().required().min(1).max(1000),
            category: Joi.string().required(),
            author: Joi.string().default('Developer'),
            version: Joi.string().default('v1.0.0'),
            icon: Joi.string().default('🎨'),
            tags: Joi.array().items(Joi.string()).default([]),
            layout: Joi.object({
                rows: Joi.number().integer().min(1).max(20).required(),
                cols: Joi.number().integer().min(1).max(20).required(),
                gridGap: Joi.number().default(16)
            }).required(),
            components: Joi.array().items(
                Joi.object({
                    id: Joi.string().required(),
                    type: Joi.string().valid('title', 'image', 'paragraph', 'table', 'chart', 'button').required(),
                    position: Joi.object({
                        row: Joi.number().integer().min(0).required(),
                        col: Joi.number().integer().min(0).required(),
                        rowSpan: Joi.number().integer().min(1).default(1),
                        colSpan: Joi.number().integer().min(1).default(1)
                    }).required(),
                    content: Joi.object().required(),
                    style: Joi.object().default({}),
                    variables: Joi.array().items(Joi.string()).default([])
                })
            ).default([]),
            variables: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    type: Joi.string().valid('string', 'number', 'boolean', 'date', 'array', 'object').default('string'),
                    defaultValue: Joi.any(),
                    description: Joi.string()
                })
            ).default([]),
            documentation: Joi.string().required().min(1)
        });
    }

    getUpdateLUIValidationSchema() {
        return Joi.object({
            name: Joi.string().min(1).max(100),
            description: Joi.string().min(1).max(1000),
            category: Joi.string(),
            author: Joi.string(),
            version: Joi.string(),
            icon: Joi.string(),
            tags: Joi.array().items(Joi.string()),
            layout: Joi.object({
                rows: Joi.number().integer().min(1).max(20),
                cols: Joi.number().integer().min(1).max(20),
                gridGap: Joi.number()
            }),
            components: Joi.array().items(
                Joi.object({
                    id: Joi.string().required(),
                    type: Joi.string().valid('title', 'image', 'paragraph', 'table', 'chart', 'button').required(),
                    position: Joi.object({
                        row: Joi.number().integer().min(0).required(),
                        col: Joi.number().integer().min(0).required(),
                        rowSpan: Joi.number().integer().min(1).default(1),
                        colSpan: Joi.number().integer().min(1).default(1)
                    }).required(),
                    content: Joi.object().required(),
                    style: Joi.object().default({}),
                    variables: Joi.array().items(Joi.string()).default([])
                })
            ),
            variables: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    type: Joi.string().valid('string', 'number', 'boolean', 'date', 'array', 'object').default('string'),
                    defaultValue: Joi.any(),
                    description: Joi.string()
                })
            ),
            documentation: Joi.string().min(1)
        });
    }

    // 初始化LUI数据文件
    async initializeLUIData() {
        try {
            if (!await fs.pathExists(this.LUIS_FILE)) {
                // 从oa-helper提取初始数据
                const initialData = await this.extractFromOAHelper();
                await fs.writeJson(this.LUIS_FILE, initialData, { spaces: 2 });
            }
        } catch (error) {
            console.error('Error initializing LUI data:', error);
            throw error;
        }
    }

    // 从oa-helper提取LUI卡片数据
    async extractFromOAHelper() {
        try {
            const luis = [];
            
            // 读取oa-helper目录中的文件
            const oaHelperExists = await fs.pathExists(this.OA_HELPER_DIR);
            
            if (oaHelperExists) {
                // 分析现有的OA Helper卡片
                const quickCards = this.extractQuickCards();
                luis.push(...quickCards);
            }

            // 添加一些默认的LUI卡片
            const defaultLUIs = this.getDefaultLUICards();
            luis.push(...defaultLUIs);

            return {
                luis,
                categories: {
                    "office": "办公助手",
                    "data": "数据展示", 
                    "form": "表单卡片",
                    "chart": "图表组件",
                    "workflow": "工作流程",
                    "notification": "通知提醒"
                },
                statistics: {
                    totalLUIs: luis.length,
                    categoryCounts: this.calculateCategoryCounts(luis),
                    lastUpdated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error extracting from OA Helper:', error);
            // 返回默认数据
            const defaultLUIs = this.getDefaultLUICards();
            return {
                luis: defaultLUIs,
                categories: {
                    "office": "办公助手",
                    "data": "数据展示", 
                    "form": "表单卡片",
                    "chart": "图表组件",
                    "workflow": "工作流程",
                    "notification": "通知提醒"
                },
                statistics: {
                    totalLUIs: defaultLUIs.length,
                    categoryCounts: this.calculateCategoryCounts(defaultLUIs),
                    lastUpdated: new Date().toISOString()
                }
            };
        }
    }

    // 提取快速卡片数据
    extractQuickCards() {
        return [
            {
                id: 'oa-assistant-card',
                name: 'OA智能助手卡片',
                description: '基于OA系统的智能助手快速操作卡片，包含电话查询、报工统计等功能',
                category: 'office',
                author: 'AgreeFintech',
                version: 'v1.0.0',
                icon: '🤖',
                tags: ['智能助手', 'OA系统', '快速操作'],
                layout: {
                    rows: 2,
                    cols: 4,
                    gridGap: 8
                },
                components: [
                    {
                        id: 'phone-query',
                        type: 'button',
                        position: { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                        content: {
                            title: '查询电话',
                            subtitle: '查看联系方式',
                            icon: '📞',
                            action: 'query',
                            actionParams: { type: 'phone' }
                        },
                        style: {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white'
                        },
                        variables: ['{{user_name}}']
                    },
                    {
                        id: 'work-report',
                        type: 'button', 
                        position: { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
                        content: {
                            title: '本月报工',
                            subtitle: '查看工作统计',
                            icon: '📊',
                            action: 'query',
                            actionParams: { type: 'work_report', period: 'current_month' }
                        },
                        style: {
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white'
                        },
                        variables: ['{{user_name}}', '{{current_month}}']
                    },
                    {
                        id: 'quarter-report',
                        type: 'button',
                        position: { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
                        content: {
                            title: '季度报工',
                            subtitle: '3个月工作汇总',
                            icon: '📈',
                            action: 'query',
                            actionParams: { type: 'work_report', period: 'quarter' }
                        },
                        style: {
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white'
                        },
                        variables: ['{{user_name}}', '{{quarter_months}}']
                    },
                    {
                        id: 'send-wechat',
                        type: 'button',
                        position: { row: 0, col: 3, rowSpan: 1, colSpan: 1 },
                        content: {
                            title: '发送报工',
                            subtitle: '分享到企业微信',
                            icon: '💬',
                            action: 'send',
                            actionParams: { type: 'wechat', content: 'work_report' }
                        },
                        style: {
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            color: 'white'
                        },
                        variables: ['{{user_name}}', '{{work_report_data}}']
                    }
                ],
                variables: [
                    { name: 'user_name', type: 'string', defaultValue: '当前用户', description: '用户姓名' },
                    { name: 'current_month', type: 'string', defaultValue: '本月', description: '当前月份' },
                    { name: 'quarter_months', type: 'number', defaultValue: 3, description: '季度月数' },
                    { name: 'work_report_data', type: 'object', defaultValue: {}, description: '报工数据' }
                ],
                lastUpdated: '2024-12-15',
                usageCount: 256,
                documentation: `# OA智能助手卡片

这是一个基于OA系统的智能助手卡片，提供以下功能：

## 功能特性
- 快速查询电话号码
- 查看本月报工情况
- 查看季度报工汇总
- 一键发送报工到企业微信

## 使用方法
1. 点击对应的功能按钮
2. 系统会自动处理相关请求
3. 支持变量绑定，可动态替换数据

## 变量说明
- \`user_name\`: 当前用户姓名
- \`current_month\`: 当前月份
- \`quarter_months\`: 季度月数
- \`work_report_data\`: 报工数据对象

## API接口
支持与OA系统的深度集成，包括用户信息查询、报工数据获取等。`
            }
        ];
    }

    // 获取默认LUI卡片
    getDefaultLUICards() {
        return [
            {
                id: 'data-dashboard',
                name: '数据仪表板',
                description: '展示关键业务指标的数据仪表板，支持多种图表类型',
                category: 'data',
                author: 'LUI Team',
                version: 'v1.2.0',
                icon: '📊',
                tags: ['仪表板', '数据可视化', '图表'],
                layout: {
                    rows: 3,
                    cols: 4,
                    gridGap: 16
                },
                components: [
                    {
                        id: 'title',
                        type: 'title',
                        position: { row: 0, col: 0, rowSpan: 1, colSpan: 4 },
                        content: {
                            text: '{{dashboard_title}}',
                            level: 1,
                            align: 'center'
                        },
                        style: {
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                        },
                        variables: ['{{dashboard_title}}']
                    },
                    {
                        id: 'kpi-1',
                        type: 'chart',
                        position: { row: 1, col: 0, rowSpan: 1, colSpan: 2 },
                        content: {
                            chartType: 'gauge',
                            title: '完成率',
                            data: '{{completion_rate}}',
                            unit: '%'
                        },
                        style: {
                            background: '#f8fafc',
                            borderRadius: '8px',
                            padding: '16px'
                        },
                        variables: ['{{completion_rate}}']
                    },
                    {
                        id: 'kpi-2',
                        type: 'chart',
                        position: { row: 1, col: 2, rowSpan: 1, colSpan: 2 },
                        content: {
                            chartType: 'line',
                            title: '趋势图',
                            data: '{{trend_data}}'
                        },
                        style: {
                            background: '#f8fafc',
                            borderRadius: '8px',
                            padding: '16px'
                        },
                        variables: ['{{trend_data}}']
                    },
                    {
                        id: 'data-table',
                        type: 'table',
                        position: { row: 2, col: 0, rowSpan: 1, colSpan: 4 },
                        content: {
                            columns: ['项目', '进度', '负责人', '截止日期'],
                            data: '{{table_data}}'
                        },
                        style: {
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        },
                        variables: ['{{table_data}}']
                    }
                ],
                variables: [
                    { name: 'dashboard_title', type: 'string', defaultValue: '业务数据仪表板', description: '仪表板标题' },
                    { name: 'completion_rate', type: 'number', defaultValue: 85, description: '完成率百分比' },
                    { name: 'trend_data', type: 'array', defaultValue: [], description: '趋势数据数组' },
                    { name: 'table_data', type: 'array', defaultValue: [], description: '表格数据' }
                ],
                lastUpdated: '2024-12-15',
                usageCount: 89,
                documentation: `# 数据仪表板LUI

一个功能完整的数据仪表板组件，适用于展示业务关键指标。

## 组件包含
- 标题栏：支持自定义标题
- KPI指标：仪表盘和趋势图
- 数据表格：展示详细数据

## 变量绑定
所有数据都支持动态绑定，可从后端API获取实时数据。`
            },
            {
                id: 'expense-form',
                name: '报销申请表单',
                description: '企业报销申请表单，支持多种费用类型和审批流程',
                category: 'form',
                author: 'Finance Team',
                version: 'v2.0.0',
                icon: '💰',
                tags: ['表单', '报销', '财务'],
                layout: {
                    rows: 5,
                    cols: 2,
                    gridGap: 12
                },
                components: [
                    {
                        id: 'form-title',
                        type: 'title',
                        position: { row: 0, col: 0, rowSpan: 1, colSpan: 2 },
                        content: {
                            text: '费用报销申请',
                            level: 2
                        },
                        style: {
                            textAlign: 'center',
                            marginBottom: '20px'
                        },
                        variables: []
                    },
                    {
                        id: 'expense-info',
                        type: 'paragraph',
                        position: { row: 1, col: 0, rowSpan: 2, colSpan: 2 },
                        content: {
                            text: '申请人：{{applicant_name}}\n部门：{{department}}\n申请日期：{{apply_date}}\n费用类型：{{expense_type}}\n金额：¥{{amount}}'
                        },
                        style: {
                            background: '#f9fafb',
                            padding: '16px',
                            borderRadius: '8px',
                            lineHeight: '1.6'
                        },
                        variables: ['{{applicant_name}}', '{{department}}', '{{apply_date}}', '{{expense_type}}', '{{amount}}']
                    },
                    {
                        id: 'submit-btn',
                        type: 'button',
                        position: { row: 3, col: 0, rowSpan: 1, colSpan: 1 },
                        content: {
                            title: '提交申请',
                            action: 'submit_form'
                        },
                        style: {
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '6px'
                        },
                        variables: []
                    },
                    {
                        id: 'save-draft-btn',
                        type: 'button',
                        position: { row: 3, col: 1, rowSpan: 1, colSpan: 1 },
                        content: {
                            title: '保存草稿',
                            action: 'save_draft'
                        },
                        style: {
                            background: '#6b7280',
                            color: 'white',
                            borderRadius: '6px'
                        },
                        variables: []
                    }
                ],
                variables: [
                    { name: 'applicant_name', type: 'string', defaultValue: '', description: '申请人姓名' },
                    { name: 'department', type: 'string', defaultValue: '', description: '部门名称' },
                    { name: 'apply_date', type: 'date', defaultValue: '', description: '申请日期' },
                    { name: 'expense_type', type: 'string', defaultValue: '', description: '费用类型' },
                    { name: 'amount', type: 'number', defaultValue: 0, description: '金额' }
                ],
                lastUpdated: '2024-12-15',
                usageCount: 145,
                documentation: `# 报销申请表单

标准的企业报销申请表单组件。

## 功能特性
- 支持多种费用类型
- 集成审批流程
- 数据验证和提交
- 草稿保存功能

## 变量配置
表单字段均支持变量绑定，可与HR/财务系统集成。`
            },
            {
                id: 'notification-center',
                name: '通知中心',
                description: '统一的消息通知中心，支持多种通知类型和优先级',
                category: 'notification',
                author: 'Platform Team',
                version: 'v1.5.0',
                icon: '🔔',
                tags: ['通知', '消息', '提醒'],
                layout: {
                    rows: 4,
                    cols: 1,
                    gridGap: 8
                },
                components: [
                    {
                        id: 'notification-header',
                        type: 'title',
                        position: { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                        content: {
                            text: '消息通知 ({{unread_count}})',
                            level: 3
                        },
                        style: {
                            borderBottom: '2px solid #e5e7eb',
                            paddingBottom: '8px'
                        },
                        variables: ['{{unread_count}}']
                    },
                    {
                        id: 'notifications-list',
                        type: 'table',
                        position: { row: 1, col: 0, rowSpan: 3, colSpan: 1 },
                        content: {
                            columns: ['类型', '内容', '时间'],
                            data: '{{notifications_data}}'
                        },
                        style: {
                            maxHeight: '300px',
                            overflow: 'auto'
                        },
                        variables: ['{{notifications_data}}']
                    }
                ],
                variables: [
                    { name: 'unread_count', type: 'number', defaultValue: 0, description: '未读消息数量' },
                    { name: 'notifications_data', type: 'array', defaultValue: [], description: '通知数据列表' }
                ],
                lastUpdated: '2024-12-15',
                usageCount: 78,
                documentation: `# 通知中心组件

统一管理各类系统通知和消息提醒。

## 支持的通知类型
- 系统通知
- 审批提醒  
- 任务提醒
- 重要公告

## 数据格式
通知数据支持JSON格式，包含类型、内容、时间等字段。`
            }
        ];
    }

    // 计算分类统计
    calculateCategoryCounts(luis) {
        const counts = {};
        luis.forEach(lui => {
            counts[lui.category] = (counts[lui.category] || 0) + 1;
        });
        return counts;
    }

    // 生成LUI ID
    generateLUIId(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-lui';
    }

    // 递增版本号
    incrementVersion(currentVersion) {
        try {
            const versionWithoutV = currentVersion.replace(/^v/i, '');
            const parts = versionWithoutV.split('.');
            
            while (parts.length < 3) {
                parts.push('0');
            }
            
            const major = parseInt(parts[0]) || 0;
            const minor = parseInt(parts[1]) || 0;
            const patch = parseInt(parts[2]) || 0;
            
            return `v${major}.${minor}.${patch + 1}`;
        } catch (error) {
            console.error('Error incrementing version:', error);
            return 'v1.0.1';
        }
    }

    // 获取所有LUI
    async getAllLUIs(filters = {}) {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            let luis = data.luis || [];

            // 过滤条件
            if (filters.category && filters.category !== 'all') {
                luis = luis.filter(lui => lui.category === filters.category);
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                luis = luis.filter(lui => 
                    lui.name.toLowerCase().includes(searchTerm) ||
                    lui.description.toLowerCase().includes(searchTerm) ||
                    lui.author.toLowerCase().includes(searchTerm) ||
                    lui.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            }

            return {
                luis,
                total: luis.length,
                categories: data.categories,
                statistics: data.statistics
            };
        } catch (error) {
            console.error('Error getting LUIs:', error);
            throw error;
        }
    }

    // 根据ID获取单个LUI
    async getLUIById(id) {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            const lui = data.luis.find(l => l.id === id);
            return lui;
        } catch (error) {
            console.error('Error getting LUI by ID:', error);
            throw error;
        }
    }

    // 创建新LUI
    async createLUI(luiData) {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            
            const newLUI = {
                id: this.generateLUIId(luiData.name),
                name: luiData.name,
                description: luiData.description,
                category: luiData.category,
                author: luiData.author || 'Developer',
                version: luiData.version || 'v1.0.0',
                icon: luiData.icon || '🎨',
                tags: luiData.tags || [],
                layout: luiData.layout,
                components: luiData.components || [],
                variables: luiData.variables || [],
                lastUpdated: new Date().toISOString().split('T')[0],
                usageCount: 0,
                documentation: luiData.documentation,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };

            data.luis.push(newLUI);
            await this.updateStatistics(data);
            await fs.writeJson(this.LUIS_FILE, data, { spaces: 2 });
            
            return newLUI;
        } catch (error) {
            console.error('Error creating LUI:', error);
            throw error;
        }
    }

    // 更新LUI
    async updateLUI(id, updateData) {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            const luiIndex = data.luis.findIndex(l => l.id === id);
            
            if (luiIndex === -1) {
                return null;
            }

            const currentDate = new Date().toISOString().split('T')[0];
            const existingLUI = data.luis[luiIndex];
            
            const newVersion = updateData.version || this.incrementVersion(existingLUI.version);
            
            const updatedLUI = {
                id: existingLUI.id,
                name: updateData.name || existingLUI.name,
                description: updateData.description || existingLUI.description,
                category: updateData.category || existingLUI.category,
                author: updateData.author || existingLUI.author,
                version: newVersion,
                icon: updateData.icon || existingLUI.icon,
                tags: updateData.tags || existingLUI.tags,
                layout: updateData.layout || existingLUI.layout,
                components: updateData.components || existingLUI.components,
                variables: updateData.variables || existingLUI.variables,
                lastUpdated: currentDate,
                usageCount: existingLUI.usageCount,
                documentation: updateData.documentation || existingLUI.documentation,
                createdAt: existingLUI.createdAt,
                updatedAt: currentDate
            };
            
            data.luis[luiIndex] = updatedLUI;

            await this.updateStatistics(data);
            await fs.writeJson(this.LUIS_FILE, data, { spaces: 2 });
            
            return data.luis[luiIndex];
        } catch (error) {
            console.error('Error updating LUI:', error);
            throw error;
        }
    }

    // 删除LUI
    async deleteLUI(id) {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            const luiIndex = data.luis.findIndex(l => l.id === id);
            
            if (luiIndex === -1) {
                return null;
            }

            const deletedLUI = data.luis.splice(luiIndex, 1)[0];
            await this.updateStatistics(data);
            await fs.writeJson(this.LUIS_FILE, data, { spaces: 2 });
            
            return deletedLUI;
        } catch (error) {
            console.error('Error deleting LUI:', error);
            throw error;
        }
    }

    // 更新统计信息
    async updateStatistics(data) {
        const luis = data.luis;
        const categoryCounts = this.calculateCategoryCounts(luis);
        
        data.statistics = {
            totalLUIs: luis.length,
            categoryCounts,
            totalUsage: luis.reduce((sum, lui) => sum + (lui.usageCount || 0), 0),
            lastUpdated: new Date().toISOString()
        };
    }

    // 获取LUI统计信息
    async getStatistics() {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            return data.statistics;
        } catch (error) {
            console.error('Error getting LUI statistics:', error);
            throw error;
        }
    }

    // 搜索LUI
    async searchLUIs(query, filters = {}) {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            let luis = data.luis || [];

            // 文本搜索
            if (query) {
                const searchTerm = query.toLowerCase();
                luis = luis.filter(lui => 
                    lui.name.toLowerCase().includes(searchTerm) ||
                    lui.description.toLowerCase().includes(searchTerm) ||
                    lui.author.toLowerCase().includes(searchTerm) ||
                    lui.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                    lui.documentation.toLowerCase().includes(searchTerm)
                );
            }

            // 应用其他过滤条件
            if (filters.category && filters.category !== 'all') {
                luis = luis.filter(lui => lui.category === filters.category);
            }

            return {
                luis,
                total: luis.length,
                query,
                filters
            };
        } catch (error) {
            console.error('Error searching LUIs:', error);
            throw error;
        }
    }

    // 获取分类列表
    async getCategories() {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            return data.categories || {};
        } catch (error) {
            console.error('Error getting categories:', error);
            return {};
        }
    }

    // 增加使用次数
    async incrementUsage(id) {
        try {
            const data = await fs.readJson(this.LUIS_FILE);
            const luiIndex = data.luis.findIndex(l => l.id === id);
            
            if (luiIndex !== -1) {
                data.luis[luiIndex].usageCount = (data.luis[luiIndex].usageCount || 0) + 1;
                await this.updateStatistics(data);
                await fs.writeJson(this.LUIS_FILE, data, { spaces: 2 });
                return data.luis[luiIndex];
            }
            
            return null;
        } catch (error) {
            console.error('Error incrementing usage:', error);
            throw error;
        }
    }
}

module.exports = LUIService;