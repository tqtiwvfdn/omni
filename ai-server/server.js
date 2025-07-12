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

// HTTP client for external API calls
const axios = require('axios');

// Import MCP Service
const MCPService = require('./services/mcpService');

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const APPS_FILE = path.join(DATA_DIR, 'applications.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');

// Initialize MCP Service
const mcpService = new MCPService(DATA_DIR);

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

// Get single application (with tenant support)
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
            updatedAt: moment().format('YYYY-MM-DD')
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


// Model management endpoints

// Get aggregated model list from multiple endpoints
app.get('/api/models', async (req, res) => {
    try {
        // Model endpoint configurations
        const modelEndpoints = [
            'http://192.168.32.77:8792/v1/models',
            'http://192.168.32.77:8791/v1/models',
            'http://10.8.6.30:30000/v1/models'
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

// Update statistics (with tenant support)
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