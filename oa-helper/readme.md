## 给企业发消息

地址：https://47.107.105.70:443/ai-workchat/{api}


# 后端
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



# 前端
从localStroage.getItem('userName')获取当前用ID