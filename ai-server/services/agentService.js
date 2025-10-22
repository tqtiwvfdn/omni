const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const Joi = require('joi');

class AgentService {
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.agentsFile = path.join(dataDir, 'agents.json');
        this.agentVersionsFile = path.join(dataDir, 'agent-versions.json');
    }

    /**
     * 初始化智能体数据文件
     */
    async initializeAgentData() {
        try {
            // 确保agents.json文件存在
            if (!await fs.pathExists(this.agentsFile)) {
                await fs.writeJson(this.agentsFile, {}, { spaces: 2 });
            }

            // 确保agent-versions.json文件存在
            if (!await fs.pathExists(this.agentVersionsFile)) {
                await fs.writeJson(this.agentVersionsFile, {}, { spaces: 2 });
            }

            console.log('Agent data files initialized successfully');
        } catch (error) {
            console.error('Error initializing agent data:', error);
            throw error;
        }
    }

    /**
     * 获取所有智能体
     * @param {Object} filters - 过滤条件
     * @returns {Promise<Array>} 智能体列表
     */
    async getAgents(filters = {}) {
        try {
            const { appId, search, status } = filters;
            const agentsData = await fs.readJson(this.agentsFile);
            let agents = [];

            // 获取所有智能体
            Object.keys(agentsData).forEach(agentId => {
                const agent = agentsData[agentId];
                agent.id = agentId; // 添加ID字段
                agents.push(agent);
            });

            // 根据appId过滤
            if (appId) {
                agents = agents.filter(agent => agent.appId === appId);
            }

            // 根据状态过滤
            if (status) {
                agents = agents.filter(agent => agent.status === status);
            }

            // 搜索功能
            if (search) {
                const searchTerm = search.toLowerCase();
                agents = agents.filter(agent => 
                    agent.name.toLowerCase().includes(searchTerm) ||
                    agent.description.toLowerCase().includes(searchTerm) ||
                    agent.id.toLowerCase().includes(searchTerm)
                );
            }

            return agents;
        } catch (error) {
            console.error('Error getting agents:', error);
            throw error;
        }
    }

    /**
     * 根据ID获取智能体
     * @param {string} agentId - 智能体ID
     * @returns {Promise<Object|null>} 智能体对象或null
     */
    async getAgentById(agentId) {
        try {
            const agentsData = await fs.readJson(this.agentsFile);
            const agent = agentsData[agentId];
            
            if (!agent) {
                return null;
            }

            return { ...agent, id: agentId };
        } catch (error) {
            console.error(`Error getting agent with ID ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 创建新智能体
     * @param {Object} agentData - 智能体数据
     * @returns {Promise<Object>} 创建的智能体
     */
    async createAgent(agentData) {
        try {
            // 验证数据
            const { error, value } = this.getAgentValidationSchema().validate(agentData);
            if (error) {
                throw new Error(error.details[0].message);
            }

            const agentsData = await fs.readJson(this.agentsFile);
            
            // 生成智能体ID
            const agentId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // 创建智能体对象
            const newAgent = {
                ...agentData,
                name: value.name,
                description: value.description,
                appId: value.appId,
                status: 'development',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                currentVersionId: null,
                versionsCount: 0
            };

            // 保存智能体
            agentsData[agentId] = newAgent;
            await fs.writeJson(this.agentsFile, agentsData, { spaces: 2 });

            // 初始化版本文件中的智能体记录
            const versionsData = await fs.readJson(this.agentVersionsFile);
            versionsData[agentId] = [];
            await fs.writeJson(this.agentVersionsFile, versionsData, { spaces: 2 });

            return { ...newAgent, id: agentId };
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    }

    /**
     * 更新智能体
     * @param {string} agentId - 智能体ID
     * @param {Object} updateData - 更新数据
     * @returns {Promise<Object|null>} 更新后的智能体或null
     */
    async updateAgent(agentId, updateData) {
        try {
            const agentsData = await fs.readJson(this.agentsFile);
            
            if (!agentsData[agentId]) {
                return null;
            }

            // 验证数据
            const { error, value } = this.getUpdateAgentValidationSchema().validate(updateData);
            if (error) {
                throw new Error(error.details[0].message);
            }

            // 更新智能体
            agentsData[agentId] = {
                ...agentsData[agentId],
                ...value,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            await fs.writeJson(this.agentsFile, agentsData, { spaces: 2 });

            return { ...agentsData[agentId], id: agentId };
        } catch (error) {
            console.error(`Error updating agent with ID ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 删除智能体
     * @param {string} agentId - 智能体ID
     * @returns {Promise<Object|null>} 删除的智能体或null
     */
    async deleteAgent(agentId) {
        try {
            const agentsData = await fs.readJson(this.agentsFile);
            
            if (!agentsData[agentId]) {
                return null;
            }

            const deletedAgent = { ...agentsData[agentId], id: agentId };
            delete agentsData[agentId];
            await fs.writeJson(this.agentsFile, agentsData, { spaces: 2 });

            // 同时删除所有版本
            const versionsData = await fs.readJson(this.agentVersionsFile);
            if (versionsData[agentId]) {
                delete versionsData[agentId];
                await fs.writeJson(this.agentVersionsFile, versionsData, { spaces: 2 });
            }

            return deletedAgent;
        } catch (error) {
            console.error(`Error deleting agent with ID ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 获取智能体的所有版本
     * @param {string} agentId - 智能体ID
     * @returns {Promise<Array>} 版本列表
     */
    async getAgentVersions(agentId) {
        try {
            const versionsData = await fs.readJson(this.agentVersionsFile);
            return versionsData[agentId] || [];
        } catch (error) {
            console.error(`Error getting versions for agent ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 获取智能体的特定版本
     * @param {string} agentId - 智能体ID
     * @param {string} versionId - 版本ID
     * @returns {Promise<Object|null>} 版本对象或null
     */
    async getAgentVersion(agentId, versionId) {
        try {
            const versionsData = await fs.readJson(this.agentVersionsFile);
            const versions = versionsData[agentId] || [];
            return versions.find(v => v.id === versionId) || null;
        } catch (error) {
            console.error(`Error getting version ${versionId} for agent ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 创建智能体新版本
     * @param {string} agentId - 智能体ID
     * @param {Object} versionData - 版本数据
     * @param {boolean} isDraft - 是否为草稿版本
     * @returns {Promise<Object>} 创建的版本
     */
    async createAgentVersion(agentId, versionData, isDraft = false) {
        try {
            // 验证智能体是否存在
            const agentsData = await fs.readJson(this.agentsFile);
            if (!agentsData[agentId]) {
                throw new Error('智能体不存在');
            }

            // 验证版本数据
            const { error, value } = this.getVersionValidationSchema().validate(versionData);
            if (error) {
                throw new Error(error.details[0].message);
            }

            // 读取版本数据
            const versionsData = await fs.readJson(this.agentVersionsFile);
            if (!versionsData[agentId]) {
                versionsData[agentId] = [];
            }

            // 生成版本ID
            const versionId = `v${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // 创建版本对象
            const newVersion = {
                id: versionId,
                name: value.name,
                description: value.description,
                promptTemplate: value.promptTemplate,
                variables: value.variables || [],
                settings: value.settings || {},
                version: `v${agentsData[agentId].versionsCount + 1}`,
                isDraft,
                status: isDraft ? 'draft' : 'published',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                createdBy: value.createdBy || 'system',
                metrics: {
                    usageCount: 0,
                    avgResponseTime: 0,
                    qualityScore: 0
                }
            };

            // 添加版本
            versionsData[agentId].unshift(newVersion); // 新版本放在前面
            await fs.writeJson(this.agentVersionsFile, versionsData, { spaces: 2 });

            // 更新智能体的版本计数和当前版本
            if (!isDraft) {
                agentsData[agentId] = {
                    ...agentsData[agentId],
                    versionsCount: agentsData[agentId].versionsCount + 1,
                    currentVersionId: versionId,
                    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                };
                await fs.writeJson(this.agentsFile, agentsData, { spaces: 2 });
            }

            return newVersion;
        } catch (error) {
            console.error(`Error creating version for agent ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 更新智能体版本
     * @param {string} agentId - 智能体ID
     * @param {string} versionId - 版本ID
     * @param {Object} updateData - 更新数据
     * @returns {Promise<Object|null>} 更新后的版本或null
     */
    async updateAgentVersion(agentId, versionId, updateData) {
        try {
            const versionsData = await fs.readJson(this.agentVersionsFile);
            const versions = versionsData[agentId] || [];
            const versionIndex = versions.findIndex(v => v.id === versionId);

            if (versionIndex === -1) {
                return null;
            }

            // 验证更新数据
            const { error, value } = this.getUpdateVersionValidationSchema().validate(updateData);
            if (error) {
                throw new Error(error.details[0].message);
            }

            // 更新版本
            versions[versionIndex] = {
                ...versions[versionIndex],
                ...value,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            versionsData[agentId] = versions;
            await fs.writeJson(this.agentVersionsFile, versionsData, { spaces: 2 });

            return versions[versionIndex];
        } catch (error) {
            console.error(`Error updating version ${versionId} for agent ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 删除智能体版本
     * @param {string} agentId - 智能体ID
     * @param {string} versionId - 版本ID
     * @returns {Promise<Object|null>} 删除的版本或null
     */
    async deleteAgentVersion(agentId, versionId) {
        try {
            const versionsData = await fs.readJson(this.agentVersionsFile);
            const versions = versionsData[agentId] || [];
            const versionIndex = versions.findIndex(v => v.id === versionId);

            if (versionIndex === -1) {
                return null;
            }

            const deletedVersion = versions[versionIndex];
            versions.splice(versionIndex, 1);
            versionsData[agentId] = versions;
            await fs.writeJson(this.agentVersionsFile, versionsData, { spaces: 2 });

            // 如果删除的是当前发布版本，更新智能体信息
            if (!deletedVersion.isDraft) {
                const agentsData = await fs.readJson(this.agentsFile);
                if (agentsData[agentId] && agentsData[agentId].currentVersionId === versionId) {
                    // 找到下一个已发布的版本
                    const nextPublishedVersion = versions.find(v => !v.isDraft);
                    agentsData[agentId] = {
                        ...agentsData[agentId],
                        currentVersionId: nextPublishedVersion?.id || null,
                        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                    };
                    await fs.writeJson(this.agentsFile, agentsData, { spaces: 2 });
                }
            }

            return deletedVersion;
        } catch (error) {
            console.error(`Error deleting version ${versionId} for agent ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 发布智能体版本
     * @param {string} agentId - 智能体ID
     * @param {string} versionId - 版本ID
     * @returns {Promise<Object|null>} 发布后的版本或null
     */
    async publishAgentVersion(agentId, versionId) {
        try {
            const versionsData = await fs.readJson(this.agentVersionsFile);
            const versions = versionsData[agentId] || [];
            const versionIndex = versions.findIndex(v => v.id === versionId);

            if (versionIndex === -1) {
                return null;
            }

            const version = versions[versionIndex];
            
            // 如果已经是发布版本，直接返回
            if (!version.isDraft) {
                return version;
            }

            // 更新版本状态
            version.isDraft = false;
            version.status = 'published';
            version.publishedAt = moment().format('YYYY-MM-DD HH:mm:ss');

            versionsData[agentId] = versions;
            await fs.writeJson(this.agentVersionsFile, versionsData, { spaces: 2 });

            // 更新智能体信息
            const agentsData = await fs.readJson(this.agentsFile);
            agentsData[agentId] = {
                ...agentsData[agentId],
                versionsCount: agentsData[agentId].versionsCount + 1,
                currentVersionId: versionId,
                updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            await fs.writeJson(this.agentsFile, agentsData, { spaces: 2 });

            return version;
        } catch (error) {
            console.error(`Error publishing version ${versionId} for agent ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * 获取智能体验证模式
     * @returns {Joi.ObjectSchema} 验证模式
     */
    getAgentValidationSchema() {
        return Joi.object({
            name: Joi.string().required().min(1).max(100),
            description: Joi.string().optional().min(0).max(500),
            appId: Joi.string().required(),
            category: Joi.string().optional().min(1).max(100),
            promptContent: Joi.string().required().min(1).max(5000),
            promptTemplateId: Joi.string().optional().min(1).max(100),
            status: Joi.string().optional().min(1).max(100),
            version:Joi.string().optional().min(1).max(100)
        });
    }

    /**
     * 获取更新智能体验证模式
     * @returns {Joi.ObjectSchema} 验证模式
     */
    getUpdateAgentValidationSchema() {
        return Joi.object({
            name: Joi.string().required().min(1).max(100),
            description: Joi.string().optional().min(0).max(500),
            appId: Joi.string().required(),
            category: Joi.string().optional().min(1).max(100),
            promptContent: Joi.string().required().min(1).max(5000),
            promptTemplateId: Joi.string().optional().min(1).max(100),
            status: Joi.string().optional().min(1).max(100),
            version:Joi.string().optional().min(1).max(100)
        });
    }

    /**
     * 获取版本验证模式
     * @returns {Joi.ObjectSchema} 验证模式
     */
    getVersionValidationSchema() {
        return Joi.object({
            name: Joi.string().required().min(1).max(100),
            description: Joi.string().optional().min(0).max(500),
            promptTemplate: Joi.string().required(),
            variables: Joi.array().items(Joi.object({
                name: Joi.string().required(),
                description: Joi.string(),
                defaultValue: Joi.string()
            })),
            createdAt:Joi.string(),
            updatedAt:Joi.string(),
            status:Joi.string(),
            settings: Joi.object(),
            createdBy: Joi.string(),
            versionName:Joi.string()
        });
    }

    /**
     * 获取更新版本验证模式
     * @returns {Joi.ObjectSchema} 验证模式
     */
    getUpdateVersionValidationSchema() {
        return Joi.object({
            name: Joi.string().min(1).max(100),
            description: Joi.string().min(1).max(500),
            promptTemplate: Joi.string(),
            variables: Joi.array().items(Joi.object({
                name: Joi.string().required(),
                description: Joi.string(),
                defaultValue: Joi.string()
            })),
            settings: Joi.object()
        });
    }
}

module.exports = AgentService;