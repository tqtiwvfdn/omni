const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const APPS_FILE = path.join(DATA_DIR, 'applications.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Initialize data directory and files
async function initializeData() {
    try {
        await fs.ensureDir(DATA_DIR);
        
        // Initialize applications.json if it doesn't exist
        if (!await fs.pathExists(APPS_FILE)) {
            const initialApps = [
                {
                    id: 1,
                    appId: "qa-assistant-001",
                    name: "智能问答助手",
                    description: "AI行员助手核心，提供智能问答和知识检索服务",
                    status: "development",
                    version: "v2.1.3",
                    icon: "🤖",
                    category: "核心服务",
                    lastUpdated: "2025-06-15",
                    developer: "产品团队",
                    features: ["自然语言处理", "知识库检索", "多轮对话", "意图识别"],
                    workspace: "/development/app-workspace/qa-assistant",
                    gitRepo: "https://git.company.com/ai-apps/qa-assistant.git",
                    createdAt: "2025-06-10",
                    updatedAt: "2025-06-15"
                },
                {
                    id: 2,
                    appId: "writing-assistant-002",
                    name: "智能写作助手",
                    description: "基于大模型的文档生成和写作辅助工具",
                    status: "production",
                    version: "v1.8.2",
                    icon: "✍️",
                    category: "内容生成",
                    lastUpdated: "2025-06-12",
                    developer: "渠道解决方案部",
                    features: ["文档生成", "文本润色", "格式标准化", "模板管理"],
                    workspace: "/development/app-workspace/writing-assistant",
                    gitRepo: "https://git.company.com/ai-apps/writing-assistant.git",
                    createdAt: "2025-06-05",
                    updatedAt: "2025-06-12"
                },
                {
                    id: 3,
                    appId: "form-assistant-003",
                    name: "智能表单助手",
                    description: "OCR+AI融合的智能表单识别和处理系统",
                    status: "production",
                    version: "v1.5.1",
                    icon: "📋",
                    category: "数据处理",
                    lastUpdated: "2025-06-10",
                    developer: "产品团队",
                    features: ["OCR识别", "表单解析", "数据验证", "自动填充"],
                    workspace: "/development/app-workspace/form-assistant",
                    gitRepo: "https://git.company.com/ai-apps/form-assistant.git",
                    createdAt: "2025-06-01",
                    updatedAt: "2025-06-10"
                }
            ];
            await fs.writeJson(APPS_FILE, initialApps, { spaces: 2 });
        }
        
        // Initialize users.json if it doesn't exist
        if (!await fs.pathExists(USERS_FILE)) {
            const initialUsers = [
                {
                    id: 1,
                    username: "admin",
                    name: "管理员",
                    email: "admin@company.com",
                    role: "admin",
                    createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
                }
            ];
            await fs.writeJson(USERS_FILE, initialUsers, { spaces: 2 });
        }
        
        // Initialize stats.json if it doesn't exist
        if (!await fs.pathExists(STATS_FILE)) {
            const initialStats = {
                totalApps: 0,
                productionApps: 0,
                developmentApps: 0,
                testingApps: 0,
                plannedApps: 0,
                lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            await fs.writeJson(STATS_FILE, initialStats, { spaces: 2 });
        }
        
        console.log('Data files initialized successfully');
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Validation schemas
const createAppSchema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    description: Joi.string().required().min(1).max(500),
    category: Joi.string().required(),
    template: Joi.string().required(),
    gitRepo: Joi.string().uri().optional(),
    developer: Joi.string().default('开发团队'),
    features: Joi.array().items(Joi.string()).default([])
});

const updateAppSchema = Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().min(1).max(500),
    category: Joi.string(),
    status: Joi.string().valid('development', 'testing', 'production', 'planned'),
    version: Joi.string(),
    developer: Joi.string(),
    features: Joi.array().items(Joi.string()),
    gitRepo: Joi.string().uri()
});

// Utility functions
function generateAppId(name, category) {
    const categoryMap = {
        '核心服务': 'core',
        '内容生成': 'content',
        '数据处理': 'data',
        '用户体验': 'ux',
        '风控合规': 'risk',
        '流程自动化': 'rpa',
        '营销推广': 'marketing',
        '数据分析': 'analytics',
        '系统服务': 'system',
        '开发工具': 'dev',
        '质量保证': 'qa',
        '资源管理': 'resource'
    };
    
    const prefix = categoryMap[category] || 'app';
    const suffix = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
    return `${prefix}-assistant-${suffix}`;
}

function getAppIcon(category) {
    const iconMap = {
        '核心服务': '🤖',
        '内容生成': '✍️',
        '数据处理': '📋',
        '用户体验': '🧭',
        '风控合规': '🔍',
        '流程自动化': '⚡',
        '营销推广': '📈',
        '数据分析': '📊',
        '系统服务': '🔀',
        '开发工具': '💻',
        '质量保证': '🔎',
        '资源管理': '⚙️'
    };
    
    return iconMap[category] || '📱';
}

// API Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all applications
app.get('/api/applications', async (req, res) => {
    try {
        const { status, category, search } = req.query;
        let apps = await fs.readJson(APPS_FILE);
        
        // Filter by status
        if (status && status !== 'all') {
            apps = apps.filter(app => app.status === status);
        }
        
        // Filter by category
        if (category) {
            apps = apps.filter(app => app.category === category);
        }
        
        // Search functionality
        if (search) {
            const searchTerm = search.toLowerCase();
            apps = apps.filter(app => 
                app.name.toLowerCase().includes(searchTerm) ||
                app.description.toLowerCase().includes(searchTerm) ||
                app.appId.toLowerCase().includes(searchTerm)
            );
        }
        
        res.json({
            success: true,
            data: apps,
            total: apps.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single application
app.get('/api/applications/:id', async (req, res) => {
    try {
        const apps = await fs.readJson(APPS_FILE);
        const app = apps.find(a => a.id === parseInt(req.params.id));
        
        if (!app) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            data: app
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new application
app.post('/api/applications', async (req, res) => {
    try {
        const { error, value } = createAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const apps = await fs.readJson(APPS_FILE);
        const newApp = {
            id: Math.max(...apps.map(a => a.id), 0) + 1,
            appId: generateAppId(value.name, value.category),
            name: value.name,
            description: value.description,
            status: 'development',
            version: 'v0.1.0-alpha',
            icon: getAppIcon(value.category),
            category: value.category,
            lastUpdated: moment().format('YYYY-MM-DD'),
            developer: value.developer,
            features: value.features,
            workspace: `/development/app-workspace/${value.name.toLowerCase().replace(/\\s+/g, '-')}`,
            gitRepo: value.gitRepo || `https://git.company.com/ai-apps/${value.name.toLowerCase().replace(/\\s+/g, '-')}.git`,
            createdAt: moment().format('YYYY-MM-DD'),
            updatedAt: moment().format('YYYY-MM-DD')
        };
        
        apps.push(newApp);
        await fs.writeJson(APPS_FILE, apps, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.status(201).json({
            success: true,
            data: newApp,
            message: 'Application created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update application
app.put('/api/applications/:id', async (req, res) => {
    try {
        const { error, value } = updateAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const apps = await fs.readJson(APPS_FILE);
        const appIndex = apps.findIndex(a => a.id === parseInt(req.params.id));
        
        if (appIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        // Update the application
        apps[appIndex] = {
            ...apps[appIndex],
            ...value,
            updatedAt: moment().format('YYYY-MM-DD')
        };
        
        await fs.writeJson(APPS_FILE, apps, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.json({
            success: true,
            data: apps[appIndex],
            message: 'Application updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
    try {
        const apps = await fs.readJson(APPS_FILE);
        const appIndex = apps.findIndex(a => a.id === parseInt(req.params.id));
        
        if (appIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        const deletedApp = apps.splice(appIndex, 1)[0];
        await fs.writeJson(APPS_FILE, apps, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.json({
            success: true,
            data: deletedApp,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get application statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await fs.readJson(STATS_FILE);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update statistics
async function updateStats() {
    try {
        const apps = await fs.readJson(APPS_FILE);
        const stats = {
            totalApps: apps.length,
            productionApps: apps.filter(a => a.status === 'production').length,
            developmentApps: apps.filter(a => a.status === 'development').length,
            testingApps: apps.filter(a => a.status === 'testing').length,
            plannedApps: apps.filter(a => a.status === 'planned').length,
            lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        
        await fs.writeJson(STATS_FILE, stats, { spaces: 2 });
        return stats;
    } catch (error) {
        console.error('Error updating stats:', error);
        throw error;
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Start server
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`🚀 Omni AI Server running on port ${PORT}`);
        console.log(`📝 API Documentation: http://localhost:${PORT}/health`);
        console.log(`📊 Applications API: http://localhost:${PORT}/api/applications`);
        console.log(`📈 Statistics API: http://localhost:${PORT}/api/stats`);
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

startServer().catch(console.error);