/**
 * 项目协作 AI 助手 - 完整优化版
 * 新增：流式输出、美化表格、动态列、报工查询
 * 保留所有原有功能
 * macOS Liquid Glass 设计风格
 */

// ==================== 配置 ====================
const AI_CONFIG = {
  llmEndpoint: '/v1/chat/completions',
  model: 'Qwen3-32B',
  apiBaseUrl: '/amdp-portal',
  maxTokens: 2000,
  temperature: 0.7,
  maxHistoryLength: 20
};

// ==================== 意图映射表 ====================
const INTENT_MAP = {
  '创建迭代': {
    api: '/pm/iterations',
    method: 'POST',
    requiredParams: ['projectId', 'name', 'begin', 'end'],
    optionalParams: ['desc']
  },
  '查看迭代列表': {
    api: '/pm/iterations',
    method: 'GET',
    requiredParams: ['projectId'],
    optionalParams: [],
    isQuery: true
  },
  '编辑迭代': {
    api: '/pm/iterations',
    method: 'PUT',
    requiredParams: ['projectId', 'id', 'name'],
    optionalParams: ['begin', 'end', 'desc']
  },
  '删除迭代': {
    api: '/pm/iterations/batch',
    method: 'DELETE',
    requiredParams: ['projectId', 'ids'],
    optionalParams: [],
    note: 'ids 应该是字符串数组,如 ["id1", "id2"]'
  },

  '创建需求': {
    api: '/pm/stories',
    method: 'POST',
    requiredParams: ['projectId', 'name', 'effort', 'desc', 'status', 'start', 'end'],
    optionalParams: ['handler', 'priority', 'categoryId', 'iterationId', 'tester', 'parentId', 'type', 'flowline', 'caosong', 'marketProject', 'customFields', 'knowledgeFiles', 'appId'],
    bodyTemplate: {
      appId: '',
      name: '',
      desc: '<body><html><p></p></html></body>',
      parentId: '',
      categoryId: '',
      type: '',
      status: 'planning',
      flowline: '',
      iterationId: '',
      priority: 'middle',
      handler: '',
      tester: '',
      effort: '8',
      start: '',
      end: '',
      caosong: '',
      marketProject: '',
      customFields: [],
      projectId: '',
      knowledgeFiles: []
    },
    needsUserSelect: ['handler', 'iterationId']
  },
  '需求列表查询': {
    api: '/pm/stories',
    method: 'GET',
    requiredParams: ['projectId'],
    optionalParams: ['keyword', 'handler', 'status', 'priority', 'pageNum', 'pageSize', 'begin', 'end'],
    isQuery: true,
    dataType: 'stories'
  },
  '编辑需求': {
    api: '/pm/stories',
    method: 'PUT',
    requiredParams: ['projectId', 'id', 'name'],
    optionalParams: ['desc', 'handler', 'priority', 'status']
  },
  '删除需求': {
    api: '/pm/stories/batch',
    method: 'DELETE',
    requiredParams: ['projectId', 'ids'],
    optionalParams: [],
    note: 'ids 应该是字符串数组,如 ["71265628071936"]'
  },
  '导出需求': {
    api: '/pm/stories/file/export',
    method: 'POST',
    requiredParams: ['projectId'],
    optionalParams: ['keyword', 'handler', 'status', 'priority']
  },

  '创建任务': {
    api: '/pm/tasks',
    method: 'POST',
    requiredParams: ['projectId', 'name', 'effort'],
    optionalParams: ['desc', 'handler', 'priority', 'status', 'storyId', 'iterationId', 'tester'],
    bodyTemplate: {
      name: '',
      desc: '<body><html><p></p></html></body>',
      handler: '',
      priority: 'middle',
      status: 'planning',
      effort: '8',
      iterationId: '',
      tester: '',
      projectId: ''
    },
    needsUserSelect: ['handler', 'iterationId']
  },
  '任务列表查询': {
    api: '/pm/tasks',
    method: 'GET',
    requiredParams: ['projectId'],
    optionalParams: ['keyword', 'handler', 'status', 'priority', 'pageNum', 'pageSize', 'begin', 'end'],
    isQuery: true,
    dataType: 'tasks'
  },
  '编辑任务': {
    api: '/pm/tasks',
    method: 'PUT',
    requiredParams: ['projectId', 'id', 'name'],
    optionalParams: ['desc', 'handler', 'priority', 'status']
  },
  '删除任务': {
    api: '/pm/tasks/batch',
    method: 'DELETE',
    requiredParams: ['projectId', 'ids'],
    optionalParams: []
  },
  '导出任务': {
    api: '/pm/tasks/file/export',
    method: 'POST',
    requiredParams: ['projectId'],
    optionalParams: ['keyword', 'handler', 'status', 'priority']
  },

  '创建缺陷': {
    api: '/pm/bugs',
    method: 'POST',
    requiredParams: ['projectId', 'name', 'effort'],
    optionalParams: ['desc', 'handler', 'severity', 'status', 'tester', 'iterationId'],
    bodyTemplate: {
      name: '',
      desc: '<body><html><p></p></html></body>',
      handler: '',
      severity: 'normal',
      status: 'planning',
      effort: '8',
      tester: '',
      iterationId: '',
      projectId: ''
    },
    needsUserSelect: ['handler', 'tester', 'iterationId']
  },
  '缺陷列表查询': {
    api: '/pm/bugs',
    method: 'GET',
    requiredParams: ['projectId'],
    optionalParams: ['keyword', 'handler', 'status', 'severity', 'pageNum', 'pageSize', 'begin', 'end'],
    isQuery: true,
    dataType: 'bugs'
  },
  '编辑缺陷': {
    api: '/pm/bugs',
    method: 'PUT',
    requiredParams: ['projectId', 'id', 'name'],
    optionalParams: ['desc', 'handler', 'severity', 'status']
  },
  '删除缺陷': {
    api: '/pm/bugs/batch',
    method: 'DELETE',
    requiredParams: ['projectId', 'ids'],
    optionalParams: []
  },
  '导出缺陷': {
    api: '/pm/bugs/file/export',
    method: 'POST',
    requiredParams: ['projectId'],
    optionalParams: ['keyword', 'handler', 'status', 'severity']
  },

  '添加成员': {
    api: '/project_users',
    method: 'POST',
    requiredParams: ['projectId', 'userId'],
    optionalParams: ['roleIds']
  },
  '查看成员': {
    api: '/pm/users',
    method: 'GET',
    requiredParams: ['projectId'],
    optionalParams: [],
    isQuery: true
  },
  '移除成员': {
    api: '/project_users/{id}',
    method: 'DELETE',
    requiredParams: ['id'],
    optionalParams: []
  },

  '甘特图': {
    api: '/pm/overview/gantt',
    method: 'GET',
    requiredParams: [],
    optionalParams: ['projectId', 'start', 'end'],
    isQuery: true
  },
  '今日任务': {
    api: '/pm/overview/today',
    method: 'GET',
    requiredParams: [],
    optionalParams: [],
    isQuery: true
  },
  '月度概览': {
    api: '/pm/overview/month',
    method: 'GET',
    requiredParams: [],
    optionalParams: ['year', 'month'],
    isQuery: true
  },

  '查询报工': {
    description: '查询用户在各项目的实际工作天数（报工数据）',
    isOAApi: true,
    isQuery: true,
    requiredParams: ['startDate', 'endDate'],
    dataType: 'reportWork'
  }
};

// ==================== macOS Liquid Glass 样式 ====================
const STYLES = `
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ai-button-container {
  position: fixed;
  bottom: 0;
  right: 32px;
  z-index: 9999;
  transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  transform: translateX(calc(-50vw + 100%)) scale(0.5);
}

.ai-floating-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.ai-new-session-btn {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007AFF;
  font-size: 20px;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 1;
  transform: translateY(0);
}

.ai-new-session-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.ai-new-session-btn:active {
  transform: scale(0.95);
}

.ai-button {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: linear-gradient(135deg, #007AFF 0%, #0055FF 100%);
  border: 0.5px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.4), 
              0 2px 8px rgba(0, 122, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.ai-button::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 32px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.5), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
}

.ai-button:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 122, 255, 0.5),
              0 4px 12px rgba(0, 122, 255, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.ai-button:hover::before {
  opacity: 1;
}

.ai-button:active {
  transform: scale(0.98);
}

.ai-button-container.expanded {
  bottom: 32px;
  right: 32px;
  left: 32px;
  transform: translateX(0);
}

.ai-button-container.expanded .ai-floating-buttons {
  display: none;
}

.ai-input-expanded {
  display: none;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(60px) saturate(180%);
  -webkit-backdrop-filter: blur(60px) saturate(180%);
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  padding: 12px 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16),
              0 4px 16px rgba(0, 122, 255, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
  align-items: center;
  gap: 12px;
  max-width:960px;
  margin:0 auto;
}

.ai-button-container.expanded .ai-input-expanded {
  display: flex;
  animation: expandIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.input-icon {
  color: #007AFF;
  font-size: 22px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 122, 255, 0.3));
}

.main-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
  color: #1d1d1f;
  padding: 10px 0;
  min-width: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-weight: 400;
}

.main-input::placeholder {
  color: rgba(60, 60, 67, 0.6);
}

.input-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.input-mode-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-size: 18px;
  color: rgba(60, 60, 67, 0.6);
}

.input-mode-btn:hover {
  background: rgba(0, 122, 255, 0.12);
  color: #007AFF;
  transform: scale(1.05);
}

.input-mode-btn:active {
  transform: scale(0.95);
}

.close-input-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  color: rgba(60, 60, 67, 0.6);
  font-size: 16px;
  flex-shrink: 0;
}

.close-input-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1d1d1f;
  transform: scale(1.05);
}

.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007AFF 0%, #0055FF 100%);
  border: 0.5px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ai-response-overlay {
  position: fixed;
  bottom: 124px;
  left: 32px;
  right: 32px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(60px) saturate(180%);
  -webkit-backdrop-filter: blur(60px) saturate(180%);
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 24px 0;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.16),
              0 4px 16px rgba(0, 122, 255, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 9999;
  max-height: 800px;
  max-width:960px;
  margin:0 auto;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.ai-response-overlay.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

.response-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  right: -20px;
  top: 0;
}

.response-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #007AFF 0%, #0055FF 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.close-response {
  position: absolute;
  right: 30px;
  z-index: 9999;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  color: rgba(60, 60, 67, 0.6);
  font-size: 16px;
}

.close-response:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(1.05);
}

.response-content {
  font-size: 15px;
  line-height: 1.6;
  color: #1d1d1f;
  font-weight: 400;
  flex: 1;
  overflow: auto;
  padding:0 24px;
}

.chat-message {
  margin-bottom: 16px;
  animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  text-align: right;
}

.message-bubble {
  display: inline-block;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 80%;
  font-size: 15px;
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #007AFF 0%, #0055FF 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.message-ai .message-bubble {
  background: rgba(120, 120, 128, 0.12);
  color: #1d1d1f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 流式输出光标 */
.stream-cursor::after {
  content: '|';
  animation: blink 1s infinite;
  color: #007AFF;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.suggestion-list {
  margin-top: 12px;
  padding-left: 20px;
}

.suggestion-item {
  color: #007AFF;
  margin: 6px 0;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-item:hover {
  transform: translateX(4px);
  font-weight: 500;
}

.intent-item {
  background: rgba(0, 122, 255, 0.06);
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #007AFF;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.08);
}

.intent-item-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #007AFF;
  font-size: 14px;
}

.intent-item-status {
  font-size: 13px;
  color: rgba(60, 60, 67, 0.6);
}

.intent-item-status.success {
  color: #34C759;
}

.intent-item-status.error {
  color: #FF3B30;
}

/* 统计面板样式 */
.stats-panel {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(88, 86, 214, 0.08) 100%);
  backdrop-filter: blur(40px) saturate(180%);
  border: 0.5px solid rgba(0, 122, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin: 16px 0;
}

.stats-header {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 122, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.15);
  background: rgba(255, 255, 255, 0.8);
}

.stat-label {
  font-size: 13px;
  color: rgba(60, 60, 67, 0.7);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #007AFF;
  line-height: 1;
}

.stat-unit {
  font-size: 14px;
  color: rgba(60, 60, 67, 0.6);
  margin-left: 4px;
}

/* 数据表格样式 - 优化版 */
.data-table-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(40px) saturate(180%);
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px 0;
  margin: 16px 0;
 
  overflow: auto;
}

.data-table-container>div {
  overflow:auto;
  max-height:500px;
  padding: 0 20px;
}
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #1d1d1f;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(0, 122, 255, 0.2);
  white-space: nowrap;
}

.data-table th:first-child {
  border-top-left-radius: 12px;
}

.data-table th:last-child {
  border-top-right-radius: 12px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
  background: rgba(255, 255, 255, 0.5);
}

.data-table tbody tr {
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.data-table tbody tr:hover {
  background: rgba(0, 122, 255, 0.06);
  transform: translateX(2px);
  box-shadow: -4px 0 0 rgba(0, 122, 255, 0.3);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 12px;
}

.data-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-planning { 
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.2), rgba(255, 149, 0, 0.15));
  color: #FF9500;
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.status-developing { 
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.2), rgba(0, 122, 255, 0.15));
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.3);
}

.status-testing { 
  background: linear-gradient(135deg, rgba(175, 82, 222, 0.2), rgba(175, 82, 222, 0.15));
  color: #AF52DE;
  border: 1px solid rgba(175, 82, 222, 0.3);
}

.status-resolved { 
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.2), rgba(52, 199, 89, 0.15));
  color: #34C759;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.status-rejected { 
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(255, 59, 48, 0.15));
  color: #FF3B30;
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.priority-badge, .severity-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.priority-high, .severity-high { 
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(255, 59, 48, 0.15));
  color: #FF3B30;
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.priority-middle, .severity-normal { 
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.2), rgba(255, 149, 0, 0.15));
  color: #FF9500;
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.priority-low, .severity-low { 
  background: linear-gradient(135deg, rgba(142, 142, 147, 0.2), rgba(142, 142, 147, 0.15));
  color: #8E8E93;
  border: 1px solid rgba(142, 142, 147, 0.3);
}

.loading-dots {
  display: inline-flex;
  gap: 6px;
  padding: 8px 0;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: #007AFF;
  border-radius: 50%;
  animation: pulse 1.4s infinite;
  box-shadow: 0 0 4px rgba(0, 122, 255, 0.4);
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

.notification {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  padding: 16px 24px;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  z-index: 10001;
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 500;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.notification.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.selector-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.selector-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.selector-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.selector-option {
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-size: 13px;
  color: #1d1d1f;
  text-align: center;
}

.selector-option:hover {
  background: rgba(0, 122, 255, 0.08);
  border-color: #007AFF;
  transform: translateY(-1px);
}

.selector-option.selected {
  background: linear-gradient(135deg, #007AFF 0%, #0055FF 100%);
  border-color: #007AFF;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.selector-confirm-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #007AFF 0%, #0055FF 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;
}

.selector-confirm-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.selector-confirm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.jump-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.04) 100%);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 12px;
  margin: 12px 0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-width:240px;
}

.jump-card:hover {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.06) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}

.jump-card-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.jump-card-content {
  flex: 1;
}

.jump-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #007AFF;
  margin-bottom: 4px;
}

.jump-card-desc {
  font-size: 13px;
  color: #86868b;
}

.jump-card-arrow {
  font-size: 20px;
  color: #007AFF;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.jump-card:hover .jump-card-arrow {
  transform: translateX(4px);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
  background-clip: padding-box;
}
/* ==================== 样式变量 ==================== */
:root {
  --ai-radius-sm: 8px;
  --ai-radius-md: 12px;
  --ai-radius-lg: 20px;
  --ai-spacing-xs: 8px;
  --ai-spacing-sm: 12px;
  --ai-spacing-md: 16px;
  --ai-spacing-lg: 24px;
  --ai-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --ai-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --ai-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
}

/* ==================== 移动端适配 ==================== */
@media (max-width: 768px) {
  .ai-button-container {
    right: 16px;
    bottom: 16px;
    transform: translateX(calc(-50vw + 100%)) scale(0.5);
  }

  .ai-button-container.expanded {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }

  .ai-button {
    width: 56px;
    height: 56px;
    border-radius: 28px;
    font-size: 24px;
  }

  .ai-new-session-btn {
    width: 42px;
    height: 42px;
    border-radius: 21px;
    font-size: 18px;
  }

  .ai-input-expanded {
    border-radius: 16px;
    padding: 10px 14px;
    gap: 8px;
  }

  .input-icon {
    font-size: 20px;
  }

  .main-input {
    font-size: 14px;
    padding: 8px 0;
  }

  .input-mode-btn {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .close-input-btn {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .send-btn {
    width: 38px;
    height: 38px;
    font-size: 16px;
  }

  .ai-response-overlay {
    bottom: 90px;
    left: 16px;
    right: 16px;
    border-radius: 16px;
    padding: 16px 0;
    max-height: 70vh;
  }

  .response-content {
    padding: 0 16px;
    font-size: 14px;
  }

  .close-response {
    right: 20px;
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .message-bubble {
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 14px;
    max-width: 85%;
  }

  .stats-panel {
    padding: 14px;
    border-radius: 12px;
    margin: 12px 0;
  }

  .stats-header {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
    border-radius: 10px;
  }

  .stat-label {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-unit {
    font-size: 12px;
  }

  .data-table-container {
    border-radius: 12px;
    padding: 14px 0;
    margin: 12px 0;
  }

  .data-table-container > div {
    padding: 0 14px;
    max-height: 400px;
  }

  .data-table {
    font-size: 13px;
  }

  .data-table th {
    padding: 10px 12px;
    font-size: 13px;
  }

  .data-table td {
    padding: 10px 12px;
    font-size: 13px;
  }

  .status-badge,
  .priority-badge,
  .severity-badge {
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 11px;
  }

  .selector-card {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 10px;
  }

  .selector-card-title {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .selector-options {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
    max-height: 160px;
  }

  .selector-option {
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 12px;
  }

  .selector-confirm-btn {
    padding: 9px;
    border-radius: 6px;
    font-size: 13px;
    margin-top: 10px;
  }

  .jump-card {
    padding: 12px;
    gap: 12px;
    border-radius: 10px;
    margin: 10px 0;
  }

  .jump-card-icon {
    font-size: 24px;
  }

  .jump-card-title {
    font-size: 13px;
  }

  .jump-card-desc {
    font-size: 12px;
  }

  .jump-card-arrow {
    font-size: 18px;
  }

  .intent-item {
    padding: 12px 14px;
    border-radius: 10px;
    margin-bottom: 8px;
  }

  .intent-item-title {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .intent-item-status {
    font-size: 12px;
  }

  .notification {
    top: 60px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
  }

  .suggestion-list {
    margin-top: 10px;
    padding-left: 16px;
  }

  .suggestion-item {
    font-size: 13px;
    margin: 5px 0;
  }

  .loading-dots {
    gap: 5px;
    padding: 6px 0;
  }

  .loading-dot {
    width: 7px;
    height: 7px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 375px) {
  .ai-button {
    width: 52px;
    height: 52px;
    border-radius: 26px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .data-table th,
  .data-table td {
    padding: 8px 10px;
    font-size: 12px;
  }

  .selector-options {
    grid-template-columns: 1fr;
  }
}


`;

// ==================== 模糊匹配工具类 ====================
class FuzzyMatcher {
  static levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
        }
      }
    }
    
    return dp[len1][len2];
  }
  
  static matchUser(input, users) {
    if (!input || !users || users.length === 0) return null;
    
    input = input.toLowerCase().trim();
    
    let match = users.find(u => u.name.toLowerCase() === input);
    if (match) return match;
    
    match = users.find(u => 
      u.name.toLowerCase().includes(input) || 
      input.includes(u.name.toLowerCase())
    );
    if (match) return match;
    
    let minDistance = Infinity;
    let bestMatch = null;
    
    for (const user of users) {
      const distance = this.levenshteinDistance(input, user.name.toLowerCase());
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        bestMatch = user;
      }
    }
    
    return bestMatch;
  }
  
  static matchIteration(input, iterations) {
    if (!input || !iterations || iterations.length === 0) return null;
    
    input = input.toLowerCase().trim();
    
    let match = iterations.find(i => i.name.toLowerCase() === input);
    if (match) return match;
    
    match = iterations.find(i => 
      i.name.toLowerCase().includes(input) || 
      input.includes(i.name.toLowerCase())
    );
    if (match) return match;
    
    return null;
  }
  
  static matchStatus(input) {
    const statusMap = {
      '规划': 'planning',
      '规划中': 'planning',
      '待规划': 'planning',
      '实现': 'developing',
      '实现中': 'developing',
      '开发': 'developing',
      '开发中': 'developing',
      '待测试': 'be_test',
      '测试': 'be_test',
      '待复测': 'wait_retest',
      '复测': 'wait_retest',
      '测试不通过': 'test_fail',
      '未通过': 'test_fail',
      '完成': 'resolved',
      '已完成': 'resolved',
      '拒绝': 'rejected',
      '已拒绝': 'rejected'
    };
    
    input = input.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (key.toLowerCase().includes(input) || input.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return input;
  }
  
  static matchPriority(input) {
    const priorityMap = {
      '高': 'high',
      '高优先级': 'high',
      '紧急': 'high',
      '中': 'middle',
      '中等': 'middle',
      '普通': 'middle',
      '低': 'low',
      '低优先级': 'low'
    };
    
    input = input.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(priorityMap)) {
      if (key.toLowerCase().includes(input) || input.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return input;
  }
  
  static matchSeverity(input) {
    const severityMap = {
      '严重': 'high',
      '高': 'high',
      '一般': 'normal',
      '中': 'normal',
      '普通': 'normal',
      '轻微': 'low',
      '低': 'low'
    };
    
    input = input.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(severityMap)) {
      if (key.toLowerCase().includes(input) || input.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return input;
  }
}

// ==================== 对话会话类 ====================
class ConversationSession {
  constructor(id = null) {
    this.id = id || this.generateSessionId();
    this.messages = [];
    this.context = {};
    this.createdAt = new Date();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addMessage(role, content, metadata = {}) {
    this.messages.push({
      role,
      content,
      metadata,
      timestamp: new Date()
    });
  }

  getMessages() {
    return this.messages;
  }

  updateContext(key, value) {
    this.context[key] = value;
  }

  getContext(key) {
    return this.context[key];
  }

  clearContext() {
    this.context = {};
  }

  clear() {
    this.messages = [];
    this.context = {};
  }
}

// ==================== 数据分析工具类 ====================
class DataAnalyzer {
  static analyzeStories(data) {
    let items = [];
    if (data.pageData) {
      items = data.pageData;
    } else if (data.obj?.pageData) {
      items = data.obj.pageData;
    } else if (data.obj?.list) {
      items = data.obj.list;
    } else if (Array.isArray(data.obj)) {
      items = data.obj;
    } else if (Array.isArray(data)) {
      items = data;
    }
    
    const stats = {
      total: items.length,
      totalEffort: items.reduce((sum, item) => sum + (parseInt(item.effort) || 0), 0),
      byStatus: {},
      byPriority: {},
      byHandler: {}
    };

    items.forEach(item => {
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
      
      if (item.handler) {
        const handlerName = item.handlers?.[0]?.name || item.handler;
        stats.byHandler[handlerName] = (stats.byHandler[handlerName] || 0) + 1;
      }
    });

    return { stats, items };
  }

  static analyzeTasks(data) {
    return this.analyzeStories(data);
  }

  static analyzeBugs(data) {
    let items = [];
    if (data.pageData) {
      items = data.pageData;
    } else if (data.obj?.pageData) {
      items = data.obj.pageData;
    } else if (data.obj?.list) {
      items = data.obj.list;
    } else if (Array.isArray(data.obj)) {
      items = data.obj;
    } else if (Array.isArray(data)) {
      items = data;
    }
    
    const stats = {
      total: items.length,
      totalEffort: items.reduce((sum, item) => sum + (parseInt(item.effort) || 0), 0),
      bySeverity: {},
      byStatus: {},
      byHandler: {}
    };

    items.forEach(item => {
      stats.bySeverity[item.severity] = (stats.bySeverity[item.severity] || 0) + 1;
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      
      if (item.handler) {
        const handlerName = item.handlers?.[0]?.name || item.handler;
        stats.byHandler[handlerName] = (stats.byHandler[handlerName] || 0) + 1;
      }
    });

    return { stats, items };
  }

  static getStatusLabel(status) {
    const labels = {
      'planning': '规划中',
      'developing': '实现中',
      'be_test': '待测试',
      'wait_retest': '待复测',
      'test_fail': '测试不通过',
      'resolved': '已完成',
      'rejected': '已拒绝'
    };
    return labels[status] || status;
  }

  static getPriorityLabel(priority) {
    const labels = {
      'high': '高',
      'middle': '中',
      'low': '低'
    };
    return labels[priority] || priority;
  }

  static getSeverityLabel(severity) {
    const labels = {
      'high': '严重',
      'normal': '一般',
      'low': '轻微'
    };
    return labels[severity] || severity;
  }
}

// ==================== 核心类：AI 助手 ====================
class ProjectAIAssistant {
  constructor(config = {}) {
    this.config = { ...AI_CONFIG, ...config };
    this.currentProjectId = this.getCurrentProjectId();
    this.currentUserId = localStorage.getItem('userId') || '';
    this.currentSession = new ConversationSession();
    this.sessions = [this.currentSession];
    this.isProcessing = false;
    this.usersCache = null;
    this.iterationsCache = null;
  }

  getCurrentProjectId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('proId') || localStorage.getItem('acp-project-select-cur-project') || localStorage.getItem('mobile.projectId');
  }

  getSystemPrompt() {
    const intentDetails = Object.entries(INTENT_MAP).map(([intent, config]) => {
      return `- ${intent}:
    ${config.description || ''}
    必填参数: ${config.requiredParams?.join(', ') || '无'}
    可选参数: ${config.optionalParams?.join(', ') || '无'}`;
    }).join('\n');
  
    return `你是一个项目协作管理系统的 AI 助手。你需要理解用户的自然语言指令,识别用户意图,并提取关键参数。
  
  **【核心识别原则 - 极其重要】**
  1. **默认对象识别规则**：
     - 当用户没有明确指定操作对象类型时，**默认指的是"需求"（Story）**
     - 例如："创建一个XXX" → 默认为"创建需求"
     - 例如："查看我的XXX" → 默认为"需求列表查询"
     - 例如："统计XXX" → 默认查询"需求"相关数据
     
  2. **明确指定识别规则**：
     - 只有当用户**明确提到**"任务"、"Task"、"缺陷"、"Bug"等关键词时，才识别为对应类型
     - 例如："创建一个任务" → "创建任务"
     - 例如："查看我的缺陷" → "缺陷列表查询"
  
  3. **意图识别优先级**（从高到低）：
     - 第一优先：用户明确指定的对象类型（任务/缺陷/迭代等）
     - 第二优先：上下文中已确定的对象类型
     - 第三优先：**默认为"需求"类型**
  
  **重要概念区分：**
  1. **工时（effort）**：项目管理系统中需求/任务/缺陷的预估工时字段，单位是小时(h)
     - 查询工时使用"需求列表查询"、"任务列表查询"等意图
     - 例如："查询我9月的需求工时"、"统计本月任务的工时"
     
  2. **报工（reportWork）**：OA系统中实际工作记录，查询用户在各项目的实际工作天数，单位是天(DL_WORKDAYS)
     - 查询报工使用"查询报工"意图，参数为 userId: ${this.currentUserId}
     - 例如："我的报工情况"、"本月报工统计"、"最近3个月的报工"
     - **注意**：只能查询当前用户自己的报工，userId 固定为 ${this.currentUserId}
  
  **可识别的意图类型及其参数要求:**
  ${intentDetails}
  
  **参数说明:**
  - desc: 需求描述,默认格式为 HTML: "<body><html><p>内容</p></html></body>"
  - status: 状态值包括(必填)"be_test"(待测试)、"wait_retest"(待复测)、"developing"(实现中)、"planning"(规划中)、"rejected"(已拒绝)、"resolved"(已完成)、"test_fail"(测试不通过),默认"developing"
  - priority: 优先级值包括 "high"(高)、"middle"(中)、"low"(低)
  - severity: 严重程度值包括 "high"(严重)、"normal"(一般)、"low"(低)
  - effort: 预估工时(必填),数字字符串,默认 "8"
  - begin/end: 时间范围查询参数,格式 yyyy-MM-dd
  - handler/tester: 可以直接使用人名,系统会自动匹配对应的用户ID
  - iterationId: 可以直接使用迭代名称,系统会自动匹配对应的迭代ID
  - userId: 查询报工时使用,固定为当前用户ID: ${this.currentUserId}
  - timeExpression: 时间表达式,如"本月"、"上月"、"最近3个月"等
  
  **智能匹配功能(重要):**
  系统支持以下字段的智能匹配,你可以直接使用中文名称或描述:
  1. **handler/tester**: 直接填入人名即可,如 "郑泽鹏"、"张三"
  2. **iterationId**: 直接填入迭代名称,如 "Sprint 1"、"v1.0迭代"
  3. **status**: 支持中文状态,如 "开发中"、"已完成"、"测试"
  4. **priority**: 支持中文优先级,如 "高"、"中等"、"低优先级"
  5. **severity**: 支持中文严重程度,如 "严重"、"一般"、"轻微"
  
  **查询意图识别规则:**
  1. 询问"工时"、"预估工时"、"需求/任务/缺陷的工时" → 使用对应的列表查询意图（默认"需求列表查询"）
  2. 询问"报工"、"工作统计"、"实际投入"、"工作天数" → 使用"查询报工"意图
  3. 如果提到"我的",自动添加 handler=${this.currentUserId} 或 userId=${this.currentUserId}
  4. 如果提到具体人名,直接将人名作为 handler 参数值
  5. **如果没有明确提到"任务"或"缺陷"，默认查询"需求"**
  
  **返回格式要求:**
  你必须严格按照以下 JSON 格式返回结果:
  {
    "intents": [
      {
        "intent": "意图名称(必须完全匹配上述列表中的意图)",
        "params": {
          "参数名": "参数值"
        },
        "confidence": 0.95
      }
    ],
    "needsClarification": false,
    "clarificationQuestion": "如果参数不完整,这里提问需要补充什么",
    "missingParams": ["缺失的参数名列表"]
  }
  
  **关键规则(必须严格遵守):**
  1. projectId:如果用户没有明确指定,使用当前项目ID:${this.currentProjectId}
  2. 时间格式:begin、end、start 等时间参数统一为 yyyy-MM-dd 格式
  3. 查询当前用户数据:当用户说"我的"时,自动添加对应的用户参数
  4. 查询其他用户数据:直接将人名作为 handler 参数,不要询问ID
  5. 意图类型:intent 字段的值必须完全匹配上述"可识别的意图类型"列表中的某一项
  6. 报工查询:userId 固定为 ${this.currentUserId},timeExpression 用于解析时间范围
  7. **默认对象：没有明确指定时，默认操作"需求"而非"任务"或"缺陷"**
  
  **当前上下文信息:**
  - 当前时间:${new Date().toLocaleDateString('zh-CN')}
  - 当前项目ID:${this.currentProjectId}
  - 当前用户ID:${this.currentUserId}
  
  **重要提醒:**
  - 必须确保返回的 JSON 格式完全正确
  - intent 值必须从可识别列表中选择
  - params 的键名必须与 API 要求的参数名完全一致
  - 对于人名、迭代名等,直接使用原始值,不需要转换为ID
  - 区分"工时"和"报工"的查询意图
  - **默认操作对象是"需求"，除非明确指定为"任务"或"缺陷"**`;
  }

  async recognizeIntent(userInput, onStream = null) {
    try {
      const messages = [
        { role: 'system', content: this.getSystemPrompt() },
        ...this.currentSession.getMessages().slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      const response = await fetch(this.config.llmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: !!onStream
        })
      });

      if (!response.ok) throw new Error('LLM 请求失败');

      // 流式输出
      if (onStream) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data: '));

          for (const line of lines) {
            const jsonStr = line.replace('data: ', '');
            if (jsonStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(jsonStr);
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                fullContent += content;
                if (onStream) onStream(content);
              }
            } catch (e) {
              console.log('Stream parse error:', e);
            }
          }
        }

        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('无法解析 AI 返回结果');
        
        const result = JSON.parse(jsonMatch[0]);
        this.currentSession.addMessage('assistant', JSON.stringify(result), { type: 'intent_recognition' });
        return result;
      } else {
        // 非流式输出
        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('无法解析 AI 返回结果');

        const result = JSON.parse(jsonMatch[0]);

        this.currentSession.addMessage('assistant', JSON.stringify(result), { type: 'intent_recognition' });

        return result;
      }
    } catch (error) {
      console.error('意图识别失败:', error);
      throw error;
    }
  }

  async fetchUsers() {
    if (this.usersCache) return this.usersCache;
    
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/pm/users/?projectId=${this.currentProjectId}`, {
        headers: {
          'Authorization': 'Bearer ' + this.getAuthToken()
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取用户列表失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      let users = [];
      if (data.success && Array.isArray(data.obj)) {
        users = data.obj;
      } else if (Array.isArray(data)) {
        users = data;
      } else if (data.obj && Array.isArray(data.obj.pageData)) {
        users = data.obj.pageData;
      }
      
      console.log(`📋 成功获取 ${users.length} 个用户`);
      this.usersCache = users;
      return this.usersCache;
    } catch (error) {
      console.error('❌ 获取用户列表失败:', error);
      return [];
    }
  }

  async fetchIterations() {
    if (this.iterationsCache) return this.iterationsCache;
    
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/pm/iterations/?projectId=${this.currentProjectId}`, {
        headers: {
          'Authorization': 'Bearer ' + this.getAuthToken()
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取迭代列表失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      let iterations = [];
      if (data.success && Array.isArray(data.obj)) {
        iterations = data.obj;
      } else if (Array.isArray(data)) {
        iterations = data;
      } else if (data.obj && Array.isArray(data.obj.pageData)) {
        iterations = data.obj.pageData;
      }
      
      console.log(`📋 成功获取 ${iterations.length} 个迭代`);
      this.iterationsCache = iterations;
      return this.iterationsCache;
    } catch (error) {
      console.error('❌ 获取迭代列表失败:', error);
      return [];
    }
  }

  async smartParseParams(intent, params) {
    const parsedParams = { ...params };
    const intentConfig = INTENT_MAP[intent];
    
    if (!intentConfig) return parsedParams;
    
    if (parsedParams.handler && !parsedParams.handler.startsWith('usr-')) {
      const users = await this.fetchUsers();
      const matchedUser = FuzzyMatcher.matchUser(parsedParams.handler, users);
      if (matchedUser) {
        console.log(`✅ 智能匹配: "${parsedParams.handler}" → ${matchedUser.name} (${matchedUser.id})`);
        parsedParams.handler = matchedUser.id;
      }
    }
    
    if (parsedParams.tester && !parsedParams.tester.startsWith('usr-')) {
      const users = await this.fetchUsers();
      const matchedUser = FuzzyMatcher.matchUser(parsedParams.tester, users);
      if (matchedUser) {
        console.log(`✅ 智能匹配: "${parsedParams.tester}" → ${matchedUser.name} (${matchedUser.id})`);
        parsedParams.tester = matchedUser.id;
      }
    }
    
    if (parsedParams.iterationId && !parsedParams.iterationId.startsWith('iter-')) {
      const iterations = await this.fetchIterations();
      const matchedIter = FuzzyMatcher.matchIteration(parsedParams.iterationId, iterations);
      if (matchedIter) {
        console.log(`✅ 智能匹配: "${parsedParams.iterationId}" → ${matchedIter.name} (${matchedIter.id})`);
        parsedParams.iterationId = matchedIter.id;
      }
    }
    
    if (parsedParams.status) {
      const matchedStatus = FuzzyMatcher.matchStatus(parsedParams.status);
      if (matchedStatus !== parsedParams.status) {
        console.log(`✅ 智能匹配: 状态 "${parsedParams.status}" → ${matchedStatus}`);
        parsedParams.status = matchedStatus;
      }
    }
    
    if (parsedParams.priority) {
      const matchedPriority = FuzzyMatcher.matchPriority(parsedParams.priority);
      if (matchedPriority !== parsedParams.priority) {
        console.log(`✅ 智能匹配: 优先级 "${parsedParams.priority}" → ${matchedPriority}`);
        parsedParams.priority = matchedPriority;
      }
    }
    
    if (parsedParams.severity) {
      const matchedSeverity = FuzzyMatcher.matchSeverity(parsedParams.severity);
      if (matchedSeverity !== parsedParams.severity) {
        console.log(`✅ 智能匹配: 严重程度 "${parsedParams.severity}" → ${matchedSeverity}`);
        parsedParams.severity = matchedSeverity;
      }
    }
    
    return parsedParams;
  }

  async executeAPI(intent, params) {
    const intentConfig = INTENT_MAP[intent];
    if (!intentConfig) {
      throw new Error(`未知意图: ${intent}`);
    }

    // 报工查询特殊处理
    if (intent === '查询报工') {
      return await this.queryReportWork(params);
    }

    const missingParams = intentConfig.requiredParams.filter(p => !params[p]);
    if (missingParams.length > 0) {
      throw new Error(`缺少必填参数: ${missingParams.join(', ')}`);
    }

    const isQueryIntent = intentConfig.isQuery;
    
    if (isQueryIntent && !params.pageNum) {
      params.pageNum = 1;
      params.pageSize = params.pageSize || 100;
    }

    const firstPageResult = await this.executeSinglePageAPI(intent, params);

    if (isQueryIntent && firstPageResult.success && firstPageResult.obj) {
      const obj = firstPageResult.obj;
      
      const pageData = obj.pageData || obj.list || obj ||[];
      const total = obj.total || pageData.length;
      const currPage = obj.currPage || obj.pageNum || 1;
      const currPageSize = obj.currPageSize || obj.pageSize || pageData.length;
      
      if (total > pageData.length) {
        console.log(`📄 检测到分页数据: 当前${pageData.length}条，总计${total}条，开始加载所有数据...`);
        
        const totalPages = Math.ceil(total / currPageSize);
        const allData = [...pageData];
        
        for (let page = 2; page <= totalPages; page++) {
          const nextParams = { ...params, pageNum: page };
          const nextPageResult = await this.executeSinglePageAPI(intent, nextParams);
          
          if (nextPageResult.success && nextPageResult.obj) {
            const nextPageData = nextPageResult.obj.pageData || nextPageResult.obj.list || [];
            allData.push(...nextPageData);
            console.log(`📄 已加载 ${allData.length}/${total} 条数据`);
          }
        }
        
        console.log(`✅ 所有数据加载完成: 共${allData.length}条`);
        
        return {
          ...firstPageResult,
          obj: {
            ...firstPageResult.obj,
            pageData: allData,
            list: allData,
            currPage: 1,
            total: allData.length
          }
        };
      }
    }

    return firstPageResult;
  }

  async autoLogin() {

      try {
          const response = await fetch('/ai/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: 'A3805',
                  password: 'user101@'
              })
          });

          const data = await response.json();
          if (data.obj && data.obj.access_token) {
              this.oaToken = data.obj.access_token;
          }

          console.log('自动登录成功');
      } catch (error) {
          console.error('Auto login error:', error);
          this.updateConnectionStatus(false);
          this.addMessage('系统', '自动登录失败，部分功能可能不可用。', 'ai');
      } finally {
      }
  }
  
  getHeaders() {
      const authorization = `bearer ${this.oaToken}`;
      const changeNo = 'q8EPXtTdIQEqtqlKppjC7V3';
      const timestamp = new Date().getTime();

      return {
          Accept: "application/json, text/plain, */*",
          "authorization": authorization,
          'channel-code': 'C000001',
          'channel-no': changeNo,
          'channel-time': timestamp,
          "timestamp": window.Timestamp(authorization, timestamp, changeNo),
          "content-type": "application/json;charset=UTF-8",
          "x-requested-with": "XMLHttpRequest"
      };
  }

  async getUserId(){

    const response = await fetch('/api/rpcServer/afa4j/3/auth/A02009', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        searchKey: localStorage.getItem('userName'),//userId || this.currentUserId,
        orgCode: null,
        orgId:null,
        status: 1
      })
    });

    if (!response.ok) {
      throw new Error(`查询报工失败: ${response.status}`);
    }

    const data = await response.json();
    
    return data.data.record[0].id;
  }
  

  async queryReportWork(params) {
    try {
      const { timeExpression } = params;
      let oaToken;

      if(!this.oaToken){
        await this.autoLogin();
      }
      oaToken=this.oaToken;

      if(!this.userOAId){
        this.userOAId=await this.getUserId();
      }
      
      const response = await fetch('/api/rpcServer/afa4j/3/saleNew/SACP01036', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          reload: true,
          userId: this.userOAId,
          startDate: params.startDate.replace(/-/g,''),
          endDate: params.endDate.replace(/-/g,'')
        })
      });

      if (!response.ok) {
        throw new Error(`查询报工失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 提取项目列表 - 兼容多种数据格式
      let projects = [];
      if (data.data && data.data.userBgtList) {
        projects = data.data.userBgtList;
      } else if (Array.isArray(data.data)) {
        projects = data.data;
      } else if (Array.isArray(data)) {
        projects = data;
      }
      
      // 返回与 OAAssistant 相同的数据结构
      return {
        success: true,
        obj: {
          pageData: projects,
          list: projects,
          total: projects.length
        },
        data: {
          userBgtList: projects
        },
        timeExpression: timeExpression,
        dateRange: params
      };
    } catch (error) {
      console.error('查询报工失败:', error);
      return { success: false, error: error.message };
    }
  }

  async executeSinglePageAPI(intent, params) {
    const intentConfig = INTENT_MAP[intent];
    let url = this.config.apiBaseUrl + intentConfig.api;
    url = url.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);

    const requestConfig = {
      method: intentConfig.method,
      headers: {
        'accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getAuthToken(),
        'cache-control': 'no-cache',
        'pragma': 'no-cache'
      },
      mode: 'cors',
      credentials: 'include'
    };

    const queryParams = new URLSearchParams();
    if (params.projectId && !url.includes('{projectId}')) {
      queryParams.append('projectId', params.projectId);
    }

    if (intentConfig.method === 'GET') {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !url.includes(`{${key}}`) && key !== 'projectId') {
          queryParams.append(key, value);
        }
      });
      url += '?' + queryParams.toString();
    } else if (intentConfig.method === 'DELETE') {
      const bodyData = {};

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !url.includes(`{${key}}`) && key !== 'projectId') {
          if (key !== 'ids') {
            bodyData[key] = value;
          }
        }
      });

      url += '?' + queryParams.toString();

      if (params.ids && Object.keys(params).filter(k => k !== 'projectId').length === 1) {
        requestConfig.body = JSON.stringify(params.ids);
      } else if (Object.keys(bodyData).length > 0) {
        requestConfig.body = JSON.stringify(bodyData);
      }
    } else {
      url += '?' + queryParams.toString();

      let bodyData = {};

      if (intentConfig.bodyTemplate) {
        bodyData = { ...intentConfig.bodyTemplate };
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            bodyData[key] = value;
          }
        });
      } else {
        bodyData = params;
      }

      requestConfig.body = JSON.stringify(bodyData);
    }

    try {
      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 调用失败: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API 执行失败:', error);
      throw error;
    }
  }

  getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  async processUserInput(userInput, onStream = null) {
    if (this.isProcessing) {
      return { success: false, message: '正在处理上一个请求,请稍候...' };
    }

    this.isProcessing = true;

    try {
      this.currentSession.addMessage('user', userInput);

      const intentResult = await this.recognizeIntent(userInput, onStream);

      if (!intentResult.intents || intentResult.intents.length === 0) {
        this.isProcessing = false;
        return {
          success: false,
          noIntent: true,
          message: '抱歉,我无法识别您的意图。',
          suggestions: [
            '创建一个新需求',
            '查看我9月份的需求',
            '查询我的报工情况',
            '统计本月工时',
            '查看今日任务'
          ]
        };
      }

      if (intentResult.needsClarification) {
        this.isProcessing = false;

        if (intentResult.missingParams && intentResult.intents.length > 0) {
          this.currentSession.updateContext('pendingIntent', intentResult.intents[0]);
          this.currentSession.updateContext('missingParams', intentResult.missingParams);
        }

        return {
          success: false,
          needClarification: true,
          message: intentResult.clarificationQuestion,
          context: intentResult
        };
      }

      const pendingIntent = this.currentSession.getContext('pendingIntent');
      if (pendingIntent && intentResult.intents.length === 0) {
        intentResult.intents = [pendingIntent];
        this.currentSession.clearContext();
      }

      const intentsNeedingSelection = [];
      const intentsReadyToExecute = [];

      for (const intentItem of intentResult.intents) {
        const intentConfig = INTENT_MAP[intentItem.intent];
        if (intentConfig && intentConfig.needsUserSelect) {
          const missingFields = intentConfig.needsUserSelect.filter(
            field => !intentItem.params[field]
          );

          if (missingFields.length > 0) {
            intentsNeedingSelection.push({
              ...intentItem,
              missingFields
            });
          } else {
            intentsReadyToExecute.push(intentItem);
          }
        } else {
          intentsReadyToExecute.push(intentItem);
        }
      }

      if (intentsNeedingSelection.length > 0) {
        this.isProcessing = false;
        this.currentSession.updateContext('pendingIntentsForSelection', intentsNeedingSelection);
        this.currentSession.updateContext('readyIntents', intentsReadyToExecute);

        return {
          success: false,
          needsUserSelect: true,
          intents: intentsNeedingSelection,
          message: '请为以下项目选择信息'
        };
      }

      const results = [];
      for (const intentItem of intentsReadyToExecute) {
        try {
          const parsedParams = await this.smartParseParams(intentItem.intent, intentItem.params);
          const apiResult = await this.executeAPI(intentItem.intent, parsedParams);
          results.push({
            intent: intentItem.intent,
            success: true,
            data: apiResult,
            params: parsedParams
          });
        } catch (error) {
          results.push({
            intent: intentItem.intent,
            success: false,
            error: error.message,
            params: intentItem.params
          });
        }
      }

      this.isProcessing = false;

      return {
        success: true,
        isMultiple: results.length > 1,
        results: results,
        message: this.generateSuccessMessage(results)
      };

    } catch (error) {
      this.isProcessing = false;
      return {
        success: false,
        error: error.message,
        message: `操作失败: ${error.message}`
      };
    }
  }

  async completeSelectionsAndExecute(selectionsMap) {
    if (this.isProcessing) {
      return { success: false, message: '正在处理上一个请求,请稍候...' };
    }

    const pendingIntents = this.currentSession.getContext('pendingIntentsForSelection');
    const readyIntents = this.currentSession.getContext('readyIntents') || [];

    if (!pendingIntents || pendingIntents.length === 0) {
      return { success: false, message: '没有待完成的操作' };
    }

    this.isProcessing = true;

    try {
      const results = [];

      for (let i = 0; i < pendingIntents.length; i++) {
        const intent = pendingIntents[i];
        const selections = selectionsMap[i] || {};
        const finalParams = { ...intent.params, ...selections };

        try {
          const parsedParams = await this.smartParseParams(intent.intent, finalParams);
          const apiResult = await this.executeAPI(intent.intent, parsedParams);
          results.push({
            intent: intent.intent,
            success: true,
            data: apiResult,
            params: parsedParams
          });
        } catch (error) {
          results.push({
            intent: intent.intent,
            success: false,
            error: error.message,
            params: finalParams
          });
        }
      }

      for (const intentItem of readyIntents) {
        try {
          const parsedParams = await this.smartParseParams(intentItem.intent, intentItem.params);
          const apiResult = await this.executeAPI(intentItem.intent, parsedParams);
          results.push({
            intent: intentItem.intent,
            success: true,
            data: apiResult,
            params: parsedParams
          });
        } catch (error) {
          results.push({
            intent: intentItem.intent,
            success: false,
            error: error.message,
            params: intentItem.params
          });
        }
      }

      this.currentSession.clearContext();
      this.isProcessing = false;

      return {
        success: true,
        isMultiple: results.length > 1,
        results: results,
        message: this.generateSuccessMessage(results)
      };
    } catch (error) {
      this.isProcessing = false;
      return {
        success: false,
        error: error.message,
        message: `操作失败: ${error.message}`
      };
    }
  }

  generateSuccessMessage(results) {
    if (results.length === 1) {
      const result = results[0];
      if (result.success) {
        return this.getSingleSuccessMessage(result.intent, result.data);
      } else {
        return `${result.intent} 失败: ${result.error}`;
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    if (failCount === 0) {
      return `✅ 成功执行 ${successCount} 个操作`;
    } else if (successCount === 0) {
      return `❌ ${failCount} 个操作全部失败`;
    } else {
      return `⚠️ 完成 ${successCount} 个操作,${failCount} 个失败`;
    }
  }

  getSingleSuccessMessage(intent, data) {
    const messages = {
      '创建迭代': '迭代创建成功',
      '创建需求': '需求创建成功',
      '创建任务': '任务创建成功',
      '创建缺陷': '缺陷创建成功',
      '添加成员': '成员添加成功'
    };

    if (intent.includes('列表') || intent.includes('查询')) {
      const count = data.obj?.total || Array.isArray(data) ? data.length : (data.total || data.list?.length || 0);
      return `查询成功,共找到 ${count} 条记录`;
    }

    if (intent.includes('删除')) return '删除成功';
    if (intent.includes('编辑') || intent.includes('更新')) return '更新成功';

    return messages[intent] || '操作成功';
  }

  newSession() {
    this.currentSession = new ConversationSession();
    this.sessions.push(this.currentSession);
    return this.currentSession;
  }

  getCurrentSession() {
    return this.currentSession;
  }

  clearCurrentSession() {
    this.currentSession.clear();
  }
}

// ==================== UI 控制器 ====================
class AIAssistantUI {
  constructor(assistant) {
    this.assistant = assistant;
    this.isExpanded = false;
    this.injectStyles();
    this.initUI();
    this.bindEvents();
  }

  isMobile(){
    return !!document.location.href.match(/mobile/);
  }

  injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  initUI() {
    const container = document.createElement('div');
    container.id = 'ai-assistant-container';
    container.className = 'ai-button-container';
    container.innerHTML = `
      <div class="ai-floating-buttons">
        <button class="ai-button" id="aiButton">✨</button>
      </div>
      <div class="ai-input-expanded" id="aiInputExpanded">
        <button class="ai-new-session-btn" id="newSessionBtn" title="新建会话">🔄</button>
        <input type="text" 
               class="main-input" 
               id="aiMainInput"
               placeholder="告诉我你想做什么... 例如：查看我9月份的需求、查询我的报工情况">
        <div class="input-actions">
          <button class="send-btn" id="sendBtn" disabled>➤</button>
        </div>
        <button class="close-input-btn" id="closeBtn">✕</button>
      </div>
    `;
    document.body.appendChild(container);

    const responseOverlay = document.createElement('div');
    responseOverlay.id = 'ai-response-overlay';
    responseOverlay.className = 'ai-response-overlay';
    responseOverlay.innerHTML = `
      <div class="response-header">
        <button class="close-response" id="closeResponse">✕</button>
      </div>
      <div class="response-content" id="responseContent"></div>
    `;
    document.body.appendChild(responseOverlay);

    const notification = document.createElement('div');
    notification.id = 'ai-notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }

  bindEvents() {
    document.getElementById('aiButton').addEventListener('click', () => this.expandInput());
    document.getElementById('closeBtn').addEventListener('click', () => this.collapseInput());
    document.getElementById('closeResponse').addEventListener('click', () => this.closeResponse());
    document.getElementById('newSessionBtn').addEventListener('click', () => this.newSession());

    const aiMainInput = document.getElementById('aiMainInput');
    const sendBtn = document.getElementById('sendBtn');

    aiMainInput.addEventListener('input', (e) => {
      sendBtn.disabled = !e.target.value.trim();
    });

    aiMainInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && aiMainInput.value.trim()) {
        this.handleSend();
      }
    });

    sendBtn.addEventListener('click', () => this.handleSend());
  }

  expandInput() {
    document.getElementById('ai-assistant-container').classList.add('expanded');
    this.isExpanded = true;

    setTimeout(() => {
      document.getElementById('aiMainInput').focus();
    }, 300);
  }

  collapseInput() {
    document.getElementById('ai-assistant-container').classList.remove('expanded');
    this.isExpanded = false;

    document.getElementById('aiMainInput').value = '';
    document.getElementById('sendBtn').disabled = true;
  }

  async handleSend() {
    const input = document.getElementById('aiMainInput').value.trim();
    if (!input) return;

    this.showResponse();
    this.addUserMessage(input);

    document.getElementById('aiMainInput').value = '';
    document.getElementById('sendBtn').disabled = true;

    // 先显示加载中的状态
    const loadingMessageDiv = this.addAIMessage('<div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>', false);

    let streamMessageDiv = null;
    let streamContentEl = null;
    let isStreamStarted = false;

    let streamContent = '';
    const onStream = (chunk) => {
      // 第一次收到流式数据时，移除 loading 并创建流式消息
      if (!isStreamStarted) {
        loadingMessageDiv.remove();
        streamMessageDiv = this.addAIMessage('', true);
        streamContentEl = streamMessageDiv.querySelector('.message-bubble');
        isStreamStarted = true;
      }
      
      streamContent += chunk;
      streamContentEl.innerHTML = this.escapeHtml(streamContent);
      this.scrollToBottom();
    };

    try {
      const result = await this.assistant.processUserInput(input, onStream);
      
      // 如果流式没有开始（没有收到数据），移除 loading
      if (!isStreamStarted) {
        loadingMessageDiv.remove();
      } else {
        // 移除流式光标
        streamContentEl.classList.remove('stream-cursor');
        
        // 显示简洁的意图识别摘要
        streamContentEl.innerHTML = '🤖 正在执行操作...';
      }
      
      // 等待一小段时间再显示结果（更好的视觉效果）
      setTimeout(() => {
        // 移除意图识别消息
        if (streamMessageDiv) {
          streamMessageDiv.remove();
        }
        
        // 显示执行结果
        this.displayResult(result);
      }, 300);
      
    } catch (error) {
      if (loadingMessageDiv.parentNode) {
        loadingMessageDiv.remove();
      }
      if (streamContentEl) {
        streamContentEl.classList.remove('stream-cursor');
        streamContentEl.innerHTML = `❌ 处理失败: ${error.message}`;
      } else {
        this.addAIMessage(`❌ 处理失败: ${error.message}`);
      }
    }
  }

  showResponse() {
    const overlay = document.getElementById('ai-response-overlay');
    overlay.classList.add('show');
  }

  closeResponse() {
    document.getElementById('ai-response-overlay').classList.remove('show');
  }

  addUserMessage(text) {
    const content = document.getElementById('responseContent');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message message-user';
    messageDiv.innerHTML = `<div class="message-bubble">${this.escapeHtml(text)}</div>`;
    content.appendChild(messageDiv);
    content.scrollTop = content.scrollHeight;
  }

  addAIMessage(text, isStreaming = false) {
    const content = document.getElementById('responseContent');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message message-ai';
    const bubbleClass = isStreaming ? 'message-bubble stream-cursor' : 'message-bubble';
    messageDiv.innerHTML = `<div class="${bubbleClass}">${text}</div>`;
    content.appendChild(messageDiv);
    content.scrollTop = content.scrollHeight;
    return messageDiv;
  }

  scrollToBottom() {
    const container = document.getElementById('responseContent');
    container.scrollTop = container.scrollHeight;
  }

  displayResult(result) {
    if (result.noIntent) {
      let message = `🤔 ${result.message}`;
      if (result.suggestions && result.suggestions.length > 0) {
        message += '<div class="suggestion-list">您可以尝试：';
        result.suggestions.forEach(suggestion => {
          message += `<div class="suggestion-item" onclick="document.getElementById('aiMainInput').value='${suggestion}'; document.getElementById('aiMainInput').dispatchEvent(new Event('input'));">• ${suggestion}</div>`;
        });
        message += '</div>';
      }
      this.addAIMessage(message);
      return;
    }

    if (result.success && result.results && result.results.length) {
      if (result.isMultiple) {
        this.displayMultipleResults(result.results);
      } else {
        this.displaySingleResult(result.results[0]);
      }
    } else if (result.needsUserSelect) {
      this.showUserSelector(result);
    } else if (result.needClarification) {
      this.addAIMessage(`🤔 ${result.message}`);
    } else {
      this.addAIMessage(`❌ ${result.message || '操作失败,请重试'}`);
    }
  }

  async showUserSelector(result) {
    const content = document.getElementById('responseContent');

    this.addAIMessage(`好的,请为以下 ${result.intents.length} 个项目选择信息：`);

    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'selector-container';

    const allSelections = [];

    for (let i = 0; i < result.intents.length; i++) {
      const intentItem = result.intents[i];
      const selections = {};

      const intentSection = document.createElement('div');
      intentSection.style.marginBottom = '20px';
      intentSection.style.padding = '16px';
      intentSection.style.background = 'rgba(0, 122, 255, 0.05)';
      intentSection.style.borderRadius = '12px';
      intentSection.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 12px; color: #007AFF;">
          ${i + 1}. ${intentItem.params.name || '新项目'}
        </div>
      `;

      for (const field of intentItem.missingFields) {
        const selectorCard = document.createElement('div');
        selectorCard.className = 'selector-card';

        let title = '';
        let options = [];

        if (field === 'handler' || field === 'tester') {
          title = field === 'handler' ? '👤 选择处理人' : '🧪 选择测试人';
          options = await this.assistant.fetchUsers();

          selectorCard.innerHTML = `
            <div class="selector-card-title">${title}</div>
            <div class="selector-options" data-intent-index="${i}" data-field="${field}">
              ${options.map(user => `
                <div class="selector-option" data-value="${user.id}">
                  ${user.name}
                </div>
              `).join('')}
            </div>
          `;
        } else if (field === 'iterationId') {
          title = '🎯 选择迭代';
          options = await this.assistant.fetchIterations();

          selectorCard.innerHTML = `
            <div class="selector-card-title">${title}</div>
            <div class="selector-options" data-intent-index="${i}" data-field="${field}">
              ${options.map(iter => `
                <div class="selector-option" data-value="${iter.id}">
                  ${iter.name}
                  <div style="font-size: 11px; color: #86868b; margin-top: 4px;">
                    ${iter.start} ~ ${iter.end}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }

        intentSection.appendChild(selectorCard);

        const optionsContainer = selectorCard.querySelector('.selector-options');
        optionsContainer.addEventListener('click', (e) => {
          const option = e.target.closest('.selector-option');
          if (!option) return;

          optionsContainer.querySelectorAll('.selector-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          option.classList.add('selected');

          selections[field] = option.dataset.value;

          allSelections[i] = selections;

          const allComplete = result.intents.every((intent, idx) => {
            return intent.missingFields.every(f => allSelections[idx] && allSelections[idx][f]);
          });

          confirmBtn.disabled = !allComplete;
        });
      }

      selectorContainer.appendChild(intentSection);
      allSelections[i] = selections;
    }

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'selector-confirm-btn';
    confirmBtn.textContent = `确认创建 (${result.intents.length} 项)`;
    confirmBtn.disabled = true;

    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = '创建中...';

      const finalResult = await this.assistant.completeSelectionsAndExecute(allSelections);

      selectorContainer.remove();

      if (finalResult.success) {
        if (finalResult.isMultiple) {
          finalResult.results.forEach(r => this.displaySingleResult(r));
        } else {
          this.displaySingleResult(finalResult.results[0]);
        }
      } else {
        this.addAIMessage(`❌ ${finalResult.message}`);
      }
    });

    selectorContainer.appendChild(confirmBtn);
    content.appendChild(selectorContainer);
    content.scrollTop = content.scrollHeight;
  }

  displaySingleResult(result) {
    if (result.success) {
      const intentConfig = INTENT_MAP[result.intent];
      
      if (intentConfig && intentConfig.isQuery) {
        this.displayQueryResult(result);
      } else {
        const message = `✅ ${this.assistant.getSingleSuccessMessage(result.intent, result.data)}`;
        this.addAIMessage(message);

        if (result.intent.includes('创建')) {
          this.showJumpCard(result);
        }

        this.triggerPageRefresh(result.intent);
      }
    } else {
      this.addAIMessage(`❌ ${result.intent} 失败: ${result.error}`);
    }
  }

  displayQueryResult(result) {
    const intentConfig = INTENT_MAP[result.intent];
    const dataType = intentConfig.dataType;

    // 报工查询特殊处理
    if (dataType === 'reportWork') {
      this.showReportWorkResult(result);
      return;
    }

    let analysis;
    if (dataType === 'stories' || dataType === 'tasks') {
      analysis = DataAnalyzer.analyzeStories(result.data);
    } else if (dataType === 'bugs') {
      analysis = DataAnalyzer.analyzeBugs(result.data);
    } else {
      let items = [];
      if (result.data.pageData) {
        items = result.data.pageData;
      } else if (result.data.obj?.pageData) {
        items = result.data.obj.pageData;
      } else if (result.data.obj?.list) {
        items = result.data.obj.list;
      } else if (Array.isArray(result.data.obj)) {
        items = result.data.obj;
      } else if (Array.isArray(result.data)) {
        items = result.data;
      }
      analysis = { stats: { total: items.length }, items };
    }

    this.showStatsPanel(analysis.stats, dataType);

    if (analysis.items && analysis.items.length > 0) {
      this.showDataTable(analysis.items, dataType);
    } else {
      this.addAIMessage('📭 未找到符合条件的数据');
    }
  }

  showReportWorkResult(result) {
    const projects = result.data.data?.userBgtList || [];
    const totalDays = projects.reduce((sum, p) => sum + parseFloat(p.DL_WORKDAYS || 0), 0);

    const stats = {
      total: projects.length,
      totalDays: totalDays
    };

    this.showStatsPanel(stats, 'reportWork');

    if (projects.length > 0) {
      this.showDataTable(projects, 'reportWork');
    } else {
      this.addAIMessage('📭 未找到报工记录');
    }
  }

  showStatsPanel(stats, dataType) {
    const content = document.getElementById('responseContent');
    const statsPanel = document.createElement('div');
    statsPanel.className = 'stats-panel';

    let statsHTML = `
      <div class="stats-header">📊 数据统计</div>
      <div class="stats-grid">
    `;

    if (dataType === 'reportWork') {
      statsHTML += `
        <div class="stat-card">
          <div class="stat-label">总工作天数</div>
          <div class="stat-value">${stats.totalDays.toFixed(1)}<span class="stat-unit">天</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">项目数量</div>
          <div class="stat-value">${stats.total}<span class="stat-unit">个</span></div>
        </div>
      `;
    } else {
      statsHTML += `
        <div class="stat-card">
          <div class="stat-label">总数</div>
          <div class="stat-value">${stats.total}<span class="stat-unit">项</span></div>
        </div>
      `;

      if (stats.totalEffort !== undefined) {
        statsHTML += `
          <div class="stat-card">
            <div class="stat-label">总工时</div>
            <div class="stat-value">${stats.totalEffort}<span class="stat-unit">小时</span></div>
          </div>
        `;
      }

      if (stats.byStatus) {
        Object.entries(stats.byStatus).forEach(([status, count]) => {
          statsHTML += `
            <div class="stat-card">
              <div class="stat-label">${DataAnalyzer.getStatusLabel(status)}</div>
              <div class="stat-value">${count}<span class="stat-unit">项</span></div>
            </div>
          `;
        });
      }

      if (stats.byPriority) {
        Object.entries(stats.byPriority).forEach(([priority, count]) => {
          statsHTML += `
            <div class="stat-card">
              <div class="stat-label">优先级${DataAnalyzer.getPriorityLabel(priority)}</div>
              <div class="stat-value">${count}<span class="stat-unit">项</span></div>
            </div>
          `;
        });
      }

      if (stats.bySeverity) {
        Object.entries(stats.bySeverity).forEach(([severity, count]) => {
          statsHTML += `
            <div class="stat-card">
              <div class="stat-label">${DataAnalyzer.getSeverityLabel(severity)}</div>
              <div class="stat-value">${count}<span class="stat-unit">项</span></div>
            </div>
          `;
        });
      }
    }

    statsHTML += '</div>';
    statsPanel.innerHTML = statsHTML;
    content.appendChild(statsPanel);
    content.scrollTop = content.scrollHeight;
  }

  showDataTable(items, dataType) {
    const content = document.getElementById('responseContent');
    const tableContainer = document.createElement('div');
    tableContainer.className = 'data-table-container';

    // 动态生成表头 - 根据数据类型
    const allKeys = new Set();
    items.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    const fieldMap = {
      'name': '名称',
      'S_BGTNAME': '项目名称',
      'DL_WORKDAYS': '工作天数',
      'DT_STARTDATE': '开始时间',
      'DT_ENDDATE': '结束时间',
      'S_BGTOWNER': '负责人',
      'status': '状态',
      'priority': '优先级',
      'severity': '严重程度',
      'handler': '处理人',
      'handlers': '处理人',
      'effort': '工时',
      'start': '开始日期',
      'end': '结束日期'
    };

    let displayFields = [];
    if (dataType === 'reportWork') {
      displayFields = ['S_BGTNAME', 'DL_WORKDAYS', 'DT_STARTDATE', 'DT_ENDDATE', 'S_BGTOWNER'];
    } else if (dataType === 'stories' || dataType === 'tasks') {
      displayFields = ['name', 'status', 'priority', 'handlers', 'effort', 'start', 'end'];
    } else if (dataType === 'bugs') {
      displayFields = ['name', 'severity', 'status', 'handlers', 'effort'];
    } else {
      // 动态列：显示所有非系统字段
      displayFields = Array.from(allKeys).filter(key => 
        !key.startsWith('_') && 
        !key.includes('Id') && 
        key !== 'id' &&
        typeof items[0][key] !== 'object'
      );
    }

    let tableHTML = '<div><table class="data-table"><thead><tr>';
    
    displayFields.forEach(field => {
      const label = fieldMap[field] || field;
      tableHTML += `<th>${label}</th>`;
    });

    tableHTML += '</tr></thead><tbody>';

    items.forEach(item => {
      tableHTML += '<tr>';
      
      displayFields.forEach(field => {
        let value = item[field];
        let displayValue = '';

        if (field === 'status') {
          displayValue = `<span class="status-badge status-${value}">${DataAnalyzer.getStatusLabel(value)}</span>`;
        } else if (field === 'priority') {
          displayValue = `<span class="priority-badge priority-${value}">${DataAnalyzer.getPriorityLabel(value)}</span>`;
        } else if (field === 'severity') {
          displayValue = `<span class="severity-badge severity-${value}">${DataAnalyzer.getSeverityLabel(value)}</span>`;
        } else if (field === 'handlers') {
          displayValue = item.handlers?.[0]?.name || '未分配';
        } else if (field === 'DT_STARTDATE' || field === 'DT_ENDDATE') {
          displayValue = this.formatTimestamp(value);
        } else if (field === 'DL_WORKDAYS') {
          displayValue = `${value}天`;
        } else if (field === 'effort') {
          displayValue = `${value}h`;
        } else {
          displayValue = value || '-';
        }

        tableHTML += `<td>${displayValue}</td>`;
      });

      tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table><div>';
    tableContainer.innerHTML = tableHTML;
    content.appendChild(tableContainer);
    content.scrollTop = content.scrollHeight;
  }

  showJumpCard(result) {
    const content = document.getElementById('responseContent');
    const jumpCard = document.createElement('div');
    jumpCard.className = 'jump-card';

    let url = '';
    let title = '';
    const projectId = this.assistant.currentProjectId;

    if (result.intent === '创建需求' && result.data.obj) {
      url = `/#/demandDetail?proId=${projectId}&demandId=${result.data.obj.id}`;
      title = '查看需求详情';
    } else if (result.intent === '创建任务' && result.data.obj) {
      url = `/#/taskDetail?proId=${projectId}&taskId=${result.data.obj.id}`;
      title = '查看任务详情';
    } else if (result.intent === '创建缺陷' && result.data.obj) {
      url = `/#/bugDetail?proId=${projectId}&bugId=${result.data.obj.id}`;
      title = '查看缺陷详情';
    }

    if (url) {
      jumpCard.innerHTML = `
        <div class="jump-card-icon">🔗</div>
        <div class="jump-card-content">
          <div class="jump-card-title">${title}</div>
          <div class="jump-card-desc">${result.params.name}</div>
        </div>
        <div class="jump-card-arrow">→</div>
      `;

      jumpCard.addEventListener('click', () => {
        if(this.isMobile()){
          window.GooseSDK.context.pushWindow({
              url: "Details-index.html",
              passData: {
                  "mobile.issueId": result.data.obj.id
              }
          })
        }else{
          window.open(url, "_blank");
        }
      });

      content.appendChild(jumpCard);
    }
  }

  triggerPageRefresh(intent) {
    const projectId = this.assistant.currentProjectId;

    let newHash = '';

    if (intent.includes('需求')) {
      newHash = `/menu-demand/pm-story?proId=${projectId}`;
    } else if (intent.includes('任务')) {
      newHash = `/menu-demand/pm-task?proId=${projectId}`;
    } else if (intent.includes('缺陷')) {
      newHash = `/menu-demand/pm-bug?proId=${projectId}`;
    } else if (intent.includes('迭代')) {
      newHash = `/menu-demand/pm-iteration?proId=${projectId}`;
    }

    if (newHash && window.amdp && window.amdp.$router) {
      window.amdp.$router.replace('/refresh');
      window.requestAnimationFrame(() => window.amdp.$router.replace(newHash));
    }
  }

  displayMultipleResults(results) {
    let html = '<div>';

    results.forEach((result, index) => {
      const status = result.success ? 'success' : 'error';
      const icon = result.success ? '✅' : '❌';
      html += `
        <div class="intent-item">
          <div class="intent-item-title">${icon} ${result.intent}</div>
          <div class="intent-item-status ${status}">
            ${result.success ? '执行成功' : `失败: ${result.error}`}
          </div>
        </div>
      `;
    });

    html += '</div>';
    this.addAIMessage(html);

    if (results.length > 0 && results[0].intent) {
      this.triggerPageRefresh(results[0].intent);
    }
  }

  newSession() {
    this.assistant.newSession();
    document.getElementById('responseContent').innerHTML = '';
    this.showNotification('🎉 新会话已创建');
    this.addAIMessage('你好！我是 AI 助手,有什么可以帮你的吗？');
  }

  showNotification(message) {
    const notification = document.getElementById('ai-notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTimestamp(timestamp) {
    if (!timestamp) return '未设置';
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
    } catch (e) {
      return '格式错误';
    }
  }
}

// ==================== 初始化 ====================
let aiAssistant, aiUI;

function initAIAssistant() {
  aiAssistant = new ProjectAIAssistant();
  aiUI = new AIAssistantUI(aiAssistant);
  
  console.log('✨ AI 助手已就绪');
  console.log('📋 当前项目ID:', aiAssistant.currentProjectId);
  console.log('👤 当前用户ID:', aiAssistant.currentUserId);
  
  aiAssistant.fetchUsers().then(users => {
    if (users.length > 0) {
      console.log(`✅ 成功加载用户列表 (${users.length} 人)`, users.slice(0, 3).map(u => u.name).join(', '), '...');
    } else {
      console.warn('⚠️ 用户列表为空');
    }
  });
  
  aiAssistant.fetchIterations().then(iterations => {
    if (iterations.length > 0) {
      console.log(`✅ 成功加载迭代列表 (${iterations.length} 个)`, iterations.slice(0, 3).map(i => i.name).join(', '), '...');
    } else {
      console.warn('⚠️ 迭代列表为空');
    }
  });

  setTimeout(() => {
    const chatWrapper = document.querySelector('.chat-wrapper');
    if (chatWrapper) {
      chatWrapper.remove();
    }
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAIAssistant);
} else {
  initAIAssistant();
}

window.aiAssistant = aiAssistant;
window.aiUI = aiUI;