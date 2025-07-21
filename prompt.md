任务：统一应用的唯一标识为appID，可以通过appID获取应用的元数据。目前应用的唯一标识不统一；
    - /ai-server/下的应用管理元数据
    - 应用管理/omni/pages/app-management.html
    - 新建应用/omni/pages/app-create.html
    - 应用开发侧工作台/omni/app-workspace-dev.html
    - 生产门户 /omni/production-portal.html的工作台和应用管理、
    - 应用工作台运维运营侧 /omni/app-workspace-ops.html

1. 将以上功能模块、数据的唯一标识统一为appID；
2. 新建应用后，自动生成唯一标识appID，并通过window.open打开应用开发侧工作台，打开的时候通过queryString传递appid；
3. 在开发门户、生成门户的应用管理页面，点击某个应用时，通过window.open打开应用开发侧工作台，打开的时候通过queryString传递appid；
4. 应用开发侧工作台通过queryString的appid，从ai-server加载页面元数据，并暴露到window.appMetadata下，并在页面对应的地方进行数据返显；


任务：目前生产门户的数据是假的，需要从后端加载真实应用列表。
1. 生产门户的“监控概览”改名为“工作台”，其“快速操作”及其相应代码删除；
2. 生成门户的应用管理从后台加载真实数据，租户信息可以从localStroage.getItem('tenantId')获取



任务：构建应用与知识库关联

1. 新建任务的时候，会新建对应的知识库分类

//请求
fetch("/ai/v1/rag/category", {
  "headers": {
    "authorization": `bearer ${localstroage.getItem('token')}`
  },
  "body": `{"name":"${appID}"}`,
  "method": "PUT",
  "mode": "cors",
  "credentials": "include"
});

//返回
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "id": "304204669134204928", //这个知识库分类列表ID要存到应用元数据中
        "tenantId": "tenant-G98BgH",
        "name": appID,
        "parentId": null,
        "personal": null,
        "createdAt": null,
        "author": "A3805-黎健成",
        "updatedAt": null,
        "updater": "A3805-黎健成"
    }
}

当用户打开应用工作台的时候，这些ID可以从window.appMetadata获取。


2. 应用工作台下的文档管理界面：/development/data-process/knowledge.html的左侧分类列表从真实接口加载：

请求
fetch(`/ai/v1/rag/knowledge/library/list?categoryId=${知识库分类列表ID}&pageNum=1&pageSize=10`, {
  "headers": {
    "authorization": `bearer ${localstroage.getItem('token')}`
  },
  "method": "GET",
});

返回
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "result": [
            {
                "id": "303656176757911552",//这个是某一分类ID，即libraryId
                "tenantId": "tenant-G98BgH",
                "embeddingModel": "BAAI/bge-m3",
                "name": "地方性法规",
                "description": "",
                "categoryId": "303027374482763776",
                "personal": null,
                "createdAt": "2025-07-18 11:22:14",
                "author": "A3805-黎健成",
                "updatedAt": "2025-07-18 11:22:14",
                "updater": "A3805-黎健成"
            },
            …
        ],
        "totalElements": 6,
        "totalPage": 1,
        "pageSize": 10,
        "pageNum": 1
    }
}

右侧的文档列表，原型图参考/prototype/knowledge.png：
请求：
fetch(`/ai/v1/rag/knowledge/document/list?libraryId=${libraryId}&pageNum=1&pageSize=10`, {
  "headers": {
    "authorization": `bearer ${localstroage.getItem('token')}`
  },
  "method": "GET",
});

返回：
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "result": [
            {
                "id": "303773838104227840",
                "libraryId": "303656176757911552",
                "name": "云南省巍山彝族回族自治县彝族打歌保护传承条例.docx",
                "description": null,
                "contentType": "word",
                "splitterType": "recursive",
                "suffix": "docx",
                "size": "0.019M",
                "enableStatus": 1,
                "startTime": null,
                "endTime": null,
                "status": "failed",
                "hash": "1435200e264728b775878316aceb672070e7d1bfebd91ffa4954b8fcb996def6",
                "uploadPath": "/akb/static/303656176757911552/word/303773838104227840/1435200e264728b775878316aceb672070e7d1bfebd91ffa4954b8fcb996def6.docx",
                "createdAt": "2025-07-18 19:09:46",
                "author": "A3805-黎健成",
                "updatedAt": "2025-07-18 19:09:48",
                "updater": "A3805-黎健成",
                "metadata": []
            }
            …
        ],
        "totalElements": 4780,
        "totalPage": 478,
        "pageSize": 10,
        "pageNum": 1
    }
}



任务：完整应用工作台下的文档管理界面/development/data-process/knowledge.html的左侧分类列表从真实接口加载：

1. 界面风格参考/omni/lui-market.html，右侧列表参考/prototype/knowledge.png

2. 分类列表实现增删查改的功能，接口如下：

新增分类，请求：
fetch("/ai/v1/rag/knowledge/library", {
  "headers": {
     "authorization": `bearer ${localstroage.getItem('token')}`
  },
  "body": `{"name":"${分类名称}","description":"${描述}","categoryId":"${categoryId}","embeddingModel":"BAAI/bge-m3"}`,
  "method": "PUT",
});

响应：
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "id": "304213674468470784",//分类ID，即libraryId
        "tenantId": "tenant-G98BgH",
        "embeddingModel": "BAAI/bge-m3",
        "name": "知识库明",
        "description": "Hello",
        "categoryId": "304211049555587072",
        "personal": null,
        "createdAt": null,
        "author": "A3805-黎健成",
        "updatedAt": null,
        "updater": "A3805-黎健成"
    }
}


编辑：
fetch(`/ai/v1/rag/knowledge/library/${libraryId}`, {
  "headers": {
     "authorization": `bearer ${localstroage.getItem('token')}`
  },
  "body": `{"name":"${分类名称}","description":"${描述}","categoryId":"${categoryId}","embeddingModel":"BAAI/bge-m3"}`,m
  "method": "POST",
});


响应：
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "id": "304213674468470784",
        "tenantId": "tenant-G98BgH",
        "embeddingModel": "BAAI/bge-m3",
        "name": "知识库明",
        "description": "Hello",
        "categoryId": "304211049555587072",
        "personal": null,
        "createdAt": "2025-07-20 00:17:32",
        "author": null,
        "updatedAt": "2025-07-20 00:17:32",
        "updater": "A3805-黎健成"
    }
}


删除
请求：
fetch(`/ai/v1/rag/knowledge/library/${libraryId}`, {
  "headers": {
    "authorization": "bearer jyDLs9RjqCa/f9kbqbOpzsW0h9Q=",
  },
  "method": "DELETE",
});

响应
{
    "code": "000000",
    "message": "操作成功",
    "data": null
}


任务：完整应用工作台下的文档管理界面/development/data-process/knowledge.html的右侧文档列表调用真实接口：

1. 删除文件

请求：
fetch(`/ai/v1/rag/knowledge/document/${documentId}`, {
  "headers": {
     "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "method": "DELETE",
});

返回：
{
    "code": "000000",
    "message": "操作成功",
    "data": null
}


2. 上传文档，分为两个步骤，第一个步骤需要把文件进行上传，第二个步骤，需要把文档进行切片；

上传文档，支持批量上传
请求：
fetch("/ai/v1/rag/knowledge/document/upload", {
  "headers": {
      "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "body": "------WebKitFormBoundaryqXf1GzCopCraBHoD\r\nContent-Disposition: form-data; name=\"file\"; filename=\"input.pptx\"\r\nContent-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n\r\n\r\n------WebKitFormBoundaryqXf1GzCopCraBHoD\r\nContent-Disposition: form-data; name=\"libraryId\"\r\n\r\n304224075348340736\r\n------WebKitFormBoundaryqXf1GzCopCraBHoD--\r\n",
  "method": "POST",
});

返回
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "id": "304398854135115776",//这个是documentId
        "libraryId": "304224075348340736",
        "name": "input.pptx",
        "description": null,
        "contentType": "ppt",
        "splitterType": "recursive",
        "suffix": "pptx",
        "size": "2.212M",
        "enableStatus": 1,
        "startTime": null,
        "endTime": null,
        "status": "init",
        "hash": "039105890d10739b555f865f57b753744e77c9d0cd9ee3569cab546cdbe04cd0",
        "uploadPath": "/akb/static/304224075348340736/ppt/304398854135115776/039105890d10739b555f865f57b753744e77c9d0cd9ee3569cab546cdbe04cd0.pptx",
        "createdAt": null,
        "author": "A3805-黎健成",
        "updatedAt": null,
        "updater": "A3805-黎健成",
        "metadata": []
    }
}

文档切片，需要逐个文档进行切片
请求
fetch("/ai/v1/rag/knowledge/document/execute", {
  "headers": {
      "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "body": `[{"id": "${documentId}","splitterType": "recursive"}]`,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});

响应
{
    "code": "000000",
    "message": "操作成功",
    "data": null
}

1. 左侧列表支持滚动加载，右侧列表支持分页加载；
2. 参考/omni/lui-market.html，把所有的aler都改成确认弹窗；

1. 分类列表明明已经加载完了，还是显示正在加载更多，请你你可以通过/ai/v1/rag/knowledge/library/list返回的data.totalElements判断是否已经完列表的所有数据；
2. 取消“全部文档”分类，默认选中第一个分类；
3. 表格可以弄紧凑点，支持横向滚动，除文件名外的列不换行；
4. 表格按照\prototype\knowledge.png原型图那样，支持翻页；


1. 点击表格中的文件名时，通过window.open打开 /knowledge/preview/${documentId}，进行文档预览；
2. 点击操作列中的“查看切片”，可以查看切片列表和查看切片内容；

切片列表：
请求：
fetch(`/ai/v1/rag/knowledge/document/slices?knowledgeId=${documentId}&libraryId=${libraryId}&pageNumber=1&pageSize=20`, {
  "headers": {
   "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});

响应：
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "result": [
            {
                "id": "1wVpJpgBrP30Xiq03cPz",
                "libraryId": "304224075348340736",
                "knowledgeId": "304420206619553792",
                "segmentId": 0,
                "name": null,
                "uploadPath": null,
                "segmentContent": "**大模型应用建设项目可行性分析报告**\n\n数据金融部\n\n2025年06月24日\n\n**一、项目定义**\n\n项目申请部门：数据金融部\n\n项目名称：大模型应用建设项目\n\n项目预算：215万元\n\n项目类型：应用开发类\n\n项目级别：Ⅰ级项目\n\n**二、项目概述**\n\n1.项目背景\n\n当前金融行业加速智能化转型，生成式人工智能已成为科技行业的焦点，其应用显著提升了工作效率，降低了行业内运维、运营及开发成本。众多金融机构也在积极探索AI在各领域的赋能，大模型技术已成为智能金融转型核心引擎。\n\n我行现有系统智能化水平低，大量工作依赖人工，处理效率低。在信息化进程中积累了大量且丰富的各类数据资源和业务文档，但缺乏有效的智能化工具来充分发挥这些资源的价值。如何高效地利用人工智能技术，特别是大模型技术，来提升客户服务质量、运营效率和业务创新能力，不仅是响应金融科技发展趋势的体现，更是深化我行数字化转型、推动未来业务发展及优化内部运营管理的关键所在。\n\n经过对行业和同业的深入调研，在人工智能快速发展的大背景下，大模型应用的建设已成为银行业不可或缺的基础性工作。大模型不仅能够释放数据要素的价值，提升信息处理的效率和准确性，还能够为银行的决策提供智能化支持，推动业务创新。\n\n构建\"平台+场景\"的大模型应用体系，将先进的AI算法能力与银行业务场景进行深度融合，打通智能化服务体系，提供知识问答、智能问数、智能助手等一站式AI集成环境，满足海量数据智能处理、高效决策支持、统一用户体验，全面提升智能化服务能力，更低成本满足业务高效性、敏捷性需求，助力数据价值发掘，智能化运营降本提效，赋能业务创新发展。\n\n2.项目目标\n\n大模型应用建设项目遵循立足长远、全面规划、整体设计的原则，为实现AI能力的快速交付提供智能化支撑。更好的支持我行智能化转型的落地实施，满足大幅增加的智能服务需求，重点解决我行面临的核心痛点问题，建设具备大规模语言模型推理、知识检索、智能问答等能力的企业级AI基础设施，涵盖自然语言处理、多模态交互、智能分析等技术，能满足多场景应用的统计分析与业务建模及国产化的要求，为各业务系统和企业内各应用场景提供开箱即用的安全高效便捷的AI服务能力。\n\n为实现这一目标，主要围绕以下四点进行建设：",
                "size": 948,
                "metadata": {},
                "score": null
            }
        ],
        "totalElements": 14,
        "totalPage": 1,
        "pageSize": 20,
        "pageNum": 1
    }
}


1. 当我上传多个文档的时候，希望能看到上传进度；
2. 点击了查看切片不是单纯调用接口，而是要显示列表和查看切片内容出来。


1. 查看切片的弹窗样式乱了。弹窗的size默认为 90vw、80vh，标题的关闭按钮不应该换行； modal-overlay要active的时候 才会显示；弹窗内容的bg是#505050；
2. 明明后台返回了列表，却显示“该文档暂无切片数据”；


1. 切片列表应该像文档表格那样，有个pagination-container那个的功能；
2. viewSliceContent只需要传ID就行了，通过ID去查segmentContent的内容；
3. 多重弹窗，z-index和backdrop；



“查看切片”隔壁，增加一个问答对的入口
  - 点击之后，进入生成问答对，配置项直接参考 /development/data-process/qa-generation.html 问答对生成配置 部分；
  - 下面是问答对列表，你先生成10条模拟数据；
  - 用户可以点击某一个问答对，然后进行编辑修改；


任务：实现“知识库”和“向量检索配置”的功能联动、前后端对接和界面风格统一
1. 当在\development\data-process\knowledge.html左侧新建分类的时候，同时新建向量检索配置：

请求：
fetch("/ai/v1/rag/scenario/", {
  "headers": {
    "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "body": `{"name":"分类名称","description":"分类描述","embeddingModel":"BAAI/bge-m3","rerankModel":"BAAI/bge-reranker-v2-m3","libraryId":"分类Id","chunkSize":2048,"splitterType":"recursive","chunkOverlap":0.1,"topK":5,"similarityThreshold":0.75,"embedRatio":0.6,"contentRatio":0.4,"templateCode":"internal-knowledge"}`,
  "method": "POST",
});

响应：
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "id": "304522391315443712",//向量检索配置的Id
        "templateCode": "internal-knowledge",
        "name": "名称",
        "description": "描述",
        "embeddingModel": "BAAI/bge-m3",
        "rerankModel": "BAAI/bge-reranker-v2-m3",
        "libraryId": "分类Id",
        "status": "draft",
        "chunkSize": 2048,
        "splitterType": "recursive",
        "chunkOverlap": 0.1,
        "topK": 5,
        "similarityThreshold": 0.75,
        "embedRatio": 0.6,
        "contentRatio": 0.4,
        "createdAt": null,
        "author": "A3805-黎健成",
        "updatedAt": null,
        "updater": "A3805-黎健成"
    }
}

2. 然后在批量删除、批量切片隔壁增加“向量检索配置”的入口，点击交互等下说。

3. 当删除分类前，先删除向量检索配置

请求：
fetch(`/ai/v1/rag/scenario/${id}?tenantId=${tenantId}`, {
  "headers": {

   "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "method": "DELETE",
});

响应
{
    "code": "000000",
    "message": "操作成功",
    "data": null
}


当二次打开页面的时候，可以通过接口fetch(`/ai/v1/rag/scenario/list?tenantId=${tenantId}&pageNum=1&pageSize=12&keyword=&libraryId=${分类Id}&status=", {
  "headers": {
     "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "method": "GET",
});


查询到对应分类下的向量检索配置信息
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "result": [
            {
                "id": "304514318651781120",
                "templateCode": "internal-knowledge",
                "name": "助手名称",
                "description": "助手描述",
                "embeddingModel": "BAAI/bge-m3",
                "rerankModel": "BAAI/bge-reranker-v2-m3",
                "libraryId": "303355085340160000",
                "status": "draft",
                "chunkSize": 2048,
                "splitterType": "paragraph",
                "chunkOverlap": 0.1,
                "topK": 5,
                "similarityThreshold": 0.75,
                "embedRatio": 0.6,
                "contentRatio": 0.4,
                "createdAt": "2025-07-20 20:12:11",
                "author": "A3805-黎健成",
                "updatedAt": "2025-07-20 20:12:11",
                "updater": "A3805-黎健成"
            }
        ],
        "totalElements": 1,
        "totalPage": 1,
        "pageSize": 12,
        "pageNum": 1
    }
}


任务：完成知识库下的向量配置的交互
1. 当在知识库点击“向量检索配置的时候”，通过window.open self的形式，打开向量检索配置界面/development/data-process/scenario-detail.html，并通过queryString把向量检索配置ID带过去，页面加载后能通过ID调用api查询fetch(`/ai/v1/rag/scenario/${向量检索配置ID}`, {
  "headers": {
     "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "method": "GET",
});加载到配置项{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "id": "304529521640632320",
        "templateCode": "internal-knowledge",
        "name": "公司制度0720",
        "description": "公司制度0720",
        "embeddingModel": "BAAI/bge-m3",
        "rerankModel": "BAAI/bge-reranker-v2-m3",
        "libraryId": "304529519551868928",
        "status": "draft",
        "chunkSize": 2048,
        "splitterType": "recursive",
        "chunkOverlap": 0.1,
        "topK": 5,
        "similarityThreshold": 0.75,
        "embedRatio": 0.6,
        "contentRatio": 0.4,
        "createdAt": "2025-07-20 21:12:35",
        "author": "A3805-黎健成",
        "updatedAt": "2025-07-20 21:12:35",
        "updater": "A3805-黎健成"
    }
}，并进行页面回显。


任务：完善页面/development/data-process/scenario-detail.html
1. 将页面的视觉风格进行统一；
2. 将后端返回的配置参数如实地回显到界面；
3. 保存按钮真实可用

请求：

fetch("`/ai/v1/rag/scenario/${向量检索配置ID}`, {
  "headers": {
     "authorization": `bearer ${localStorage.getItem('token')}`
  },
  "body": `{"id":"${向量检索配置ID}","templateCode":"internal-knowledge","name":"公司制度-Agree","description":"公司制度-Agree","embeddingModel":"BAAI/bge-m3","rerankModel":"BAAI/bge-reranker-v2-m3","libraryId":"304531079489024000","status":"draft","chunkSize":2048,"splitterType":"recursive","chunkOverlap":0.1,"topK":5,"similarityThreshold":0.75,"embedRatio":0.6,"contentRatio":0.4,"createdAt":"2025-07-20 21:18:47","author":"A3805-黎健成","updatedAt":"2025-07-20 21:18:47","updater":"A3805-黎健成"}`,
  "method": "PUT",
});

返回
{
    "code": "000000",
    "message": "操作成功",
    "data": {
        "id": "304531081540038656",
        "templateCode": "internal-knowledge",
        "name": "公司制度-Agree",
        "description": "公司制度-Agree",
        "embeddingModel": "BAAI/bge-m3",
        "rerankModel": "BAAI/bge-reranker-v2-m3",
        "libraryId": "304531079489024000",
        "status": "draft",
        "chunkSize": 2048,
        "splitterType": "recursive",
        "chunkOverlap": 0.1,
        "topK": 5,
        "similarityThreshold": 0.75,
        "embedRatio": 0.6,
        "contentRatio": 0.4,
        "createdAt": "2025-07-20 21:18:47",
        "author": "A3805-黎健成",
        "updatedAt": "2025-07-20 21:54:09",
        "updater": "A3805-黎健成"
    }
}

1. 我把背景色去掉了，请你把字体颜色进行用白色，按钮用透明，参考/development/ability-center/prompt-template-editor.html的视觉风格，但是不要有transfromY的动画
2. 页面上的静态配置可能跟后端返回的数据匹配，请你以后端返回的配置为准，改下前端的静态配置项，包括但不限于：Embedding 模型选择、Rerank 模型选择等。



任务：修复向量配置界面development\data-process\scenario-detail.html数据回显和保存问题
描述：点击“保存为草稿”的时候，提示"向量模型: BAAI/bge-reranker-v2-m3不存在"，通过调用“ai/v1/rag/scenario/${configId}”查询到的返回内容是：{
  "code": "000000",
  "message": "操作成功",
  "data": {
    "id": "304531133528436736",
    "templateCode": "internal-knowledge",
    "name": "部门制度-Agree",
    "description": "部门制度-Agree",
    "embeddingModel": "BAAI/bge-m3",
    "rerankModel": "BAAI/bge-reranker-v2-m3",
    "libraryId": "304531126905630720",
    "status": "draft",
    "chunkSize": 2048,
    "splitterType": "recursive",
    "chunkOverlap": 0.1,
    "topK": 5,
    "similarityThreshold": 0.75,
    "embedRatio": 0.6,
    "contentRatio": 0.4,
    "createdAt": "2025-07-20 21:19:00",
    "author": "A3805-黎健成",
    "updatedAt": "2025-07-20 21:19:00",
    "updater": "A3805-黎健成"
  }
}，保存的时候，提交的内容是：{
  "id": "304531133528436736",
  "templateCode": "internal-knowledge",
  "name": "部门制度-Agree",
  "description": "部门制度-Agree",
  "embeddingModel": "BAAI/bge-reranker-v2-m3",
  "rerankModel": "BAAI/bge-reranker-v2-m3",
  "libraryId": "304531126905630720",
  "status": "draft",
  "chunkSize": 2000,
  "splitterType": "recursive",
  "chunkOverlap": 0.1,
  "topK": 5,
  "similarityThreshold": 0.75,
  "embedRatio": 0.6,
  "contentRatio": 0.4,
  "createdAt": "2025-07-20 21:19:00",
  "author": "A3805-黎健成",
  "updatedAt": "2025-07-20 21:19:00",
  "updater": "A3805-黎健成"
}
原因：
  - 1. 数据回显出了问题，目前界面上配置没有严格按照返回的数据进行一比一显示在界面上，例如embeddingModel、rerankModel、chunkSize，实际上界面上都是示例假数据，你可以按照实际情况动态重新生成的；
  - 2. 保存的时候，从配置项获取没有从界面上重新获取，或者获取错误。


还是不对，“embeddingModel”是"BAAI/bge-m3"，"rerankModel"才是"BAAI/bge-reranker-v2-m3",请你继续检查逻辑是否有问题


任务：统一向量检索评估效果界面/data-process/evaluation.html与向量配置界面development\data-process\scenario-detail.html视觉统一