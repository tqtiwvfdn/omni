const fs = require('fs');
const path = require('path');

class AppMCPService {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/appMcp.json');
        this.init();
    }

    init() {
        try {
            if (!fs.existsSync(this.dataPath)) {
                fs.writeFileSync(this.dataPath, JSON.stringify({ data: {} }, null, 2));
            }
        } catch (error) {
            console.error('初始化App MCP数据文件失败:', error);
        }
    }

    generateId() {
        return `app-mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    incrementVersion(version = 'v1.0.0') {
        // 简单的版本号递增逻辑
        const parts = version.replace('v', '').split('.');
        parts[2] = parseInt(parts[2]) + 1;
        return `v${parts.join('.')}`;
    }

    async getAllMcps(appId) {
        try {
            const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            const appData = data.data[appId] || [];
            return { success: true, data: appData };
        } catch (error) {
            console.error('获取App MCP列表失败:', error);
            return { success: false, error: error.message };
        }
    }

    async getMcpById(appId, mcpId) {
        try {
            const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            const appData = data.data[appId] || [];
            const mcp = appData.find(m => m.id === mcpId);
            
            if (mcp) {
                return { success: true, data: mcp };
            } else {
                return { success: false, error: 'MCP不存在' };
            }
        } catch (error) {
            console.error('获取MCP详情失败:', error);
            return { success: false, error: error.message };
        }
    }

    async createMcp(appId, mcpData) {
        try {
            let data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            
            if (!data.data[appId]) {
                data.data[appId] = [];
            }

            const newMcp = {
                id: this.generateId(),
                ...mcpData,
                version: mcpData.version || 'v1.0.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 验证数据
            const validation = this.validateMcpData(newMcp);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            data.data[appId].push(newMcp);
            const result = fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
            
            console.log(result);

            return { success: true, data: newMcp };
        } catch (error) {
            console.error('创建MCP失败:', error);
            return { success: false, error: error.message };
        }
    }

    async updateMcp(appId, mcpId, mcpData) {
        try {
            let data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            
            if (!data.data[appId]) {
                return { success: false, error: '应用数据不存在' };
            }

            const mcpIndex = data.data[appId].findIndex(m => m.id === mcpId);
            if (mcpIndex === -1) {
                return { success: false, error: 'MCP不存在' };
            }

            const existingMcp = data.data[appId][mcpIndex];
            const updatedMcp = {
                ...existingMcp,
                ...mcpData,
                id: existingMcp.id, // 保持ID不变
                version: mcpData.version || this.incrementVersion(existingMcp.version),
                updatedAt: new Date().toISOString()
            };

            // 验证数据
            const validation = this.validateMcpData(updatedMcp);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            data.data[appId][mcpIndex] = updatedMcp;
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
            
            return { success: true, data: updatedMcp };
        } catch (error) {
            console.error('更新MCP失败:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteMcp(appId, mcpId) {
        try {
            let data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            
            if (!data.data[appId]) {
                return { success: false, error: '应用数据不存在' };
            }

            const mcpIndex = data.data[appId].findIndex(m => m.id === mcpId);
            if (mcpIndex === -1) {
                return { success: false, error: 'MCP不存在' };
            }

            data.data[appId].splice(mcpIndex, 1);
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
            
            return { success: true, data: { message: '删除成功' } };
        } catch (error) {
            console.error('删除MCP失败:', error);
            return { success: false, error: error.message };
        }
    }

    validateMcpData(mcpData) {
        // 基本验证
        // if (!mcpData.name || mcpData.name.trim() === '') {
        //     return { valid: false, error: 'MCP名称不能为空' };
        // }
        
        // if (!mcpData.description || mcpData.description.trim() === '') {
        //     return { valid: false, error: 'MCP描述不能为空' };
        // }
        
        // if (!mcpData.category || mcpData.category.trim() === '') {
        //     return { valid: false, error: 'MCP分类不能为空' };
        // }
        
        // if (!mcpData.documentation || mcpData.documentation.trim() === '') {
        //     return { valid: false, error: 'MCP文档不能为空' };
        // }

        // // 验证endpoints
        // if (mcpData.endpoints && Array.isArray(mcpData.endpoints)) {
        //     for (let i = 0; i < mcpData.endpoints.length; i++) {
        //         const endpoint = mcpData.endpoints[i];
        //         if (!endpoint.name || !endpoint.method || !endpoint.path) {
        //             return { valid: false, error: `接口${i + 1}的名称、方法和路径不能为空` };
        //         }
        //     }
        // }

        return { valid: true };
    }

    // 搜索和筛选功能
    async searchMcps(appId, filters) {
        try {
            const result = await this.getAllMcps(appId);
            if (!result.success) {
                return result;
            }

            let filteredMcps = result.data;

            // 搜索
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredMcps = filteredMcps.filter(mcp => 
                    mcp.name.toLowerCase().includes(searchTerm) ||
                    mcp.description.toLowerCase().includes(searchTerm) ||
                    (mcp.tags && mcp.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
            }

            // 分类筛选
            if (filters.category && filters.category !== 'all') {
                filteredMcps = filteredMcps.filter(mcp => mcp.category === filters.category);
            }

            // 排序
            if (filters.sortBy === 'createdAt') {
                filteredMcps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (filters.sortBy === 'updatedAt') {
                filteredMcps.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            }

            return { success: true, data: filteredMcps };
        } catch (error) {
            console.error('搜索MCP失败:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new AppMCPService();