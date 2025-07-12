const fs = require('fs').promises;
const path = require('path');

class PromptTemplateService {
    constructor() {
        this.categoriesPath = path.join(__dirname, '../data/prompt-categories.json');
        this.templatesPath = path.join(__dirname, '../data/prompt-templates.json');
    }

    // 分类管理
    async getCategories() {
        try {
            const data = await fs.readFile(this.categoriesPath, 'utf8');
            const categories = JSON.parse(data);
            return Object.values(categories);
        } catch (error) {
            console.error('Error reading categories:', error);
            return [];
        }
    }

    async getCategoryById(id) {
        try {
            const data = await fs.readFile(this.categoriesPath, 'utf8');
            const categories = JSON.parse(data);
            return categories[id] || null;
        } catch (error) {
            console.error('Error reading category:', error);
            return null;
        }
    }

    async createCategory(categoryData) {
        try {
            const data = await fs.readFile(this.categoriesPath, 'utf8');
            const categories = JSON.parse(data);
            
            const id = categoryData.id || this.generateId();
            const newCategory = {
                id,
                name: categoryData.name,
                description: categoryData.description || '',
                icon: categoryData.icon || '📁',
                color: categoryData.color || '#6B7280',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            categories[id] = newCategory;
            await fs.writeFile(this.categoriesPath, JSON.stringify(categories, null, 2));
            return newCategory;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    async updateCategory(id, updateData) {
        try {
            const data = await fs.readFile(this.categoriesPath, 'utf8');
            const categories = JSON.parse(data);
            
            if (!categories[id]) {
                throw new Error('Category not found');
            }

            categories[id] = {
                ...categories[id],
                ...updateData,
                updated_at: new Date().toISOString()
            };

            await fs.writeFile(this.categoriesPath, JSON.stringify(categories, null, 2));
            return categories[id];
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            const data = await fs.readFile(this.categoriesPath, 'utf8');
            const categories = JSON.parse(data);
            
            if (!categories[id]) {
                throw new Error('Category not found');
            }

            delete categories[id];
            await fs.writeFile(this.categoriesPath, JSON.stringify(categories, null, 2));
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    // 模板管理
    async getTemplates(categoryId = null, search = null) {
        try {
            const data = await fs.readFile(this.templatesPath, 'utf8');
            const templates = JSON.parse(data);
            let templatesList = Object.values(templates);

            // 按分类过滤
            if (categoryId) {
                templatesList = templatesList.filter(t => t.category === categoryId);
            }

            // 搜索过滤
            if (search) {
                const searchLower = search.toLowerCase();
                templatesList = templatesList.filter(t => 
                    t.name.toLowerCase().includes(searchLower) ||
                    t.description.toLowerCase().includes(searchLower) ||
                    t.tags.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }

            // 按更新时间排序
            templatesList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            
            return templatesList;
        } catch (error) {
            console.error('Error reading templates:', error);
            return [];
        }
    }

    async getTemplateById(id) {
        try {
            const data = await fs.readFile(this.templatesPath, 'utf8');
            const templates = JSON.parse(data);
            return templates[id] || null;
        } catch (error) {
            console.error('Error reading template:', error);
            return null;
        }
    }

    async createTemplate(templateData) {
        try {
            const data = await fs.readFile(this.templatesPath, 'utf8');
            const templates = JSON.parse(data);
            
            const id = templateData.id || this.generateId();
            const newTemplate = {
                id,
                name: templateData.name,
                description: templateData.description || '',
                category: templateData.category,
                content: templateData.content || '',
                variables: templateData.variables || [],
                tags: templateData.tags || [],
                version: templateData.version || 'v1.0.0',
                status: templateData.status || 'draft',
                usage_count: 0,
                author: templateData.author || 'Unknown',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            templates[id] = newTemplate;
            await fs.writeFile(this.templatesPath, JSON.stringify(templates, null, 2));
            return newTemplate;
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    }

    async updateTemplate(id, updateData) {
        try {
            const data = await fs.readFile(this.templatesPath, 'utf8');
            const templates = JSON.parse(data);
            
            if (!templates[id]) {
                throw new Error('Template not found');
            }

            templates[id] = {
                ...templates[id],
                ...updateData,
                updated_at: new Date().toISOString()
            };

            await fs.writeFile(this.templatesPath, JSON.stringify(templates, null, 2));
            return templates[id];
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    }

    async deleteTemplate(id) {
        try {
            const data = await fs.readFile(this.templatesPath, 'utf8');
            const templates = JSON.parse(data);
            
            if (!templates[id]) {
                throw new Error('Template not found');
            }

            delete templates[id];
            await fs.writeFile(this.templatesPath, JSON.stringify(templates, null, 2));
            return true;
        } catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    }

    async incrementUsageCount(id) {
        try {
            const template = await this.getTemplateById(id);
            if (!template) {
                throw new Error('Template not found');
            }

            await this.updateTemplate(id, {
                usage_count: template.usage_count + 1
            });

            return true;
        } catch (error) {
            console.error('Error incrementing usage count:', error);
            throw error;
        }
    }

    // 工具方法
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 统计方法
    async getStats() {
        try {
            const categories = await this.getCategories();
            const templates = await this.getTemplates();

            const stats = {
                totalCategories: categories.length,
                totalTemplates: templates.length,
                publishedTemplates: templates.filter(t => t.status === 'published').length,
                draftTemplates: templates.filter(t => t.status === 'draft').length,
                testingTemplates: templates.filter(t => t.status === 'testing').length,
                totalUsage: templates.reduce((sum, t) => sum + (t.usage_count || 0), 0),
                categoryStats: {}
            };

            // 每个分类的统计
            categories.forEach(category => {
                const categoryTemplates = templates.filter(t => t.category === category.id);
                stats.categoryStats[category.id] = {
                    name: category.name,
                    count: categoryTemplates.length,
                    usage: categoryTemplates.reduce((sum, t) => sum + (t.usage_count || 0), 0)
                };
            });

            return stats;
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }
}

module.exports = PromptTemplateService;