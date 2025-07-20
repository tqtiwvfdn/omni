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