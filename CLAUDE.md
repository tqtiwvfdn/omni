# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概览

赞同智言银行 Omni 平台是一个企业级智能助手应用开发平台，支持多应用实例的全生命周期管理。平台采用分层架构设计，包含登陆页、开发门户、应用工作台、生产门户四个核心层级。

### 核心组件
- **ai-server**: 后端 Node.js/Express 服务器，提供应用管理和统计的 REST API
- **前端模块**: 各种基于 HTML 的智能助手应用界面和管理工具
- **开发工具**: 组件库、LUI 编辑器、MCP 服务

## 技术架构

### 分层架构设计
```
登陆页 (Landing Page) → 开发门户 (Dev Portal) → 应用工作台 (App Workspace) → 生产门户 (Production Portal)
```

1. **登陆页**: 产品介绍和入口选择 /index.html
2. **开发门户**: 平台级功能管理（工作台、应用管理、模型中心） /omni/index.html
3. **应用工作台（开发侧）**: 单应用开发侧 /omni/app-workspace-dev.html
4. **生产门户**: 上线应用管理（监控中心、安全护盾、风控监控）
5. **应用工作台（运维运营侧）**: 单应用运维运营 /omni/app-workspace-ops.html

### 后端服务

**AI 服务器 (ai-server/)**
- 使用 Express.js 和 JSON 文件存储的主要后端服务
- 通过 PM2 管理，进程 ID 为 0
- 提供应用管理、用户数据和统计的 API
- 服务模块：MCPService、LUIService、ComponentService、PromptTemplateService
- 数据存储在 `ai-server/data/` 中的 JSON 文件

## 访问方式

### 本地开发环境
- 本地访问：http://zhiyan-dev.awebide.com/omni/
- nginx 代理位置：C:\Users\Administrator\Documents\nginx-1.29.0

### 公网环境
- 公网访问：http://kinzueng.awebide.com

## 常用开发命令

### AI 服务器
```bash
# 重启服务（通过 PM2 管理，进程 ID 为 0）
pm2 restart 0

# 查看服务状态
pm2 status

# 查看日志
pm2 logs 0

# 停止服务
pm2 stop 0

# 启动服务
pm2 start 0
```

## 核心功能模块

1. 全局可以从localStorage.getItem('token')获取token，在请求的时候带上，如：

fetch(api, {
"headers": {
  "authorization": `bearer ${localStorage.getItem('token')}`
});

2. 租户ID可以从localStorage.getItem('tenantId')获取


### 开发门户功能
- **工作台**: 常用应用卡片、新建应用入口、应用统计仪表板
- **应用管理**: 应用列表和全生命周期管理
- **模型中心**: 模型管理(LLM/NLP/ASR/TTS)、模型评估、模型微调、数据标注
- **MCP 市场**: 第三方服务集成和工具管理
- **LUI 市场**: 界面组件库和交互模板
- **提示词模版**: 提示词模板

### 应用工作台 - 开发侧

可以从window.top.appMetadata获取应用元数据

- **知识库 RAG**: 文档管理、问答对管理、向量检索配置
- **智能体编排**: Agent 配置管理、多智能体评测
- **MCP服务集成**: 外部工具接入、API服务配置
- **业务开发**: 原子意图配置、业务流程编排
- **LUI 卡片开发**: 界面组件开发、交互逻辑
- **助手运行配置**: 助手Logo、预设问题、主题样式
- **权限设置**: 开发、测试、部署权限控制
- **应用部署**: 环境管理(DEV/SIT/UAT)、版本发布

### 生产门户功能
- **监控中心**: 服务监控、资源监控、日志监控、告警管理
- **安全护盾**: 安全日志、提示词护盾、敏感词管理
- **风控监控**: 反诈配置、攻击防护、交易风控、反诈监控

### 应用工作台 - 运营侧
- **用户价值分析**: 问答分析、用户反馈、满意度分析
- **业务运营**: 使用指标、问答效能、操作记录、AI表现、ROI分析
- **决策洞察**: 趋势分析、市场洞察、预测模型

## API 结构
- 基础URL：`http://localhost:3000`
- 健康检查：`/health`
- 应用API：`/api/applications`
- 统计API：`/api/stats`

## 数据模型

### 应用模型
```json
{
  "id": 1,
  "appId": "unique-app-id",
  "name": "应用名称",
  "description": "应用描述",
  "status": "development|testing|production|planned",
  "version": "v1.0.0",
  "category": "核心服务|内容生成|数据处理",
  "developer": "开发团队",
  "features": ["功能1", "功能2"],
  "workspace": "/path/to/workspace",
  "gitRepo": "git-url",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 页面路径映射

### 开发相关
- 模型管理: `/development/model-center/model-management`
- 模型评估: `/development/model-center/model-evaluation`
- 数据标注: `/development/model-optimization/data-annotation`
- MCP市场: `/development/mcp/mcp-market`
- 组件开发: `/development/component-dev/card-dev`
- 知识库管理: `/development/data-process/knowledge`
- Agent管理: `/development/ability-center/agent-management`

### 运营相关
- 服务监控: `/maintenance/operation-monitoring/service-monitor`
- 资源监控: `/maintenance/operation-monitoring/resource-monitor`
- 告警管理: `/maintenance/operation-monitoring/alert-management`
- 安全管理: `/maintenance/security-management/index`
- 问答分析: `/operations/user-experience/qa-analysis`
- 业务指标: `/operations/business-operations/usage-metrics`

## 文件组织

### 核心目录
- `omni/`: 主要业务模块和工作台界面
- `console/`: 管理控制台界面
- `development/`: 开发工具和编辑器
- `operations/`: 业务运营和分析仪表板
- `maintenance/`: 系统监控和安全管理
- `components/`: 可复用的 UI 组件

### 静态资源
- `assets/`: 用户头像和图片
- `script/`: JavaScript 库（highlight.js、mermaid.js、pptxgen 等）
- `style/`: CSS 文件，包括 Tailwind 和 Prism 主题

## 开发注意事项

- 平台面向银行场景，专注智能助手应用开发
- 支持微前端架构，模块独立部署
- 使用中文界面和应用名称
- 开发环境使用 JSON 文件存储，生产环境考虑数据库迁移
- 服务通过 PM2 进程管理器管理
- 通过 nginx 代理实现域名访问和负载均衡
- 支持多租户和RBAC权限控制
- 提供完整的全生命周期管理（开发-测试-部署-运营）




## 前端编码规范
为了实现界面统一和代码清晰简洁，确保平台的可维护性和一致性，制定以下前端编码规范：

### 1. 前端样式规范
#### 1.1 样式框架限制
- **只能使用 TailwindCSS 和 `/style/common.css` 的公共样式**
- **禁止在页面内写 `<style>` 标签和行内样式**
- 自定义样式必须通过CSS变量和自定义类名实现

#### 1.2 CSS变量系统
所有自定义样式必须使用CSS变量，支持亮色和暗色两套主题：

```css
/* 默认主题（亮色主题） */
:root, .theme-light {
    …
}

/* 暗色主题 */
.theme-gray {
    …
}
```

##### 主题感知样式
```css
/* 使用主题变量 */
.custom-card {
    background: var(--theme-bg);
    color: var(--theme-text);
    border: 1px solid var(--theme-border);
    font-family: var(--theme-font-family);
}

/* 主题特定样式 */
.theme-light .special-element {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-gray .special-element {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

#### 1.3 标准化组件样式
每个页面都复用这些标准化组件样式，如果有新增组件则在common.css添加：


```css
/* 左侧菜单 */
.menu{
  …
}
/* 表格 */
.doc-table{
    …
}
/* 按钮 */
.action-btn {
    …
}

/* 表单元素 */
.form-input {
  …
}

/* 特效 */
.liquid-glass {
    …
}
```

### 2. JavaScript架构规范

#### 2.1 页面管理器模式
每个页面必须使用一个主管理器对象，并暴露到window下：

```javascript
// 使用原型模式创建页面管理器
function PageManager() {
    …
    
    // 初始化
    this.init();
}

PageManager.prototype={
  init:function(){},


  initializePage : async function() {
      // 页面初始化逻辑
      await this.loadInitialData();
  },
  initEventListeners : function() {
    // 事件监听器初始化
    var self = this;
    document.getElementById('refresh-btn').addEventListener('click', function() {
        self.loadData();
    });
  },
  loadData : async function() {
    try {
        const result = await this.apiCall('/api/data');
        this.currentData = result.data;
        this.renderData();
    } catch (error) {
        this.handleError(error);
    }
  },
  renderData : function() {
    // 渲染逻辑
  },
  handleError : function(error) {
    console.error('操作失败:', error);
    this.showInfoDialog('操作失败，请重试', '错误');
  },
  // 全局暴露实例
  const pageManager = new PageManager();
  window.pageManager = pageManager; // 用于调试和外部访问
  …
};
```

#### 2.2 选择器规范
**只能使用以下选择器：**
- `document.getElementById('element-id')`
- `document.querySelector('[data-role="button"]')`
- `element.querySelector('#child-id')`

**禁止使用：**
- 类选择器：`.class-name`
- 属性选择器（除data-role外）：`[type="text"]`
- 后代选择器：`div span`
- 伪类选择器：`:hover`, `:active`

#### 2.3 事件处理规范

##### 事件委托处理
```javascript
initEventListeners() {
    document.getElementById('container').addEventListener('click', (e) => {
        const target = e.target;
        if (target.getAttribute('data-role') === 'delete-btn') {
            this.handleDelete(target.dataset.id);
        }
    });
}
```

#### 2.4 方法命名规范

##### 业务方法
- 加载数据：`load{Entity}()` - `loadDocuments()`, `loadLibraries()`
- 渲染UI：`render{Component}()` - `renderDocuments()`, `renderPagination()`
- 显示模态框：`show{Modal}Modal()` - `showLibraryModal()`, `showUploadModal()`
- 执行操作：`execute{Action}()` - `executeDocumentSlicing()`, `executeDeleteLibrary()`

##### 事件处理方法
- 处理点击：`handle{Action}()` - `handleFileUpload()`, `handleSearch()`
- 切换状态：`toggle{State}()` - `toggleSubmenu()`, `toggleSelectAll()`

#### 2.5 异步处理规范

##### API调用模式
```javascript
// 原型方法实现异步API调用
PageManager.prototype.loadData = async function() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            this.showInfoDialog('认证令牌不存在', '认证错误');
            return;
        }

        // 设置加载状态
        this.setLoading(true);

        const response = await fetch('/api/endpoint', {
            method: 'GET',
            headers: {
                'authorization': `bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (result.code === '000000') {
            this.data = result.data;
            this.updatePagination(result.data);
            this.renderData();
        } else {
            console.error('API调用失败:', result.message);
            this.showInfoDialog('加载失败: ' + result.message, '错误');
        }
    } catch (error) {
        console.error('网络错误:', error);
        this.showInfoDialog('网络错误，请重试', '错误');
    } finally {
        this.setLoading(false);
    }
};

// 加载状态管理
PageManager.prototype.setLoading = function(loading) {
    this.isLoading = loading;
    this.updateLoadingUI();
};

PageManager.prototype.updateLoadingUI = function() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.style.display = this.isLoading ? 'block' : 'none';
    }
};
```

### 3. UI组件规范

#### 3.1 模态框规范

##### 结构标准
```html
<div class="modal-overlay">
    <div class="modal-container">
        <div class="modal-header">
            <h2>标题</h2>
            <button class="modal-close-btn">关闭</button>
        </div>
        <div class="modal-body">
            <!-- 内容 -->
        </div>
        <div class="modal-footer">
            <button class="action-btn secondary">取消</button>
            <button class="action-btn primary">确认</button>
        </div>
    </div>
</div>
```

#### 多层模态框z-index管理
```css
.modal-overlay { z-index: 10000; }
.modal-overlay.second-layer { z-index: 10001; }
.modal-overlay.third-layer { z-index: 10002; }
```

#### 3.2 表格规范

##### 标准表格结构
```html
<div class="table-container">
    <div class="doc-table liquid-glass">
        <table>
            <thead>
                <tr>
                    <th class="text-left">
                        <div class="flex items-center">
                            <input type="checkbox" id="select-all" class="mr-2">
                            文件名
                        </div>
                    </th>
                    <!-- 其他列 -->
                </tr>
            </thead>
            <tbody id="table-body">
                <!-- 动态内容 -->
            </tbody>
        </table>
    </div>
</div>
```

#### 3.3 分页组件规范

##### 分页信息显示
```javascript
renderPagination() {
    const startRecord = (this.currentPage - 1) * this.pageSize + 1;
    const endRecord = Math.min(this.currentPage * this.pageSize, this.totalElements);
    
    const info = `第 ${startRecord}-${endRecord} 条，共 ${this.totalElements} 条记录，第 ${this.currentPage}/${this.totalPages} 页`;
}
```

#### 3.4 通知系统规范

##### 消息类型
```javascript
showNotification(message, type = 'info') {
    // type: 'success', 'error', 'warning', 'info'
    const icons = {
        'success': '✅',
        'error': '❌', 
        'warning': '⚠️',
        'info': 'ℹ️'
    };
}
```

### 4. 数据管理规范

#### 4.1 状态管理
```javascript
function PageManager() {
    // 分页状态
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalPages = 0;
    this.totalElements = 0;
    
    // 业务数据
    this.dataList = [];
    this.selectedItems = [];
    this.currentItem = null;
    
    // 加载状态
    this.isLoading = false;
    this.isInitialized = false;
}

// 状态管理方法
PageManager.prototype.resetPagination = function() {
    this.currentPage = 1;
    this.totalPages = 0;
    this.totalElements = 0;
};

PageManager.prototype.updatePagination = function(pageData) {
    this.currentPage = pageData.pageNum || 1;
    this.totalPages = pageData.totalPage || 0;
    this.totalElements = pageData.totalElements || 0;
};

PageManager.prototype.clearSelection = function() {
    this.selectedItems = [];
    this.updateSelectionUI();
};
```

#### 4.2 本地存储使用
```javascript
// 获取认证信息
const token = localStorage.getItem('token');
const tenantId = localStorage.getItem('tenantId');

// 获取应用元数据
const appMetadata = window.top.appMetadata;
```

#### 4.3 API响应处理
```javascript
// 标准响应格式检查
if (result.code === '000000') {
    // 成功处理
} else {
    // 错误处理
    console.error('API错误:', result.message);
    this.showInfoDialog('操作失败: ' + result.message, '错误');
}
```

### 5. 文件组织规范

#### 5.1 命名规范
- 文件名：使用kebab-case，如`app-management.html`
- ID命名：使用kebab-case，如`library-modal`
- 函数名：使用camelCase，如`loadDocuments`
- 类名：使用PascalCase，如`KnowledgeManager`

### 6. 兼容性规范

#### 6.1 浏览器兼容
- 支持Chrome 88+
- 支持Firefox 85+
- 支持Safari 14+
- 支持Edge 88+

#### 6.2 响应式设计
```css
/* 移动端适配 */
@media (max-width: 768px) {
    .menu-item {
        margin: 2px 8px;
        padding: 8px 12px;
    }
}
```

### 7. 性能规范

#### 7.1 加载优化
- 使用CDN加载TailwindCSS
- 图片使用懒加载
- 大列表使用虚拟滚动或分页
- **主题CSS预加载**：两套主题的CSS都应该在页面加载时可用，避免主题切换时的闪烁


#### 7.3 内存管理
```javascript
// 清理事件监听器
PageManager.prototype.removeEventListeners = function() {
    if (this.handleEscKey) {
        document.removeEventListener('keydown', this.handleEscKey);
    }
    
    // 清理其他事件监听器
    if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
    }
};

// 清理定时器和资源
PageManager.prototype.cleanup = function() {
    if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
    
    if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
    }
    
    // 清理大型数据
    this.dataList = [];
    this.selectedItems = [];
};

// 页面卸载时的清理
PageManager.prototype.onPageUnload = function() {
    this.cleanup();
    this.removeEventListeners();
};
```

## 8. 错误处理规范

### 8.1 全局错误处理
```javascript
// 全局错误处理函数
function GlobalErrorHandler() {
    this.init();
}

GlobalErrorHandler.prototype.init = function() {
    var self = this;
    
    // 未处理的Promise错误
    window.addEventListener('unhandledrejection', function(event) {
        console.error('未处理的Promise错误:', event.reason);
        self.handleGlobalError(event.reason);
    });
    
    // JavaScript运行时错误
    window.addEventListener('error', function(event) {
        console.error('JavaScript错误:', event.error);
        self.handleGlobalError(event.error);
    });
};

GlobalErrorHandler.prototype.handleGlobalError = function(error) {
    // 避免向用户显示技术细节
    if (window.pageManager && typeof window.pageManager.showInfoDialog === 'function') {
        window.pageManager.showInfoDialog('系统出现异常，请刷新页面重试', '系统错误');
    }
};

// 初始化全局错误处理器
const globalErrorHandler = new GlobalErrorHandler();
```

### 8.2 API错误处理层级
1. 网络错误 - 显示"网络错误，请重试"
2. 认证错误 - 跳转登录页面
3. 业务错误 - 显示具体错误信息
4. 未知错误 - 显示通用错误信息

## 9. 调试规范

### 9.1 日志输出
```javascript
// 开发环境日志
PageManager.prototype.devLog = function(message, data) {
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
        console.log('🔧 开发调试:', message, data);
    }
};

// 错误日志始终输出
PageManager.prototype.errorLog = function(message, error) {
    console.error('❌ 错误:', message, error);
};
```