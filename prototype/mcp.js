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