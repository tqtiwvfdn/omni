const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const axios = require('axios');
const crypto = require('crypto');
const xml2js = require('xml2js');

const app = new Koa();
const router = new Router({ prefix: '/workchat' });

// 微信配置信息
const WECHAT_CONFIG = {
  appId: 'wx082748f4d9460c7a',
  appSecret: '353af0d792377c208395084e1b847eb5',
  token: 'Kinsueng',
  encodingAESKey: 'L2tBWXECl1ioWAWQPybBrGisxhtSO9FbadYcQcV6J8K',
};

// 存储access_token（生产环境建议使用Redis）
let globalAccessToken = {
  token: '',
  expiresAt: 0
};

// 存储用户信息（生产环境建议使用数据库）
const userStore = new Map();

// 工具函数：生成签名
function generateSignature(token, timestamp, nonce, encrypt) {
  const tmp = [token, timestamp, nonce, encrypt].sort().join('');
  return crypto.createHash('sha1').update(tmp).digest('hex');
}

// 工具函数：AES解密
function aesDecrypt(encryptedData, encodingAESKey) {
  const key = Buffer.from(encodingAESKey + '=', 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, key.slice(0, 16));
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  // 去除随机字符串
  const content = decrypted.slice(16);
  const length = content.length;
  const networkBytesOrder = content.slice(0, 4);
  const msgLength = parseInt(networkBytesOrder, 10);
  
  return content.slice(4, msgLength + 4);
}

// 工具函数：AES加密
function aesEncrypt(text, encodingAESKey, appId) {
  const randomStr = crypto.randomBytes(16).toString('hex').slice(0, 16);
  const textLength = Buffer.byteLength(text, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(textLength, 0);
  
  const content = randomStr + lengthBuffer.toString('binary') + text + appId;
  
  const key = Buffer.from(encodingAESKey + '=', 'base64');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, key.slice(0, 16));
  let encrypted = cipher.update(content, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return encrypted;
}

// 工具函数：解析XML
async function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// 工具函数：生成XML响应
function generateXMLResponse(data) {
  const builder = new xml2js.Builder({
    rootName: 'xml',
    cdata: true,
    renderOpts: { pretty: false }
  });
  return builder.buildObject(data);
}

// 获取全局access_token
async function getGlobalAccessToken() {
  if (globalAccessToken.token && Date.now() < globalAccessToken.expiresAt) {
    return globalAccessToken.token;
  }
  
  try {
    const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: WECHAT_CONFIG.appId,
        secret: WECHAT_CONFIG.appSecret
      }
    });
    
    if (response.data.access_token) {
      globalAccessToken = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in - 60) * 1000 // 提前60秒过期
      };
      console.log('获取全局access_token成功');
      return globalAccessToken.token;
    } else {
      throw new Error('获取access_token失败: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('获取全局access_token错误:', error.message);
    throw error;
  }
}

// 生成微信授权URL
function generateAuthUrl(redirectUri, state = 'STATE') {
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WECHAT_CONFIG.appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;
}

// 通过code获取用户access_token和openid
async function getUserAccessToken(code) {
  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
      params: {
        appid: WECHAT_CONFIG.appId,
        secret: WECHAT_CONFIG.appSecret,
        code: code,
        grant_type: 'authorization_code'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取用户access_token错误:', error.message);
    throw error;
  }
}

// 获取用户信息
async function getUserInfo(accessToken, openid) {
  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
      params: {
        access_token: accessToken,
        openid: openid,
        lang: 'zh_CN'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取用户信息错误:', error.message);
    throw error;
  }
}

// 发送客服消息
async function sendCustomMessage(openid, message) {
  try {
    const accessToken = await getGlobalAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
    
    const data = {
      touser: openid,
      msgtype: 'text',
      text: {
        content: message
      }
    };
    
    const response = await axios.post(url, data);
    
    if (response.data.errcode === 0) {
      console.log('消息发送成功:', openid);
      return { success: true, data: response.data };
    } else {
      console.error('消息发送失败:', response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.error('发送消息错误:', error.message);
    return { success: false, error: error.message };
  }
}

// 发送模板消息
async function sendTemplateMessage(openid, templateId, data, url = '') {
  try {
    const accessToken = await getGlobalAccessToken();
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;
    
    const postData = {
      touser: openid,
      template_id: templateId,
      url: url,
      data: data
    };
    
    const response = await axios.post(apiUrl, postData);
    
    if (response.data.errcode === 0) {
      console.log('模板消息发送成功:', openid);
      return { success: true, data: response.data };
    } else {
      console.error('模板消息发送失败:', response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.error('发送模板消息错误:', error.message);
    return { success: false, error: error.message };
  }
}

// 微信接入验证路由 (GET请求)
router.get('/verify', async (ctx) => {
  const { signature, timestamp, nonce, echostr } = ctx.query;
  
  console.log('微信验证请求:', { signature, timestamp, nonce, echostr });
  
  // 验证签名
  const token = WECHAT_CONFIG.token;
  const tmpArr = [token, timestamp, nonce].sort();
  const tmpStr = tmpArr.join('');
  const shasum = crypto.createHash('sha1');
  shasum.update(tmpStr);
  const calcSignature = shasum.digest('hex');
  
  if (calcSignature === signature) {
    console.log('微信验证成功');
    ctx.body = echostr;
  } else {
    console.log('微信验证失败');
    ctx.status = 403;
    ctx.body = 'Verification failed';
  }
});

// 微信消息处理路由 (POST请求)
router.post('/verify', async (ctx) => {
  try {
    const { signature, timestamp, nonce, msg_signature } = ctx.query;
    const xmlData = ctx.request.body;
    
    console.log('收到微信消息:', { signature, timestamp, nonce, msg_signature });
    console.log('消息内容:', xmlData);
    
    // 解析XML数据
    const parsedData = await parseXML(xmlData);
    const msgData = parsedData.xml;
    
    let responseMsg = '';
    
    // 如果是加密模式
    if (msg_signature && msgData.Encrypt) {
      // 验证消息签名
      const calcMsgSignature = generateSignature(
        WECHAT_CONFIG.token,
        timestamp,
        nonce,
        msgData.Encrypt
      );
      
      if (calcMsgSignature !== msg_signature) {
        console.log('消息签名验证失败');
        ctx.status = 403;
        return;
      }
      
      // 解密消息
      const decryptedMsg = aesDecrypt(msgData.Encrypt, WECHAT_CONFIG.encodingAESKey);
      const decryptedData = await parseXML(decryptedMsg);
      const realMsgData = decryptedData.xml;
      
      console.log('解密后的消息:', realMsgData);
      
      // 处理消息并生成回复
      const replyMsg = await processMessage(realMsgData);
      
      if (replyMsg) {
        // 加密回复消息
        const encryptedReply = aesEncrypt(replyMsg, WECHAT_CONFIG.encodingAESKey, WECHAT_CONFIG.appId);
        const newTimestamp = Math.floor(Date.now() / 1000).toString();
        const newNonce = Math.random().toString(36).substr(2, 15);
        const newSignature = generateSignature(WECHAT_CONFIG.token, newTimestamp, newNonce, encryptedReply);
        
        responseMsg = generateXMLResponse({
          Encrypt: encryptedReply,
          MsgSignature: newSignature,
          TimeStamp: newTimestamp,
          Nonce: newNonce
        });
      }
    } else {
      // 明文模式或兼容模式
      console.log('明文消息:', msgData);
      responseMsg = await processMessage(msgData);
    }
    
    ctx.type = 'application/xml';
    ctx.body = responseMsg || 'success';
    
  } catch (error) {
    console.error('处理微信消息错误:', error);
    ctx.status = 500;
    ctx.body = 'success'; // 微信要求返回success避免重试
  }
});

// 消息处理函数
async function processMessage(msgData) {
  const { MsgType, FromUserName, ToUserName, Content, CreateTime } = msgData;
  
  console.log('处理消息类型:', MsgType);
  
  switch (MsgType) {
    case 'text':
      // 处理文本消息
      return handleTextMessage(msgData);
    
    case 'event':
      // 处理事件消息
      return handleEventMessage(msgData);
    
    case 'image':
      // 处理图片消息
      return handleImageMessage(msgData);
    
    default:
      console.log('未处理的消息类型:', MsgType);
      return null;
  }
}

// 处理文本消息
function handleTextMessage(msgData) {
  const { FromUserName, ToUserName, Content } = msgData;
  const replyContent = `您发送的消息是: ${Content}`;
  
  const replyMsg = {
    ToUserName: FromUserName,
    FromUserName: ToUserName,
    CreateTime: Math.floor(Date.now() / 1000),
    MsgType: 'text',
    Content: replyContent
  };
  
  return generateXMLResponse(replyMsg);
}

// 处理事件消息
function handleEventMessage(msgData) {
  const { Event, FromUserName, ToUserName } = msgData;
  
  switch (Event) {
    case 'subscribe':
      // 关注事件
      const welcomeMsg = {
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: '欢迎关注我们的服务号！'
      };
      return generateXMLResponse(welcomeMsg);
    
    case 'unsubscribe':
      // 取消关注事件
      console.log('用户取消关注:', FromUserName);
      return null;
    
    default:
      console.log('未处理的事件类型:', Event);
      return null;
  }
}

// 处理图片消息
function handleImageMessage(msgData) {
  const { FromUserName, ToUserName } = msgData;
  
  const replyMsg = {
    ToUserName: FromUserName,
    FromUserName: ToUserName,
    CreateTime: Math.floor(Date.now() / 1000),
    MsgType: 'text',
    Content: '收到您发送的图片，谢谢分享！'
  };
  
  return generateXMLResponse(replyMsg);
}

// 路由：生成授权链接
router.get('/auth', async (ctx) => {
  const { redirect_url } = ctx.query;
  const redirectUri = redirect_url || `${ctx.protocol}://${ctx.host}/workchat/auth/callback`;
  const authUrl = generateAuthUrl(redirectUri);
  
  ctx.body = {
    success: true,
    authUrl: authUrl,
    message: '请访问此URL进行微信授权'
  };
});

// 路由：微信授权回调
router.get('/auth/callback', async (ctx) => {
  const { code, state } = ctx.query;
  
  if (!code) {
    ctx.status = 400;
    ctx.body = { success: false, message: '授权失败，未获取到code' };
    return;
  }
  
  try {
    // 获取用户access_token
    const tokenData = await getUserAccessToken(code);
    
    if (tokenData.errcode) {
      ctx.status = 400;
      ctx.body = { success: false, message: '获取access_token失败', error: tokenData };
      return;
    }
    
    const { access_token, openid, refresh_token } = tokenData;
    
    // 获取用户信息
    const userInfo = await getUserInfo(access_token, openid);
    
    if (userInfo.errcode) {
      ctx.status = 400;
      ctx.body = { success: false, message: '获取用户信息失败', error: userInfo };
      return;
    }
    
    // 保存用户信息
    userStore.set(openid, {
      ...userInfo,
      access_token,
      refresh_token,
      created_at: new Date(),
      last_login: new Date()
    });
    
    console.log('用户授权成功:', userInfo.nickname, openid);
    
    // 返回用户信息页面
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>授权成功</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
        .success { color: #4caf50; }
        .info { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .btn { background: #1aad19; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 10px; }
        img { width: 80px; height: 80px; border-radius: 50%; }
    </style>
</head>
<body>
    <h1 class="success">授权成功！</h1>
    <div class="info">
        <img src="${userInfo.headimgurl}" alt="头像">
        <h2>${userInfo.nickname}</h2>
        <p><strong>OpenID:</strong> ${userInfo.openid}</p>
        <p><strong>地区:</strong> ${userInfo.country} ${userInfo.province} ${userInfo.city}</p>
    </div>
    <a href="/workchat" class="btn">返回首页</a>
    <script>
        // 将OpenID传递给父页面
        if (window.opener) {
            window.opener.postMessage({
                type: 'wechat_auth_success',
                data: {
                    openid: '${userInfo.openid}',
                    nickname: '${userInfo.nickname}',
                    headimgurl: '${userInfo.headimgurl}'
                }
            }, '*');
            window.close();
        }
    </script>
</body>
</html>`;
    
    ctx.type = 'text/html';
    ctx.body = html;
    
  } catch (error) {
    console.error('授权回调处理错误:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: '服务器错误', error: error.message };
  }
});

// 路由：获取用户列表
router.get('/users', async (ctx) => {
  const users = Array.from(userStore.values()).map(user => ({
    openid: user.openid,
    nickname: user.nickname,
    headimgurl: user.headimgurl,
    last_login: user.last_login
  }));
  
  ctx.body = {
    success: true,
    count: users.length,
    data: users
  };
});

// 路由：发送客服消息
router.post('/send/custom', async (ctx) => {
  const { openid, message } = ctx.request.body;
  
  if (!openid || !message) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'openid和message参数必填' };
    return;
  }
  
  const result = await sendCustomMessage(openid, message);
  
  if (result.success) {
    ctx.body = { success: true, message: '消息发送成功' };
  } else {
    ctx.status = 400;
    ctx.body = { success: false, message: '消息发送失败', error: result.error };
  }
});

// 路由：发送模板消息
router.post('/send/template', async (ctx) => {
  const { openid, templateId, data, url } = ctx.request.body;
  
  if (!openid || !templateId || !data) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'openid、templateId和data参数必填' };
    return;
  }
  
  const result = await sendTemplateMessage(openid, templateId, data, url);
  
  if (result.success) {
    ctx.body = { success: true, message: '模板消息发送成功' };
  } else {
    ctx.status = 400;
    ctx.body = { success: false, message: '模板消息发送失败', error: result.error };
  }
});

// 路由：批量发送消息
router.post('/send/batch', async (ctx) => {
  const { openids, message } = ctx.request.body;
  
  if (!openids || !Array.isArray(openids) || !message) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'openids(数组)和message参数必填' };
    return;
  }
  
  const results = [];
  
  for (const openid of openids) {
    const result = await sendCustomMessage(openid, message);
    results.push({
      openid,
      success: result.success,
      error: result.error || null
    });
    
    // 避免频率限制，稍微延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const successCount = results.filter(r => r.success).length;
  
  ctx.body = {
    success: true,
    message: `批量发送完成，成功${successCount}/${openids.length}`,
    results
  };
});

// 路由：获取access_token状态
router.get('/token/status', async (ctx) => {
  try {
    const token = await getGlobalAccessToken();
    ctx.body = {
      success: true,
      token: token.substring(0, 10) + '...',
      expires_in: Math.floor((globalAccessToken.expiresAt - Date.now()) / 1000)
    };
  } catch (error) {
    ctx.body = {
      success: false,
      message: '获取token失败',
      error: error.message
    };
  }
});

// 静态页面：测试首页
router.get('/', async (ctx) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>微信服务号管理平台</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #eee; border-radius: 6px; }
        .btn { background: #1aad19; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #179b16; }
        .btn-auth { background: #07c160; }
        .btn-danger { background: #fa5151; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        textarea { height: 100px; resize: vertical; }
        .result { margin: 20px 0; padding: 15px; border-radius: 4px; }
        .success { background: #e8f5e8; border: 1px solid #4caf50; color: #2e7d32; }
        .error { background: #ffebee; border: 1px solid #f44336; color: #c62828; }
        .user-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .user-card { padding: 15px; border: 1px solid #ddd; border-radius: 6px; text-align: center; }
        .user-card img { width: 50px; height: 50px; border-radius: 50%; }
        .config-info { background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .config-info h3 { margin-top: 0; color: #1976d2; }
        .config-item { margin: 8px 0; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 微信服务号管理平台</h1>
        
        <div class="config-info">
            <h3>📋 配置信息</h3>
            <div class="config-item"><strong>AppID:</strong> ${WECHAT_CONFIG.appId}</div>
            <div class="config-item"><strong>Token:</strong> ${WECHAT_CONFIG.token}</div>
            <div class="config-item"><strong>端口:</strong> 4002</div>
            <div class="config-item"><strong>验证URL:</strong> /workchat/verify</div>
        </div>
        
        <div class="section">
            <h2>🔐 微信授权</h2>
            <p>通过微信网页授权获取用户OpenID和基本信息</p>
            <button class="btn btn-auth" onclick="startAuth()">开始微信授权</button>
            <button class="btn" onclick="checkToken()">检查Token状态</button>
        </div>
        
        <div class="section">
            <h2>📝 发送消息</h2>
            <div class="form-group">
                <label>选择用户:</label>
                <select id="userSelect">
                    <option value="">请先获取用户列表</option>
                </select>
            </div>
            <div class="form-group">
                <label>或直接输入OpenID:</label>
                <input type="text" id="openid" placeholder="用户OpenID">
            </div>
            <div class="form-group">
                <label>消息内容:</label>
                <textarea id="message" placeholder="要发送的消息内容"></textarea>
            </div>
            <button class="btn" onclick="sendMessage()">发送客服消息</button>
        </div>
        
        <div class="section">
            <h2>📧 模板消息</h2>
            <div class="form-group">
                <label>OpenID:</label>
                <input type="text" id="templateOpenid" placeholder="用户OpenID">
            </div>
            <div class="form-group">
                <label>模板ID:</label>
                <input type="text" id="templateId" placeholder="模板消息ID">
            </div>
            <div class="form-group">
                <label>模板数据 (JSON格式):</label>
                <textarea id="templateData" placeholder='{"first":{"value":"标题"},"keyword1":{"value":"内容1"},"remark":{"value":"备注"}}'></textarea>
            </div>
            <div class="form-group">
                <label>跳转链接 (可选):</label>
                <input type="text" id="templateUrl" placeholder="https://example.com">
            </div>
            <button class="btn" onclick="sendTemplate()">发送模板消息</button>
        </div>
        
        <div class="section">
            <h2>👥 用户管理</h2>
            <button class="btn" onclick="loadUsers()">获取用户列表</button>
            <button class="btn btn-danger" onclick="clearUsers()">清空用户缓存</button>
            <div id="userList"></div>
        </div>
        
        <div class="section">
            <h2>📢 批量消息</h2>
            <div class="form-group">
                <label>消息内容:</label>
                <textarea id="batchMessage" placeholder="群发消息内容"></textarea>
            </div>
            <button class="btn" onclick="sendBatchMessage()">发送给所有用户</button>
        </div>
        
        <div id="result"></div>
    </div>

    <script>
        let currentUsers = [];
        
        function startAuth() {
            const width = 400;
            const height = 600;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            
            fetch('/workchat/auth')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const authWindow = window.open(
                            data.authUrl, 
                            'wechat_auth',
                            \`width=\${width},height=\${height},left=\${left},top=\${top},scrollbars=yes,resizable=yes\`
                        );
                        
                        // 监听授权完成消息
                        window.addEventListener('message', function(event) {
                            if (event.data.type === 'wechat_auth_success') {
                                showResult('授权成功！OpenID: ' + event.data.data.openid, 'success');
                                document.getElementById('openid').value = event.data.data.openid;
                                loadUsers(); // 刷新用户列表
                            }
                        });
                    } else {
                        showResult('授权失败: ' + data.message, 'error');
                    }
                })
                .catch(err => showResult('请求失败: ' + err.message, 'error'));
        }
        
        function checkToken() {
            fetch('/workchat/token/status')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showResult(\`Token状态正常，剩余时间: \${data.expires_in}秒\`, 'success');
                    } else {
                        showResult('Token获取失败: ' + data.message, 'error');
                    }
                })
                .catch(err => showResult('请求失败: ' + err.message, 'error'));
        }
        
        function sendMessage() {
            const openid = document.getElementById('openid').value || getSelectedOpenid();
            const message = document.getElementById('message').value;
            
            if (!openid || !message) {
                showResult('请填写OpenID和消息内容', 'error');
                return;
            }
            
            fetch('/workchat/send/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ openid, message })
            })
                .then(res => res.json())
                .then(data => {
                    showResult(data.message, data.success ? 'success' : 'error');
                })
                .catch(err => showResult('发送失败: ' + err.message, 'error'));
        }
        
        function sendTemplate() {
            const openid = document.getElementById('templateOpenid').value;
            const templateId = document.getElementById('templateId').value;
            const templateDataStr = document.getElementById('templateData').value;
            const url = document.getElementById('templateUrl').value;
            
            if (!openid || !templateId || !templateDataStr) {
                showResult('请填写OpenID、模板ID和模板数据', 'error');
                return;
            }
            
            let templateData;
            try {
                templateData = JSON.parse(templateDataStr);
            } catch (e) {
                showResult('模板数据格式错误，请输入有效的JSON', 'error');
                return;
            }
            
            fetch('/workchat/send/template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ openid, templateId, data: templateData, url })
            })
                .then(res => res.json())
                .then(data => {
                    showResult(data.message, data.success ? 'success' : 'error');
                })
                .catch(err => showResult('发送失败: ' + err.message, 'error'));
        }
        
        function loadUsers() {
            fetch('/workchat/users')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        currentUsers = data.data;
                        updateUserSelect();
                        displayUsers(data.data);
                        showResult(\`获取到 \${data.count} 个用户\`, 'success');
                    } else {
                        showResult('获取用户列表失败', 'error');
                    }
                })
                .catch(err => showResult('请求失败: ' + err.message, 'error'));
        }
        
        function updateUserSelect() {
            const select = document.getElementById('userSelect');
            select.innerHTML = '<option value="">选择用户</option>';
            currentUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.openid;
                option.textContent = \`\${user.nickname} (\${user.openid.substring(0, 10)}...)\`;
                select.appendChild(option);
            });
        }
        
        function getSelectedOpenid() {
            return document.getElementById('userSelect').value;
        }
        
        function displayUsers(users) {
            let html = '<div class="user-list">';
            users.forEach(user => {
                html += \`
                    <div class="user-card">
                        <img src="\${user.headimgurl}" alt="头像" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyMCIgcj0iOCIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTAgMzVDMTAgMzAgMTYuNjY2NyAyNSAyNSAyNUMzMy4zMzMzIDI1IDQwIDMwIDQwIDM1IiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='">
                        <h4>\${user.nickname}</h4>
                        <p style="font-size: 12px; color: #666;">\${user.openid.substring(0, 15)}...</p>
                        <button class="btn" onclick="selectUser('\${user.openid}', '\${user.nickname}')">选择</button>
                    </div>
                \`;
            });
            html += '</div>';
            document.getElementById('userList').innerHTML = html;
        }
        
        function selectUser(openid, nickname) {
            document.getElementById('openid').value = openid;
            document.getElementById('templateOpenid').value = openid;
            document.getElementById('userSelect').value = openid;
            showResult(\`已选择用户: \${nickname}\`, 'success');
        }
        
        function clearUsers() {
            if (confirm('确定要清空所有用户缓存吗？')) {
                // 这里可以添加清空用户缓存的API调用
                document.getElementById('userList').innerHTML = '';
                document.getElementById('userSelect').innerHTML = '<option value="">请先获取用户列表</option>';
                currentUsers = [];
                showResult('用户缓存已清空（仅前端清空，服务器缓存需重启清空）', 'success');
            }
        }
        
        function sendBatchMessage() {
            const message = document.getElementById('batchMessage').value;
            
            if (!message) {
                showResult('请填写群发消息内容', 'error');
                return;
            }
            
            if (currentUsers.length === 0) {
                showResult('请先获取用户列表', 'error');
                return;
            }
            
            const openids = currentUsers.map(user => user.openid);
            
            if (!confirm(\`确定要向 \${openids.length} 个用户发送消息吗？\`)) {
                return;
            }
            
            fetch('/workchat/send/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ openids, message })
            })
                .then(res => res.json())
                .then(data => {
                    showResult(data.message, data.success ? 'success' : 'error');
                    if (data.results) {
                        let detailHtml = '<h4>发送详情:</h4>';
                        data.results.forEach(result => {
                            const user = currentUsers.find(u => u.openid === result.openid);
                            const username = user ? user.nickname : result.openid.substring(0, 10) + '...';
                            detailHtml += \`<p>\${username}: \${result.success ? '✅ 成功' : '❌ 失败'}</p>\`;
                        });
                        document.getElementById('result').innerHTML += detailHtml;
                    }
                })
                .catch(err => showResult('批量发送失败: ' + err.message, 'error'));
        }
        
        function showResult(message, type) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = \`<div class="result \${type}">\${message}</div>\`;
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 页面加载完成后自动检查token状态
        window.onload = function() {
            checkToken();
        };
    </script>
</body>
</html>`;
  
  ctx.type = 'text/html';
  ctx.body = html;
});

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('服务器错误:', err);
    ctx.status = 500;
    ctx.body = 'success';
  }
});

// 使用中间件
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text', 'xml'],
  extendTypes: {
    text: ['text/xml', 'application/xml']
  }
}));

app.use(router.routes());
app.use(router.allowedMethods());

// 启动时获取access_token
getGlobalAccessToken().catch(console.error);

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`🚀 微信服务号服务已启动，端口: ${PORT}`);
  console.log(`📱 管理界面: http://localhost:${PORT}/workchat/`);
  console.log(`🔗 验证URL: http://localhost:${PORT}/workchat/verify`);
  console.log('📋 主要API:');
  console.log('- GET  /workchat/verify - 微信验证');
  console.log('- POST /workchat/verify - 消息处理');
  console.log('- GET  /workchat/auth - 生成授权链接');
  console.log('- GET  /workchat/auth/callback - 授权回调');
  console.log('- GET  /workchat/users - 获取用户列表');
  console.log('- POST /workchat/send/custom - 发送客服消息');
  console.log('- POST /workchat/send/template - 发送模板消息');
  console.log('- POST /workchat/send/batch - 批量发送消息');
  console.log('- GET  /workchat/token/status - Token状态');
  console.log('');
  console.log('🔧 微信公众号配置:');
  console.log(`- AppID: ${WECHAT_CONFIG.appId}`);
  console.log(`- Token: ${WECHAT_CONFIG.token}`);
  console.log(`- URL: 你的域名/workchat/verify`);
  console.log(`- EncodingAESKey: ${WECHAT_CONFIG.encodingAESKey}`);
});

module.exports = app;