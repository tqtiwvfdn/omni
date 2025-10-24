const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// HTTP client for external API calls
const axios = require('axios');

// Import Services
const MCPService = require('./services/mcpService');
const LUIService = require('./services/luiService');
const ComponentService = require('./services/componentService');
const PromptTemplateService = require('./services/promptTemplateService');
const AgentService = require('./services/agentService');
const AppMCPService = require('./services/appMCPService');

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const APPS_FILE = path.join(DATA_DIR, 'applications.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');

// Initialize Services
const mcpService = new MCPService(DATA_DIR);
const luiService = new LUIService(DATA_DIR);
const componentService = new ComponentService(DATA_DIR);
const promptTemplateService = new PromptTemplateService();
const agentService = new AgentService(DATA_DIR);

// Initialize data directory and files
async function initializeData() {
    try {
        await fs.ensureDir(DATA_DIR);
        
        // Initialize applications.json if it doesn't exist
        if (!await fs.pathExists(APPS_FILE)) {
            const initialApps = {
                "lAseKW": [
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
                    }
                ],
                "tenant-agree": []
            };
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
        
        // Initialize MCP data
        await mcpService.initializeMCPData();
        
        // Initialize LUI data
        await luiService.initializeLUIData();
        
        // Initialize agent data
        await agentService.initializeAgentData();
        
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
    features: Joi.array().items(Joi.string()).default([]),
    // 新增的元数据字段
    metadata: Joi.object({
        tenantId: Joi.string().required(),
        knowledgeBaseId: Joi.string().optional().allow(''),
        vectorConfigId: Joi.string().optional().allow(''),
        assistantConfig: Joi.object({
            logo: Joi.string().optional().allow(''),
            theme: Joi.string().optional().allow(''),
            welcomeMessage: Joi.string().optional().allow(''),
            presetQuestions: Joi.array().items(Joi.string()).default([]),
            mainIntentEntry: Joi.string().optional().allow('')
        }).optional().default({}),
        environments: Joi.object({
            dev: Joi.object({
                url: Joi.string().optional().allow(''),
                status: Joi.string().default('inactive')
            }).optional(),
            sit: Joi.object({
                url: Joi.string().optional().allow(''),
                status: Joi.string().default('inactive')
            }).optional(),
            uat: Joi.object({
                url: Joi.string().optional().allow(''),
                status: Joi.string().default('inactive')
            }).optional()
        }).optional().default({})
    }).required()
});

const updateAppSchema = Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().min(1).max(500),
    category: Joi.string(),
    status: Joi.string().valid('development', 'testing', 'production', 'planned'),
    version: Joi.string(),
    developer: Joi.string(),
    features: Joi.array().items(Joi.string()),
    gitRepo: Joi.string().uri(),
    // 新增的元数据字段更新
    metadata: Joi.object({
        tenantId: Joi.string(),
        knowledgeBaseId: Joi.string().optional().allow(''),
        vectorConfigId: Joi.string().optional().allow(''),
        assistantConfig: Joi.object({
            logo: Joi.string().optional().allow(''),
            theme: Joi.string().optional().allow(''),
            welcomeMessage: Joi.string().optional().allow(''),
            presetQuestions: Joi.array().items(Joi.string()),
            mainIntentEntry: Joi.string().optional().allow('')
        }).optional(),
        environments: Joi.object({
            dev: Joi.object({
                url: Joi.string().optional().allow(''),
                status: Joi.string()
            }).optional(),
            sit: Joi.object({
                url: Joi.string().optional().allow(''),
                status: Joi.string()
            }).optional(),
            uat: Joi.object({
                url: Joi.string().optional().allow(''),
                status: Joi.string()
            }).optional()
        }).optional()
    }).optional()
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

// Get all applications (with tenant support)
app.get('/api/applications', async (req, res) => {
    try {
        const { status, category, search } = req.query;
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW'; // Default to lAseKW if no tenant specified
        
        const appsData = await fs.readJson(APPS_FILE);
        let apps = appsData[tenantId] || [];
        
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
            total: apps.length,
            tenant: tenantId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single application by ID (with tenant support)
app.get('/api/applications/:id', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW';
        const appsData = await fs.readJson(APPS_FILE);
        const apps = appsData[tenantId] || [];
        const app = apps.find(a => a.id === parseInt(req.params.id));
        
        if (!app) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            data: app,
            tenant: tenantId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single application by appId (with tenant support)
app.get('/api/applications/by-appid/:appId', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW';
        const appsData = await fs.readJson(APPS_FILE);
        const apps = appsData[tenantId] || [];
        const app = apps.find(a => a.appId === req.params.appId);
        
        if (!app) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            data: app,
            tenant: tenantId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new application (with tenant support)
app.post('/api/applications', async (req, res) => {
    try {
        const { error, value } = createAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW';
        const appsData = await fs.readJson(APPS_FILE);
        
        // Ensure tenant exists
        if (!appsData[tenantId]) {
            appsData[tenantId] = [];
        }
        
        const apps = appsData[tenantId];
        const newApp = {
            id: Math.max(...Object.values(appsData).flat().map(a => a.id), 0) + 1,
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
            updatedAt: moment().format('YYYY-MM-DD'),
            // 新增的元数据字段
            metadata: {
                tenantId: value.metadata.tenantId,
                knowledgeBaseId: value.metadata.knowledgeBaseId || '',
                vectorConfigId: value.metadata.vectorConfigId || '',
                assistantConfig: {
                    logo: value.metadata.assistantConfig?.logo || '',
                    theme: value.metadata.assistantConfig?.theme || 'default',
                    welcomeMessage: value.metadata.assistantConfig?.welcomeMessage || `欢迎使用${value.name}`,
                    presetQuestions: value.metadata.assistantConfig?.presetQuestions || [],
                    mainIntentEntry: value.metadata.assistantConfig?.mainIntentEntry || ''
                },
                environments: {
                    dev: {
                        url: value.metadata.environments?.dev?.url || '',
                        status: value.metadata.environments?.dev?.status || 'inactive'
                    },
                    sit: {
                        url: value.metadata.environments?.sit?.url || '',
                        status: value.metadata.environments?.sit?.status || 'inactive'
                    },
                    uat: {
                        url: value.metadata.environments?.uat?.url || '',
                        status: value.metadata.environments?.uat?.status || 'inactive'
                    }
                }
            }
        };
        
        apps.push(newApp);
        await fs.writeJson(APPS_FILE, appsData, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.status(201).json({
            success: true,
            data: newApp,
            tenant: tenantId,
            message: 'Application created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Update application (with tenant support)
app.put('/api/applications/:id', async (req, res) => {
    try {
        const { error, value } = updateAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW';
        const appsData = await fs.readJson(APPS_FILE);
        const apps = appsData[tenantId] || [];
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
        
        appsData[tenantId] = apps;
        await fs.writeJson(APPS_FILE, appsData, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.json({
            success: true,
            data: apps[appIndex],
            tenant: tenantId,
            message: 'Application updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update application by appId (with tenant support)
app.put('/api/applications/by-appid/:appId', async (req, res) => {
    try {
        const { error, value } = updateAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW';
        const appsData = await fs.readJson(APPS_FILE);
        const apps = appsData[tenantId] || [];
        const appIndex = apps.findIndex(a => a.appId === req.params.appId);
        
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
        
        appsData[tenantId] = apps;
        await fs.writeJson(APPS_FILE, appsData, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.json({
            success: true,
            data: apps[appIndex],
            tenant: tenantId,
            message: 'Application updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete application (with tenant support)
app.delete('/api/applications/:id', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW';
        const appsData = await fs.readJson(APPS_FILE);
        const apps = appsData[tenantId] || [];
        const appIndex = apps.findIndex(a => a.id === parseInt(req.params.id));
        
        if (appIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        const deletedApp = apps.splice(appIndex, 1)[0];
        appsData[tenantId] = apps;
        await fs.writeJson(APPS_FILE, appsData, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.json({
            success: true,
            data: deletedApp,
            tenant: tenantId,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete application by appId (with tenant support)
app.delete('/api/applications/by-appid/:appId', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'lAseKW';
        const appsData = await fs.readJson(APPS_FILE);
        const apps = appsData[tenantId] || [];
        const appIndex = apps.findIndex(a => a.appId === req.params.appId);
        
        if (appIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        const deletedApp = apps.splice(appIndex, 1)[0];
        appsData[tenantId] = apps;
        await fs.writeJson(APPS_FILE, appsData, { spaces: 2 });
        
        // Update stats
        await updateStats();
        
        res.json({
            success: true,
            data: deletedApp,
            tenant: tenantId,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// App MCP API Routes - for application-specific MCPs

// Get all MCPS for an application
app.get('/api/mcp-app', async (req, res) => {
    try {
        const { appId, search, category, sortBy } = req.query;
        
        if (!appId) {
            return res.status(400).json({ success: false, error: 'appId is required' });
        }
        
        const filters = { search, category, sortBy };
        const result = await AppMCPService.searchMcps(appId, filters);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get MCP by ID
app.get('/api/mcp-app/:id', async (req, res) => {
    try {
        const { appId } = req.query;
        const { id } = req.params;
        
        if (!appId) {
            return res.status(400).json({ success: false, error: 'appId is required' });
        }
        
        const result = await AppMCPService.getMcpById(appId, id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new MCP
app.post('/api/mcp-app', async (req, res) => {
    try {
        const { appId } = req.query;
        const mcpData = req.body;
        
        if (!appId) {
            return res.status(400).json({ success: false, error: 'appId is required' });
        }
        
        const result = await AppMCPService.createMcp(appId, mcpData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update MCP
app.put('/api/mcp-app/:id', async (req, res) => {
    try {
        const { appId } = req.query;
        const { id } = req.params;
        const mcpData = req.body;
        
        if (!appId) {
            return res.status(400).json({ success: false, error: 'appId is required' });
        }
        
        const result = await AppMCPService.updateMcp(appId, id, mcpData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete MCP
app.delete('/api/mcp-app/:id', async (req, res) => {
    try {
        const { appId } = req.query;
        const { id } = req.params;
        
        if (!appId) {
            return res.status(400).json({ success: false, error: 'appId is required' });
        }
        
        const result = await AppMCPService.deleteMcp(appId, id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get application statistics (with tenant support)
app.get('/api/stats', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const stats = await fs.readJson(STATS_FILE);
        
        if (tenantId && stats.tenants && stats.tenants[tenantId]) {
            // Return tenant-specific stats
            res.json({
                success: true,
                data: {
                    ...stats.tenants[tenantId],
                    lastUpdated: stats.lastUpdated
                },
                tenant: tenantId
            });
        } else {
            // Return global stats
            res.json({
                success: true,
                data: stats
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// MCP management endpoints

// Get all MCPs
app.get('/api/mcps', async (req, res) => {
    try {
        const { status, category, search } = req.query;
        const result = await mcpService.getAllMCPs({ status, category, search });
        
        res.json({
            success: true,
            data: result.mcps,
            total: result.total,
            statistics: result.statistics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single MCP by ID
app.get('/api/mcps/:id', async (req, res) => {
    try {
        const mcp = await mcpService.getMCPById(req.params.id);
        
        if (!mcp) {
            return res.status(404).json({
                success: false,
                error: 'MCP not found'
            });
        }
        
        res.json({
            success: true,
            data: mcp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new MCP
app.post('/api/mcps', async (req, res) => {
    try {
        const { error, value } = mcpService.getMCPValidationSchema().validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const newMCP = await mcpService.createMCP(value);
        
        res.status(201).json({
            success: true,
            data: newMCP,
            message: 'MCP created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update MCP
app.put('/api/mcps/:id', async (req, res) => {
    try {
        const { error, value } = mcpService.getUpdateMCPValidationSchema().validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const updatedMCP = await mcpService.updateMCP(req.params.id, value);
        
        if (!updatedMCP) {
            return res.status(404).json({
                success: false,
                error: 'MCP not found'
            });
        }
        
        res.json({
            success: true,
            data: updatedMCP,
            message: 'MCP updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete MCP
app.delete('/api/mcps/:id', async (req, res) => {
    try {
        const deletedMCP = await mcpService.deleteMCP(req.params.id);
        
        if (!deletedMCP) {
            return res.status(404).json({
                success: false,
                error: 'MCP not found'
            });
        }
        
        res.json({
            success: true,
            data: deletedMCP,
            message: 'MCP deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search MCPs
app.get('/api/mcps/search/:query', async (req, res) => {
    try {
        const { category, status } = req.query;
        const result = await mcpService.searchMCPs(req.params.query, { category, status });
        
        res.json({
            success: true,
            data: result.mcps,
            total: result.total,
            query: result.query,
            filters: result.filters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get MCP statistics
app.get('/api/mcps/statistics', async (req, res) => {
    try {
        const statistics = await mcpService.getStatistics();
        
        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// LUI management endpoints

// Get all LUIs
app.get('/api/luis', async (req, res) => {
    try {
        const { category, search } = req.query;
        const result = await luiService.getAllLUIs({ category, search });
        
        res.json({
            success: true,
            data: result.luis,
            total: result.total,
            categories: result.categories,
            statistics: result.statistics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// LUI Category management endpoints - these must come before the /:id route

// Get LUI categories
app.get('/api/luis/categories', async (req, res) => {
    try {
        const categories = await luiService.getCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.trace();
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new LUI category
app.post('/api/luis/categories', async (req, res) => {
    try {
        const { key, name } = req.body;
        
        if (!key || !name) {
            return res.status(400).json({
                success: false,
                error: 'Category key and name are required'
            });
        }
        
        const result = await luiService.createCategory(key, name);
        
        res.status(201).json({
            success: true,
            data: result,
            message: 'Category created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update LUI category
app.put('/api/luis/categories/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Category name is required'
            });
        }
        
        const result = await luiService.updateCategory(key, name);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: result,
            message: 'Category updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete LUI category
app.delete('/api/luis/categories/:key', async (req, res) => {
    try {
        const { key } = req.params;
        
        const result = await luiService.deleteCategory(key);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: result,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single LUI by ID
app.get('/api/luis/:id', async (req, res) => {
    try {
        const lui = await luiService.getLUIById(req.params.id);
        
        if (!lui) {
            return res.status(404).json({
                success: false,
                error: 'LUI not found'
            });
        }
        
        res.json({
            success: true,
            data: lui
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new LUI
app.post('/api/luis', async (req, res) => {
    try {
        const { error, value } = luiService.getLUIValidationSchema().validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const newLUI = await luiService.createLUI(value);
        
        res.status(201).json({
            success: true,
            data: newLUI,
            message: 'LUI created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update LUI
app.put('/api/luis/:id', async (req, res) => {
    try {
        const { error, value } = luiService.getUpdateLUIValidationSchema().validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }
        
        const updatedLUI = await luiService.updateLUI(req.params.id, value);
        
        if (!updatedLUI) {
            return res.status(404).json({
                success: false,
                error: 'LUI not found'
            });
        }
        
        res.json({
            success: true,
            data: updatedLUI,
            message: 'LUI updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete LUI
app.delete('/api/luis/:id', async (req, res) => {
    try {
        const deletedLUI = await luiService.deleteLUI(req.params.id);
        
        if (!deletedLUI) {
            return res.status(404).json({
                success: false,
                error: 'LUI not found'
            });
        }
        
        res.json({
            success: true,
            data: deletedLUI,
            message: 'LUI deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search LUIs
app.get('/api/luis/search/:query', async (req, res) => {
    try {
        const { category } = req.query;
        const result = await luiService.searchLUIs(req.params.query, { category });
        
        res.json({
            success: true,
            data: result.luis,
            total: result.total,
            query: result.query,
            filters: result.filters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get LUI statistics
app.get('/api/luis/statistics', async (req, res) => {
    try {
        const statistics = await luiService.getStatistics();
        
        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Increment LUI usage
app.post('/api/luis/:id/usage', async (req, res) => {
    try {
        const updatedLUI = await luiService.incrementUsage(req.params.id);
        
        if (!updatedLUI) {
            return res.status(404).json({
                success: false,
                error: 'LUI not found'
            });
        }
        
        res.json({
            success: true,
            data: updatedLUI,
            message: 'Usage count incremented'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Component management endpoints

// Get all components
app.get('/api/components', async (req, res) => {
    try {
        const result = await componentService.getComponents();
        
        res.json({
            success: result.success,
            data: result.data,
            count: result.count,
            error: result.error
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single component by name
app.get('/api/components/:name', async (req, res) => {
    try {
        const result = await componentService.getComponent(req.params.name);
        
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }
        
        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ensure all components have required files
app.post('/api/components/ensure', async (req, res) => {
    try {
        const result = await componentService.ensureAllComponentFiles();
        
        res.json({
            success: result.success,
            data: result.data,
            message: 'Component files ensured successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ensure specific component has required files
app.post('/api/components/:name/ensure', async (req, res) => {
    try {
        const result = await componentService.ensureComponentFiles(req.params.name);
        
        res.json({
            success: true,
            data: result,
            message: `Component ${req.params.name} files ensured successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Prompt Template management endpoints

// Get prompt template categories
app.get('/api/prompt-templates/categories', async (req, res) => {
    try {
        const categories = await promptTemplateService.getCategories();
        const stats = await promptTemplateService.getStats();
        
        res.json({
            success: true,
            data: categories,
            stats: stats?.categoryStats || {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new prompt template category
app.post('/api/prompt-templates/categories', async (req, res) => {
    try {
        const newCategory = await promptTemplateService.createCategory(req.body);
        
        res.json({
            success: true,
            data: newCategory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Update prompt template category
app.put('/api/prompt-templates/categories/:id', async (req, res) => {
    try {
        const updatedCategory = await promptTemplateService.updateCategory(req.params.id, req.body);
        
        res.json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Delete prompt template category
app.delete('/api/prompt-templates/categories/:id', async (req, res) => {
    try {
        await promptTemplateService.deleteCategory(req.params.id);
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Get all prompt templates
app.get('/api/prompt-templates', async (req, res) => {
    try {
        const { category, search } = req.query;
        const templates = await promptTemplateService.getTemplates(category, search);
        
        res.json({
            success: true,
            data: templates,
            total: templates.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single prompt template by ID
app.get('/api/prompt-templates/:id', async (req, res) => {
    try {
        const template = await promptTemplateService.getTemplateById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }
        
        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new prompt template
app.post('/api/prompt-templates', async (req, res) => {
    try {
        const newTemplate = await promptTemplateService.createTemplate(req.body);
        
        res.json({
            success: true,
            data: newTemplate
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Update prompt template
app.put('/api/prompt-templates/:id', async (req, res) => {
    try {
        const updatedTemplate = await promptTemplateService.updateTemplate(req.params.id, req.body);
        
        res.json({
            success: true,
            data: updatedTemplate
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Delete prompt template
app.delete('/api/prompt-templates/:id', async (req, res) => {
    try {
        await promptTemplateService.deleteTemplate(req.params.id);
        
        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Increment template usage count
app.post('/api/prompt-templates/:id/usage', async (req, res) => {
    try {
        await promptTemplateService.incrementUsageCount(req.params.id);
        
        res.json({
            success: true,
            message: 'Usage count incremented'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Get prompt template statistics
app.get('/api/prompt-templates/statistics', async (req, res) => {
    try {
        const stats = await promptTemplateService.getStats();
        
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

// AI optimization endpoint
app.post('/api/prompt-templates/:id/optimize', async (req, res) => {
    try {
        const template = await promptTemplateService.getTemplateById(req.params.id);
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        const { focus = 'clarity', intensity = 'moderate', targetModel = 'gpt4' } = req.body;
        
        // Call OpenAI API for optimization
        const optimizationPrompt = `作为一个提示词工程专家，请帮我优化以下提示词。

优化重点：${focus}
优化强度：${intensity}
目标模型：${targetModel}

原始提示词：
${template.content}

请按照以下要求优化：
1. 保持原有的变量格式 {{variable_name}}
2. 提升指令的清晰度和可执行性
3. 优化结构和逻辑
4. 改进示例的质量
5. 增强上下文理解

请只返回优化后的提示词内容，不要包含其他说明。`;

        const openaiResponse = await axios.post('http://localhost:3000/raw-ai/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: optimizationPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2048
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const optimizedContent = openaiResponse.data.choices[0].message.content;

        res.json({
            success: true,
            data: {
                original: template.content,
                optimized: optimizedContent,
                improvements: [
                    { type: 'structure', description: '优化了指令结构，使其更加清晰明确' },
                    { type: 'clarity', description: '改进了表达方式，降低了理解难度' },
                    { type: 'examples', description: '完善了示例内容，提供更好的引导' }
                ]
            }
        });
    } catch (error) {
        console.error('AI optimization error:', error);
        res.status(500).json({
            success: false,
            error: 'AI优化服务暂时不可用，请稍后再试'
        });
    }
});

// Template debug/test endpoint
app.post('/api/prompt-templates/:id/debug', async (req, res) => {
    try {
        const template = await promptTemplateService.getTemplateById(req.params.id);
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        const { testData, userMessage } = req.body;
        
        // Replace variables in template
        let processedPrompt = template.content;
        if (testData) {
            Object.entries(testData).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                processedPrompt = processedPrompt.replace(regex, value);
            });
        }

        // Call OpenAI API for testing
        const messages = [
            { role: 'system', content: processedPrompt }
        ];
        
        if (userMessage) {
            messages.push({ role: 'user', content: userMessage });
        }

        const startTime = Date.now();
        const openaiResponse = await axios.post('http://localhost:3000/raw-ai/v1/chat/completions', {
            model: 'gpt-4',
            messages,
            temperature: 0.7,
            max_tokens: 1024
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const responseTime = Date.now() - startTime;
        const aiResponse = openaiResponse.data.choices[0].message.content;

        // Increment usage count
        await promptTemplateService.incrementUsageCount(req.params.id);

        res.json({
            success: true,
            data: {
                response: aiResponse,
                metrics: {
                    responseTime: `${responseTime}ms`,
                    accuracy: '87%', // Mock value
                    quality: 'A+'    // Mock value
                },
                processedPrompt
            }
        });
    } catch (error) {
        console.error('Debug test error:', error);
        res.status(500).json({
            success: false,
            error: 'AI调试服务暂时不可用，请稍后再试'
        });
    }
});


// Model management endpoints

// Get aggregated model list from multiple endpoints
app.get('/api/models', async (req, res) => {
    try {
        // Model endpoint configurations
        const modelEndpoints = [
            'http://192.168.32.77:8792/v1/models',
            'http://192.168.32.77:8791/v1/models',
            'http://192.168.32.77:8793/v1/models',
            //'http://10.8.4.110:8788/v1/models'
        ];

        // Read local model descriptions for enrichment (optional)
        let modelDescriptions = { models: [] };
        try {
            modelDescriptions = await fs.readJson(MODELS_FILE);
        } catch (error) {
            console.warn('Models configuration file not found, using empty config');
        }

        // Create a map for quick description lookup
        const descriptionMap = new Map();
        if (modelDescriptions.models) {
            modelDescriptions.models.forEach(model => {
                descriptionMap.set(model.id, model);
            });
        }

        // Fetch model data from all endpoints
        const endpointPromises = modelEndpoints.map(async (endpoint) => {
            try {
                console.log(`Fetching models from: ${endpoint}`);
                const response = await axios.get(endpoint, { 
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'AI-Server-Aggregator/1.0'
                    }
                });
                console.log(`Success from ${endpoint}:`, response.data);
                return {
                    endpoint,
                    status: 'success',
                    data: response.data,
                    responseTime: Date.now()
                };
            } catch (error) {
                console.error(`Error from ${endpoint}:`, error.message);
                return {
                    endpoint,
                    status: 'error',
                    error: error.message,
                    responseTime: Date.now()
                };
            }
        });

        const endpointResults = await Promise.all(endpointPromises);

        // Aggregate models from all successful endpoints
        const modelMap = new Map(); // Use model ID as key to deduplicate
        const endpointStatusMap = new Map(); // Track which endpoints have which models

        endpointResults.forEach(result => {
            if (result.status === 'success' && result.data) {
                let models = [];
                
                // Handle different response formats
                if (result.data.data && Array.isArray(result.data.data)) {
                    models = result.data.data;
                } else if (result.data.models && Array.isArray(result.data.models)) {
                    models = result.data.models;
                } else if (Array.isArray(result.data)) {
                    models = result.data;
                }
                
                console.log(`Found ${models.length} models from ${result.endpoint}`);
                
                models.forEach(model => {
                    const modelId = model.id || model.model || model.name;
                    if (!modelId) return;
                    
                    // Initialize model entry if not exists
                    if (!modelMap.has(modelId)) {
                        const description = descriptionMap.get(modelId);
                        modelMap.set(modelId, {
                            id: modelId,
                            name: description?.name || model.name || modelId,
                            description: description?.description || model.description || null,
                            category: description?.category || model.category || null,
                            provider: description?.provider || model.provider || null,
                            version: description?.version || model.version || null,
                            usage: description?.usage || model.usage || null,
                            created: model.created || null,
                            endpoints: [],
                            totalEndpoints: 0,
                            availableEndpoints: 0,
                            invocation_examples: description?.invocation_examples || {}
                        });
                        endpointStatusMap.set(modelId, {
                            total: modelEndpoints.length,
                            available: 0,
                            endpoints: []
                        });
                    }
                    
                    // Add endpoint info
                    const modelData = modelMap.get(modelId);
                    const statusData = endpointStatusMap.get(modelId);
                    
                    modelData.endpoints.push({
                        endpoint: result.endpoint,
                        status: 'available',
                        responseTime: result.responseTime,
                        modelData: model
                    });
                    
                    modelData.availableEndpoints++;
                    statusData.available++;
                    statusData.endpoints.push(result.endpoint);
                });
            }
        });

        // Mark unavailable endpoints for each model
        modelEndpoints.forEach(endpoint => {
            const endpointResult = endpointResults.find(r => r.endpoint === endpoint);
            if (endpointResult?.status === 'error') {
                modelMap.forEach((modelData, modelId) => {
                    const statusData = endpointStatusMap.get(modelId);
                    if (statusData && !statusData.endpoints.includes(endpoint)) {
                        modelData.endpoints.push({
                            endpoint: endpoint,
                            status: 'unavailable',
                            error: endpointResult.error
                        });
                    }
                });
            }
        });

        // Convert to array and calculate final status
        const aggregatedModels = Array.from(modelMap.values()).map(model => {
            model.totalEndpoints = modelEndpoints.length;
            
            // Calculate availability percentage
            const availabilityPercentage = model.totalEndpoints > 0 
                ? Math.round((model.availableEndpoints / model.totalEndpoints) * 100)
                : 0;

            // Determine overall status
            let overallStatus = 'unavailable';
            if (model.availableEndpoints === model.totalEndpoints && model.totalEndpoints > 0) {
                overallStatus = 'online';
            } else if (model.availableEndpoints > 0) {
                overallStatus = 'partial';
            }

            return {
                ...model,
                status: {
                    overall: overallStatus,
                    availability: availabilityPercentage,
                    availableEndpoints: model.availableEndpoints,
                    totalEndpoints: model.totalEndpoints
                },
                lastChecked: new Date().toISOString()
            };
        });

        // Generate summary statistics
        const summary = {
            totalModels: aggregatedModels.length,
            onlineModels: aggregatedModels.filter(m => m.status.overall === 'online').length,
            partialModels: aggregatedModels.filter(m => m.status.overall === 'partial').length,
            offlineModels: aggregatedModels.filter(m => m.status.overall === 'unavailable').length,
            endpoints: {
                total: modelEndpoints.length,
                available: endpointResults.filter(r => r.status === 'success').length,
                unavailable: endpointResults.filter(r => r.status === 'error').length
            },
            lastUpdated: new Date().toISOString()
        };

        console.log('Aggregation complete:', {
            totalModels: aggregatedModels.length,
            summary
        });

        res.json({
            success: true,
            data: {
                models: aggregatedModels,
                summary,
                endpointStatus: endpointResults
            }
        });
    } catch (error) {
        console.error('Error aggregating model data:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: 'Failed to aggregate model data from endpoints'
        });
    }
});

// Get model invocation examples
app.get('/api/models/:modelId/examples', async (req, res) => {
    try {
        const { modelId } = req.params;
        const { language = 'python' } = req.query;

        // Read model descriptions
        const modelDescriptions = await fs.readJson(MODELS_FILE);
        const model = modelDescriptions.models?.find(m => m.id === modelId);

        if (!model) {
            return res.status(404).json({
                success: false,
                error: 'Model not found'
            });
        }

        const example = model.invocation_examples?.[language];
        if (!example) {
            return res.status(404).json({
                success: false,
                error: `No example found for language: ${language}`
            });
        }

        res.json({
            success: true,
            data: {
                modelId,
                language,
                example,
                availableLanguages: Object.keys(model.invocation_examples || {})
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update model configuration
app.put('/api/models/:modelId', async (req, res) => {
    try {
        const { modelId } = req.params;
        const updateData = req.body;

        // Read current model descriptions
        let modelDescriptions = await fs.readJson(MODELS_FILE);
        
        // Find and update the model
        const modelIndex = modelDescriptions.models.findIndex(m => m.id === modelId);
        if (modelIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Model not found'
            });
        }

        // Update model data
        modelDescriptions.models[modelIndex] = {
            ...modelDescriptions.models[modelIndex],
            ...updateData,
            id: modelId, // Ensure ID doesn't change
            lastUpdated: new Date().toISOString()
        };

        // Save updated configuration
        await fs.writeJson(MODELS_FILE, modelDescriptions, { spaces: 2 });

        res.json({
            success: true,
            data: modelDescriptions.models[modelIndex],
            message: 'Model updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 智能体管理API路由

// 获取所有智能体
app.get('/api/agents', async (req, res) => {
    try {
        const { appId, search, status } = req.query;
        const agents = await agentService.getAgents({ appId, search, status });
        
        res.json({
            success: true,
            data: agents,
            total: agents.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取单个智能体
app.get('/api/agents/:id', async (req, res) => {
    try {
        const agent = await agentService.getAgentById(req.params.id);
        
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: '智能体不存在'
            });
        }
        
        res.json({
            success: true,
            data: agent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 创建智能体
app.post('/api/agents', async (req, res) => {
    try {
        const newAgent = await agentService.createAgent(req.body);
        
        res.status(201).json({
            success: true,
            data: newAgent,
            message: '智能体创建成功'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// 更新智能体
app.put('/api/agents/:id', async (req, res) => {
    try {
        const updatedAgent = await agentService.updateAgent(req.params.id, req.body);
        
        if (!updatedAgent) {
            return res.status(404).json({
                success: false,
                error: '智能体不存在'
            });
        }
        
        res.json({
            success: true,
            data: updatedAgent,
            message: '智能体更新成功'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// 删除智能体
app.delete('/api/agents/:id', async (req, res) => {
    try {
        const deletedAgent = await agentService.deleteAgent(req.params.id);
        
        if (!deletedAgent) {
            return res.status(404).json({
                success: false,
                error: '智能体不存在'
            });
        }
        
        res.json({
            success: true,
            data: deletedAgent,
            message: '智能体删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 智能体版本管理API路由

// 获取智能体的所有版本
app.get('/api/agents/:agentId/versions', async (req, res) => {
    try {
        const versions = await agentService.getAgentVersions(req.params.agentId);
        
        res.json({
            success: true,
            data: versions,
            total: versions.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取智能体的特定版本
app.get('/api/agents/:agentId/versions/:versionId', async (req, res) => {
    try {
        const version = await agentService.getAgentVersion(req.params.agentId, req.params.versionId);
        
        if (!version) {
            return res.status(404).json({
                success: false,
                error: '版本不存在'
            });
        }
        
        res.json({
            success: true,
            data: version
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 创建智能体版本
app.post('/api/agents/:agentId/versions', async (req, res) => {
    try {
        const { isDraft = false } = req.body;
        const newVersion = await agentService.createAgentVersion(req.params.agentId, req.body, isDraft);
        
        res.status(201).json({
            success: true,
            data: newVersion,
            message: '版本创建成功'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// 更新智能体版本
app.put('/api/agents/:agentId/versions/:versionId', async (req, res) => {
    try {
        const updatedVersion = await agentService.updateAgentVersion(req.params.agentId, req.params.versionId, req.body);
        
        if (!updatedVersion) {
            return res.status(404).json({
                success: false,
                error: '版本不存在'
            });
        }
        
        res.json({
            success: true,
            data: updatedVersion,
            message: '版本更新成功'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// 删除智能体版本
app.delete('/api/agents/:agentId/versions/:versionId', async (req, res) => {
    try {
        const deletedVersion = await agentService.deleteAgentVersion(req.params.agentId, req.params.versionId);
        
        if (!deletedVersion) {
            return res.status(404).json({
                success: false,
                error: '版本不存在'
            });
        }
        
        res.json({
            success: true,
            data: deletedVersion,
            message: '版本删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 发布智能体版本
app.post('/api/agents/:agentId/versions/:versionId/publish', async (req, res) => {
    try {
        const publishedVersion = await agentService.publishAgentVersion(req.params.agentId, req.params.versionId);
        
        if (!publishedVersion) {
            return res.status(404).json({
                success: false,
                error: '版本不存在'
            });
        }
        
        res.json({
            success: true,
            data: publishedVersion,
            message: '版本发布成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 更新统计信息 (带有租户支持)
async function updateStats() {
    try {
        const appsData = await fs.readJson(APPS_FILE);
        const allApps = Object.values(appsData).flat();
        
        const stats = {
            totalApps: allApps.length,
            productionApps: allApps.filter(a => a.status === 'production').length,
            developmentApps: allApps.filter(a => a.status === 'development').length,
            testingApps: allApps.filter(a => a.status === 'testing').length,
            plannedApps: allApps.filter(a => a.status === 'planned').length,
            lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss'),
            tenants: {}
        };
        
        // Calculate per-tenant statistics
        Object.keys(appsData).forEach(tenantId => {
            const tenantApps = appsData[tenantId];
            stats.tenants[tenantId] = {
                totalApps: tenantApps.length,
                productionApps: tenantApps.filter(a => a.status === 'production').length,
                developmentApps: tenantApps.filter(a => a.status === 'development').length,
                testingApps: tenantApps.filter(a => a.status === 'testing').length,
                plannedApps: tenantApps.filter(a => a.status === 'planned').length
            };
        });
        
        await fs.writeJson(STATS_FILE, stats, { spaces: 2 });
        return stats;
    } catch (error) {
        console.error('Error updating stats:', error);
        throw error;
    }
}

// API 路由别名 - 将 /omni-api/* 映射到 /api/*
// 通过重新注册所有路由来实现别名
// const originalRoutes = [];
// app._router.stack.forEach(layer => {
//     if (layer.route && layer.route.path && layer.route.path.startsWith('/api/')) {
//         originalRoutes.push({
//             path: layer.route.path,
//             methods: layer.route.methods,
//             handler: layer.route.stack[0].handle
//         });
//     }
// });

// // 为每个 /api/* 路由创建对应的 /omni-api/* 路由
// originalRoutes.forEach(route => {
//     const omniPath = route.path.replace(/^\/api/, '/omni-api');
//     Object.keys(route.methods).forEach(method => {
//         if (method !== '_all') {
//             app[method](omniPath, route.handler);
//         }
//     });
// });

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