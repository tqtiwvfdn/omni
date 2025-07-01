# 给企业发消息

地址：https://47.107.105.70:443/ai-workchat/{api}


## 后端
使用示例:
1. 发送单条消息:
   POST /send-message
   Content-Type: application/json
   {
     "userId": "A3805",
     "message": "你好",
     "domain": "lui.awebide.com"
   }

2. 批量发送消息:
   POST /send-batch-message
   Content-Type: application/json
   {
     "userIds": ["A3805", "B1234", "C5678"],
     "message": "群发消息内容",
     "domain": "lui.awebide.com"
   }



## 前端
从localStroage.getItem('userName')获取当前用ID


## domain
- 当domain为 `lui.awebide.com`，企业微信的应用为赞同智言银行
- 当domain为 `www.aui2.cn`，企业微信的应用为赞同研发协作平台


## 调用示例
```java
request({
    method: 'POST',
    uri: url,
    "rejectUnauthorized": false, //这个必填
    headers: {
        'content-type': 'application/json;charset=UTF-8',  //这个必填
    },
    body:JSON.stringify(data) // 序列化内容
});
```