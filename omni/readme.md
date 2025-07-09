# 赞同智言银行应用开发平台 ZhiyanOmni

## 产品概述
赞同智言银行Omni平台是一个企业级智能助手应用开发平台，支持多应用实例的全生命周期管理。平台采用分层架构设计，包含登陆页、开发门户、应用工作台、生产门户四个核心层级。

## 技术架构
### 整体架构
```
┌─────────────────────────────────────────────────────────┐
│                    登陆页 (Landing Page)                   │
│                   产品介绍 & 入口选择                        │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   开发门户 (Dev Portal)                   │
│                   平台级功能管理                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   工作台     │  │   应用管理   │  │   模型中心   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│               应用工作台 (App Workspace)                   │
│                    单应用开发                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   开发侧     │  │   预览调试   │  │   部署上线    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 生产门户 (Production Portal)              │
│                    上线应用管理                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   监控中心   │  │   安全护盾   │  │   风控监控   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘

                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│               应用工作台 (App Workspace)                   │
│                    单应用运维运营                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   监控       │  │   运营      │  │   权限       │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘

```

### 应用流程
```flowchart TD
    A[登陆页] --> B[智能助手应用开发门户]
    B --> C["智能助手应用工作台|开发侧"]
    C --> D["预览 DEV|SIT|UAT"]
    C --> E[智能应用助手生产门户]
    E --> F["智能助手应用工作台|运营运营侧"]
```

## 架构设计建议

### 1. 微前端架构
- **独立部署**：各层级应用独立部署和升级
- **技术栈解耦**：支持不同技术栈混合使用
- **资源隔离**：避免应用间相互影响

### 2. 统一认证与权限
- **SSO单点登录**：跨应用免登录
- **RBAC权限控制**：细粒度权限管理
- **多租户支持**：数据隔离机制

### 3. 数据架构
- **配置中心**：统一配置管理
- **消息总线**：应用间通信
- **审计日志**：全链路操作记录

## 1. 登陆页 (Landing Page)
登陆页面主要介绍赞同智言银行的产品矩阵内容和特性，让用户快速了解产品价值。

### 功能特性
- 产品介绍和价值展示
- 入口导航和快速开始
- 用户认证和权限验证

## 2. 开发门户 (Development Portal)
智能应用开发门户，提供平台级功能能力和应用管理。

### 界面布局
#### 顶部导航
- **左侧**
  - 赞同Logo (141 × 32)
  - 产品标题：智言Omni
  - 版本号：V3.2507.2

- **右侧**
  - 全局搜索框
  - 租户切换器
  - 超管入口
  - 用户中心

#### 左侧菜单
- **工作台**
  - 常用应用卡片
  - 新建应用入口
  - 最近编辑应用
  - 应用统计仪表板
  - 待办任务中心
  - 消息通知中心

- **应用管理**
  - 应用列表

- **模型中心**
  - 模型管理 (LLM/NLP/ASR/TTS) - `/development/model-center/model-management`
  - 模型评估 - `/development/model-center/model-evaluation`
  - 模型微调 - `/development/model-center/model-training`
  - 数据标注 - `/development/model-optimization/data-annotation`

- **MCP 市场**
  - 第三方服务集成和工具管理 - `/development/mcp/mcp-market`

- **LUI 市场**
  - 界面组件库和交互模板 - `/development/component-dev/card-dev`

- **向量检索管理**
  - 向量数据库配置和检索算法优化 - `/development/data-process/embedding-models`

### 技术特性
- **微前端架构**：支持模块独立部署
- **iframe 容器**：安全隔离的内容加载
- **响应式设计**：适配不同屏幕尺寸

## 3. 应用工作台 - 开发侧 (App Workspace - Development)
单应用开发工作台，提供应用开发全流程功能。

### 界面布局
#### 顶部导航
- **左侧**
  - 应用Logo和标题
  - 应用状态指示器

- **右侧**
  - 帮助文档链接
  - 环境预览 (DEV/SIT/UAT)
  - 发布管理

#### 左侧功能菜单
- **知识库 RAG**
  - 文档管理 - `/development/data-process/knowledge`
  - 问答对管理 - `/development/data-process/qa-generation`

- **智能体编排**
  - Agent 配置和管理 - `/development/ability-center/agent-management`
  - 多智能体评测 - `/development/ability-center/agent-testing`
  - 提示词模板 - `/development/ability-center/prompt-template`

- **MCP服务集成**
  - 外部工具接入、API服务配置和第三方插件 - `/development/mcp/mcp-market`

- **业务开发**
  - 原子意图配置 - `/development/dynamic-orchestration/dynamic-orchestration-mapping`
  - 业务流程编排 - `/development/dynamic-orchestration/dynamic-orchestration-management`

- **LUI 卡片开发**
  - 界面组件开发、交互逻辑和样式主题 - `/development/component-dev/card-dev`

- **助手运行配置**
  - 助手Logo和品牌
  - 预设问题设置
  - 主题和样式
  - 主意图入口配置

- **权限设置**
  - 开发权限管理
  - 测试权限配置
  - 部署权限控制

- **应用部署**
  - 环境管理 (DEV/SIT/UAT)
  - 版本发布流程
  - 回滚机制

### 开发流程
1. **设计阶段**：配置助手基本信息和交互流程
2. **开发阶段**：构建知识库、智能体和业务逻辑
3. **测试阶段**：多环境测试和性能优化
4. **部署阶段**：生产环境发布和监控

## 4. 助手预览 (Assistant Preview)
提供实时预览和调试功能，支持多环境测试。

### 功能特性
- **实时预览**：即时查看配置效果
- **多环境支持**：DEV/SIT/UAT环境切换
- **调试工具**：日志查看和问题诊断
- **性能监控**：响应时间和资源使用情况

### 测试场景
- 对话流程测试
- 知识库检索验证
- 智能体响应测试
- 界面交互验证

## 5. 生产门户 (Production Portal)
管理已上线应用的运行状态和运营数据。

### 应用管理
- **应用列表**：展示所有上线应用
- **状态监控**：实时运行状态
- **版本管理**：版本历史和回滚
- **访问统计**：用户访问数据

### 监控中心
- **服务监控**
  - 服务可用性、API响应和错误率统计 - `/maintenance/operation-monitoring/service-monitor`

- **资源监控**
  - CPU/内存、网络流量和存储空间监控 - `/maintenance/operation-monitoring/resource-monitor`

- **日志监控**
  - 应用日志聚合
  - 错误日志分析
  - 审计日志查询

- **告警管理**
  - 告警规则、通知渠道和处理流程 - `/maintenance/operation-monitoring/alert-management`

### 安全护盾
- **安全日志**
  - 访问日志、异常行为和安全事件 - `/maintenance/security-management/index`

- **提示词护盾**
  - 恶意提示词检测和内容安全过滤 - `/maintenance/security-management/prompt`

- **敏感词管理**
  - 敏感词库、审核规则和违规处理 - `/maintenance/security-management/private`

### 风控监控
- **反诈配置**
  - 诈骗模式识别和风险评估模型 - `/maintenance/security-management/anti-fraud-engine`

- **攻击防护**
  - DDoS防护和恶意请求拦截 - `/operations/risk-compliance/attack-defense`

- **交易风控**
  - 交易行为分析和风险评估 - `/operations/risk-compliance/transaction-control`

- **反诈监控**
  - 实时风险监控和可疑活动告警 - `/operations/risk-compliance/anti-fraud-monitoring`

## 6. 应用工作台 - 运营侧 (App Workspace - Operations)
单应用运营工作台，提供运营分析和优化功能。

### 界面布局
#### 顶部导航
- **左侧**
  - 应用Logo和标题
  - 运营状态指示器

- **右侧**
  - 帮助文档链接
  - 环境切换 (DEV/SIT/UAT)
  - 运营工具箱

#### 左侧功能菜单
- **知识库 RAG**
  - 运营侧知识库管理 - `/development/data-process/knowledge`
  - 问答对质量监控 - `/development/data-process/qa-feedback`

- **意图参数配置**
  - 意图识别参数调优和置信度设置 - `/operations/business-operations/intent-params`

- **用户价值分析**
  - **问答分析**
    - 问答质量评估和用户满意度统计 - `/operations/user-experience/qa-analysis`

  - **用户反馈**
    - 用户评价和问题反馈处理 - `/operations/user-experience/user-feedback-v2`

  - **满意度分析**
    - 满意度趋势和用户体验评估 - `/operations/user-experience/user-satisfy-v2`

- **业务运营**
  - **使用指标**
    - 活跃用户和使用频次统计 - `/operations/business-operations/usage-metrics`

  - **问答效能**
    - 响应时间和准确率统计 - `/operations/business-operations/qa-performance`

  - **操作记录**
    - 用户和系统操作记录 - `/operations/business-operations/operation-logs`

  - **AI表现**
    - 模型性能和预测准确率监控 - `/operations/business-operations/ai-performance`

  - **ROI分析**
    - 投资回报和成本效益分析 - `/operations/business-operations/roi-analysis`

- **决策洞察**
  - **趋势分析**
    - 用户行为和业务增长趋势 - `/operations/decision-insights/trend-analysis`

  - **市场洞察**
    - 竞品分析和市场需求研究 - `/operations/decision-insights/market-insight`

  - **预测模型**
    - 用户行为和业务增长预测 - `/operations/decision-insights/prediction-model`

- **权限设置**
  - 用户访问控制 - `/maintenance/basic-permissions/api-permissions`
  - 数据访问权限 - `/maintenance/basic-permissions/resource-permissions`

### 运营流程
1. **数据收集**：用户行为和反馈数据收集
2. **分析优化**：基于数据进行分析和优化
3. **效果评估**：运营效果评估和改进
4. **决策支持**：为业务决策提供数据支持

## 总结

赞同智言银行Omni平台通过分层架构设计，实现了从产品展示到应用开发、运营监控的全流程覆盖。平台支持多应用实例管理，提供完整的开发工具链和运营分析能力，能够满足企业级智能助手应用的全生命周期需求。

### 核心优势
1. **分层架构**：清晰的功能分层，易于维护和扩展
2. **全流程覆盖**：从开发到运营的完整工具链
3. **多租户支持**：支持多个应用实例独立运行
4. **安全可靠**：完善的安全护盾和风控机制
5. **数据驱动**：丰富的分析和洞察功能