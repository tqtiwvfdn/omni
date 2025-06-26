# 微信服务号管理平台

🤖 基于 Koa2 的微信服务号完整解决方案，支持消息接收、网页授权、用户管理和消息推送功能。

## ✨ 功能特性

- 🔐 **微信服务号接入验证** - 自动处理Token验证和消息加密解密
- 👤 **网页授权获取OpenID** - 完整的OAuth2.0授权流程
- 💬 **智能消息处理** - 支持文本、图片、事件等多种消息类型
- 📧 **多种消息推送** - 客服消息、模板消息、批量群发
- 🎛️ **可视化管理界面** - Web管理后台，操作简单直观
- 🔄 **自动Token管理** - Access Token自动获取和刷新
- 📊 **用户信息存储** - 用户数据管理和查询

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- 微信服务号（已认证）
- 服务器支持HTTPS（生产环境必需）

### 安装依赖

```bash
npm install koa @koa/router koa-bodyparser axios xml2js crypto
```

### 配置信息

项目中的微信配置信息已预设：

```javascript
const WECHAT_CONFIG = {
  appId: 'wx082748f4d9460c7a',
  appSecret: '353af0d792377c208395084e1b847eb5',
  token: 'Kinsueng',
  encodingAESKey: 'L2tBWXECl1ioWAWQPybBrGisxhtSO9FbadYcQcV6J8K',
};
```

### 启动服务

```bash
node app.js
```

服务将在端口 **4002** 启动，访问 `http://localhost:4002/workchat/` 查看管理界面。

## 🔧 微信公众号配置

### 1. 服务器配置

在微信公众号后台进行以下配置：

- **服务器URL**: `https://你的域名/workchat/verify`
- **Token**: `Kinsueng`
- **EncodingAESKey**: `L2tBWXECl1ioWAWQPybBrGisxhtSO9FbadYcQcV6J8K`
- **消息加解密方式**: 安全模式（推荐）

### 2. 网页授权域名

在微信公众号后台设置网页授权域名：
- 域名：`你的服务器域名`（不包含http://或https://）

### 3. 接口权限

确保开启以下接口权限：
- 网页授权获取用户基本信息
- 客服接口-发消息
- 模板消息接口

## 📡 API 接口

### 微信验证与消息处理

```http
GET  /workchat/verify           # 微信接入验证
POST /workchat/verify           # 微信消息处理
```

### 用户授权

```http
GET  /workchat/auth             # 生成微信授权链接
GET  /workchat/auth/callback    # 微信授权回调处理
```

### 用户管理

```http
GET  /workchat/users            # 获取用户列表
```

### 消息推送

```http
POST /workchat/send/custom      # 发送客服消息
POST /workchat/send/template    # 发送模板消息
POST /workchat/send/batch       # 批量发送消息
```

### 系统状态

```http
GET  /workchat/token/status     # 查看Access Token状态
GET  /workchat/                 # 管理界面首页
```

## 💻 使用示例

### 1. 获取用户OpenID

```javascript
// 生成授权链接
const response = await fetch('/workchat/auth');
const data = await response.json();
// 用户访问 data.authUrl 进行授权
```

### 2. 发送客服消息

```javascript
const response = await fetch('/workchat/send/custom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    openid: '用户的openid',
    message: '您好，这是一条客服消息！'
  })
});
```

### 3. 发送模板消息

```javascript
const response = await fetch('/workchat/send/template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    openid: '用户的openid',
    templateId: '模板ID',
    data: {
      first: { value: '订单提醒' },
      keyword1: { value: '订单号：12345' },
      keyword2: { value: '2024-01-01' },
      remark: { value: '感谢您的购买！' }
    },
    url: 'https://example.com/order/12345'
  })
});
```

### 4. 批量发送消息

```javascript
const response = await fetch('/workchat/send/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    openids: ['openid1', 'openid2', 'openid3'],
    message: '这是一条群发消息！'
  })
});
```

## 🎛️ 管理界面

访问 `http://localhost:4002/workchat/` 可以使用可视化管理界面：

### 功能模块

1. **🔐 微信授权**
   - 一键生成授权链接
   - 弹窗授权流程
   - 自动获取用户信息

2. **📝 消息发送**
   - 客服消息发送
   - 用户选择器
   - 实时发送状态

3. **📧 模板消息**
   - 模板消息配置
   - JSON数据格式化
   - 跳转链接设置

4. **👥 用户管理**
   - 用户列表展示
   - 用户信息查看
   - 快速选择用户

5. **📢 批量消息**
   - 一键群发
   - 发送状态统计
   - 发送详情展示

## 🔄 消息处理流程

### 接收消息流程

1. 微信服务器推送消息到 `/workchat/verify`
2. 系统验证消息签名
3. 解密消息内容（安全模式）
4. 根据消息类型进行处理
5. 生成回复消息并加密返回

### 支持的消息类型

- **文本消息** - 自动回复用户发送的文本
- **图片消息** - 回复感谢信息
- **关注事件** - 发送欢迎消息
- **取消关注** - 记录用户取消关注

## 🔒 安全特性

- ✅ 消息签名验证
- ✅ AES加密解密
- ✅ Token自动刷新
- ✅ 错误处理机制
- ✅ 请求频率控制

## 📁 项目结构

```
project/
├── app.js                 # 主应用文件
├── package.json          # 依赖配置
├── README.md            # 项目说明
└── logs/                # 日志文件（可选）
```

## 🛠️ 开发说明

### 消息处理扩展

在 `processMessage` 函数中添加新的消息类型处理：

```javascript
async function processMessage(msgData) {
  const { MsgType } = msgData;
  
  switch (MsgType) {
    case 'text':
      return handleTextMessage(msgData);
    case 'image':
      return handleImageMessage(msgData);
    case 'voice':
      return handleVoiceMessage(msgData); // 新增语音处理
    // ... 其他消息类型
  }
}
```

### 数据存储

生产环境建议将用户数据存储到数据库：

```javascript
// 替换内存存储为数据库存储
const userStore = new Map(); // 开发环境
// const userStore = new DatabaseStore(); // 生产环境
```

## 🐛 常见问题

### 1. Token验证失败

**问题**: 微信后台提示"Token验证失败"

**解决方案**:
- 检查服务器URL是否正确
- 确认Token配置是否一致
- 检查服务器是否正常运行
- 确认端口是否开放

### 2. 消息发送失败

**问题**: 客服消息发送失败

**解决方案**:
- 检查Access Token是否有效
- 确认用户是否在48小时内与公众号有过交互
- 检查用户OpenID是否正确
- 查看错误日志获取详细信息

### 3. 授权失败

**问题**: 网页授权获取用户信息失败

**解决方案**:
- 检查网页授权域名配置
- 确认AppID和AppSecret正确
- 检查授权回调URL是否正确
- 确认是否使用HTTPS（生产环境）

### 4. 消息解密失败

**问题**: 接收到的消息解密失败

**解决方案**:
- 检查EncodingAESKey是否正确
- 确认消息加解密方式设置
- 检查消息签名验证逻辑
- 查看解密过程的错误日志

## 📝 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🔐 微信服务号接入验证
- 👤 网页授权获取OpenID
- 💬 消息接收和自动回复
- 📧 客服消息和模板消息推送
- 🎛️ 可视化管理界面

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📞 技术支持

如果您在使用过程中遇到问题，可以：

1. 查看常见问题解决方案
2. 提交 Issue 描述问题
3. 查看微信官方开发文档

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！