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