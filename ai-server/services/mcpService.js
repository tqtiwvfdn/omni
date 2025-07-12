const fs = require('fs-extra');
const path = require('path');
const Joi = require('joi');

class MCPService {
    constructor(dataDir) {
        this.MCPS_FILE = path.join(dataDir, 'mcps.json');
    }

    // 验证schemas
    getMCPValidationSchema() {
        return Joi.object({
            name: Joi.string().required().min(1).max(100),
            description: Joi.string().required().min(1).max(1000),
            category: Joi.string().required(),
            author: Joi.string().default('Developer'),
            version: Joi.string().default('v1.0.0'),
            icon: Joi.string().default('📦'),
            iconBg: Joi.string().default('bg-gray-100'),
            iconColor: Joi.string().default('text-gray-600'),
            tags: Joi.array().items(Joi.string()).default([]),
            documentation: Joi.string().required().min(1),
            endpoints: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
                    path: Joi.string().required(),
                    description: Joi.string().required()
                })
            ).default([])
        });
    }

    getUpdateMCPValidationSchema() {
        return Joi.object({
            name: Joi.string().min(1).max(100),
            description: Joi.string().min(1).max(1000),
            category: Joi.string(),
            author: Joi.string(),
            version: Joi.string(),
            icon: Joi.string(),
            iconBg: Joi.string(),
            iconColor: Joi.string(),
            tags: Joi.array().items(Joi.string()),
            documentation: Joi.string().min(1),
            endpoints: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
                    path: Joi.string().required(),
                    description: Joi.string().required()
                })
            )
        });
    }

    // 初始化MCP数据文件
    async initializeMCPData() {
        try {
            if (!await fs.pathExists(this.MCPS_FILE)) {
                const initialData = {
                    mcps: [],
                    statistics: {
                        totalMCPs: 0,
                        officialMCPs: 0,
                        verifiedMCPs: 0,
                        communityMCPs: 0,
                        totalDownloads: "0",
                        categories: {},
                        lastUpdated: new Date().toISOString()
                    }
                };
                await fs.writeJson(this.MCPS_FILE, initialData, { spaces: 2 });
            }
        } catch (error) {
            console.error('Error initializing MCP data:', error);
            throw error;
        }
    }

    // 生成MCP ID
    generateMCPId(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-mcp';
    }

    // 递增版本号
    incrementVersion(currentVersion) {
        try {
            // 移除 'v' 前缀并解析版本号
            const versionWithoutV = currentVersion.replace(/^v/i, '');
            const parts = versionWithoutV.split('.');
            
            // 确保有三个部分 (major.minor.patch)
            while (parts.length < 3) {
                parts.push('0');
            }
            
            // 递增补丁版本号
            const major = parseInt(parts[0]) || 0;
            const minor = parseInt(parts[1]) || 0;
            const patch = parseInt(parts[2]) || 0;
            
            return `v${major}.${minor}.${patch + 1}`;
        } catch (error) {
            console.error('Error incrementing version:', error);
            // 如果解析失败，返回默认版本
            return 'v1.0.1';
        }
    }

    // 获取所有MCP
    async getAllMCPs(filters = {}) {
        try {
            const data = await fs.readJson(this.MCPS_FILE);
            let mcps = data.mcps || [];

            // 过滤条件
            if (filters.status && filters.status !== 'all') {
                mcps = mcps.filter(mcp => mcp.status === filters.status);
            }

            if (filters.category && filters.category !== 'all') {
                mcps = mcps.filter(mcp => mcp.category === filters.category);
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                mcps = mcps.filter(mcp => 
                    mcp.name.toLowerCase().includes(searchTerm) ||
                    mcp.description.toLowerCase().includes(searchTerm) ||
                    mcp.author.toLowerCase().includes(searchTerm) ||
                    mcp.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            }

            return {
                mcps,
                total: mcps.length,
                statistics: data.statistics
            };
        } catch (error) {
            console.error('Error getting MCPs:', error);
            throw error;
        }
    }

    // 根据ID获取单个MCP
    async getMCPById(id) {
        try {
            const data = await fs.readJson(this.MCPS_FILE);
            const mcp = data.mcps.find(m => m.id === id);
            return mcp;
        } catch (error) {
            console.error('Error getting MCP by ID:', error);
            throw error;
        }
    }

    // 创建新MCP
    async createMCP(mcpData) {
        try {
            const data = await fs.readJson(this.MCPS_FILE);
            
            const newMCP = {
                id: this.generateMCPId(mcpData.name),
                name: mcpData.name,
                description: mcpData.description,
                category: mcpData.category,
                author: mcpData.author || 'Developer',
                version: mcpData.version || 'v1.0.0',
                downloads: "0",
                rating: 5.0,
                status: 'community',
                icon: mcpData.icon || '📦',
                iconBg: mcpData.iconBg || 'bg-gray-100',
                iconColor: mcpData.iconColor || 'text-gray-600',
                tags: mcpData.tags || [],
                lastUpdated: new Date().toISOString().split('T')[0],
                documentation: mcpData.documentation,
                endpoints: mcpData.endpoints || [],
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };

            data.mcps.push(newMCP);
            await this.updateStatistics(data);
            await fs.writeJson(this.MCPS_FILE, data, { spaces: 2 });
            
            return newMCP;
        } catch (error) {
            console.error('Error creating MCP:', error);
            throw error;
        }
    }

    // 更新MCP
    async updateMCP(id, updateData) {
        try {
            const data = await fs.readJson(this.MCPS_FILE);
            const mcpIndex = data.mcps.findIndex(m => m.id === id);
            
            if (mcpIndex === -1) {
                return null;
            }

            const currentDate = new Date().toISOString().split('T')[0];
            const existingMCP = data.mcps[mcpIndex];
            
            // 自动递增版本号（除非用户明确提供新版本号）
            const newVersion = updateData.version || this.incrementVersion(existingMCP.version);
            
            // 创建新的MCP对象，明确设置所有字段
            const updatedMCP = {
                id: existingMCP.id,
                name: updateData.name || existingMCP.name,
                description: updateData.description || existingMCP.description,
                category: updateData.category || existingMCP.category,
                author: updateData.author || existingMCP.author,
                version: newVersion,
                downloads: existingMCP.downloads,
                rating: existingMCP.rating,
                status: existingMCP.status,
                icon: existingMCP.icon,
                iconBg: existingMCP.iconBg,
                iconColor: existingMCP.iconColor,
                tags: updateData.tags || existingMCP.tags,
                lastUpdated: currentDate, // 强制使用当前日期
                documentation: updateData.documentation || existingMCP.documentation,
                endpoints: updateData.endpoints || existingMCP.endpoints,
                createdAt: existingMCP.createdAt,
                updatedAt: currentDate // 强制使用当前日期
            };
            
            data.mcps[mcpIndex] = updatedMCP;

            await this.updateStatistics(data);
            await fs.writeJson(this.MCPS_FILE, data, { spaces: 2 });
            
            return data.mcps[mcpIndex];
        } catch (error) {
            console.error('Error updating MCP:', error);
            throw error;
        }
    }

    // 删除MCP
    async deleteMCP(id) {
        try {
            const data = await fs.readJson(this.MCPS_FILE);
            const mcpIndex = data.mcps.findIndex(m => m.id === id);
            
            if (mcpIndex === -1) {
                return null;
            }

            const deletedMCP = data.mcps.splice(mcpIndex, 1)[0];
            await this.updateStatistics(data);
            await fs.writeJson(this.MCPS_FILE, data, { spaces: 2 });
            
            return deletedMCP;
        } catch (error) {
            console.error('Error deleting MCP:', error);
            throw error;
        }
    }

    // 更新统计信息
    async updateStatistics(data) {
        const mcps = data.mcps;
        const categories = {};
        
        mcps.forEach(mcp => {
            categories[mcp.category] = (categories[mcp.category] || 0) + 1;
        });

        const totalDownloads = mcps.reduce((sum, mcp) => {
            const downloads = parseInt(mcp.downloads) || 0;
            return sum + downloads;
        }, 0);

        data.statistics = {
            totalMCPs: mcps.length,
            officialMCPs: mcps.filter(m => m.status === 'official').length,
            verifiedMCPs: mcps.filter(m => m.status === 'verified').length,
            communityMCPs: mcps.filter(m => m.status === 'community').length,
            totalDownloads: totalDownloads.toString(),
            categories,
            lastUpdated: new Date().toISOString()
        };
    }

    // 获取MCP统计信息
    async getStatistics() {
        try {
            const data = await fs.readJson(this.MCPS_FILE);
            return data.statistics;
        } catch (error) {
            console.error('Error getting MCP statistics:', error);
            throw error;
        }
    }

    // 搜索MCP
    async searchMCPs(query, filters = {}) {
        try {
            const data = await fs.readJson(this.MCPS_FILE);
            let mcps = data.mcps || [];

            // 文本搜索
            if (query) {
                const searchTerm = query.toLowerCase();
                mcps = mcps.filter(mcp => 
                    mcp.name.toLowerCase().includes(searchTerm) ||
                    mcp.description.toLowerCase().includes(searchTerm) ||
                    mcp.author.toLowerCase().includes(searchTerm) ||
                    mcp.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                    mcp.documentation.toLowerCase().includes(searchTerm)
                );
            }

            // 应用其他过滤条件
            if (filters.category && filters.category !== 'all') {
                mcps = mcps.filter(mcp => mcp.category === filters.category);
            }

            if (filters.status && filters.status !== 'all') {
                mcps = mcps.filter(mcp => mcp.status === filters.status);
            }

            return {
                mcps,
                total: mcps.length,
                query,
                filters
            };
        } catch (error) {
            console.error('Error searching MCPs:', error);
            throw error;
        }
    }
}

module.exports = MCPService;