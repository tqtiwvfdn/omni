# 微信授权登录完整示例教程

## 📝 概述

本教程将详细介绍如何在Web页面中实现微信授权登录，获取用户OpenID和基本信息的完整流程。

## 🎯 实现流程

### 流程图
```
用户访问网页 → 点击微信登录 → 跳转微信授权 → 用户同意授权 → 获取code → 换取access_token → 获取用户信息 → 登录成功
```

### 详细步骤
1. 用户在您的网页点击"微信登录"按钮
2. 跳转到微信授权页面
3. 用户同意授权后，微信会回调您的后端接口
4. 后端通过授权码获取用户的OpenID和基本信息
5. 返回用户信息，完成登录

## 🔧 前端实现

### 1. 登录页面 (login.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信授权登录示例</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: #07c160;
            border-radius: 50%;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 30px;
        }
        
        h1 {
            margin: 0 0 10px;
            font-size: 28px;
            color: #333;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 40px;
            font-size: 16px;
        }
        
        .wechat-login-btn {
            background: #07c160;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 18px;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .wechat-login-btn:hover {
            background: #06ad56;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(7, 193, 96, 0.3);
        }
        
        .wechat-login-btn:active {
            transform: translateY(0);
        }
        
        .wechat-login-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        
        .loading {
            display: none;
            margin-top: 20px;
        }
        
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #07c160;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .user-info {
            display: none;
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
            text-align: left;
        }
        
        .user-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-bottom: 15px;
        }
        
        .user-name {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .user-details {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .user-openid {
            background: #e9ecef;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin-top: 15px;
        }
        
        .logout-btn {
            background: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 14px;
        }
        
        .logout-btn:hover {
            background: #5a6268;
        }
        
        .error-message {
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
        
        .tips {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
            text-align: left;
        }
        
        .tips h4 {
            margin-top: 0;
            color: #155724;
        }
        
        .tips ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .tips li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🤖</div>
        <h1>微信授权登录</h1>
        <p class="subtitle">使用微信账号快速登录</p>
        
        <button id="wechatLoginBtn" class="wechat-login-btn" onclick="startWechatLogin()">
            <span>🔐 微信登录</span>
        </button>
        
        <div id="loading" class="loading">
            <div class="loading-spinner"></div>
            <span>正在跳转微信授权...</span>
        </div>
        
        <div id="errorMessage" class="error-message"></div>
        
        <div id="userInfo" class="user-info">
            <h3>✅ 登录成功</h3>
            <img id="userAvatar" class="user-avatar" src="" alt="用户头像">
            <div id="userName" class="user-name"></div>
            <div id="userDetails" class="user-details"></div>
            <div id="userOpenid" class="user-openid"></div>
            <button class="logout-btn" onclick="logout()">退出登录</button>
        </div>
        
        <div class="tips">
            <h4>💡 使用说明</h4>
            <ul>
                <li>点击"微信登录"按钮开始授权</li>
                <li>在微信授权页面点击"同意"</li>
                <li>授权成功后自动返回并显示用户信息</li>
                <li>OpenID是用户在此公众号下的唯一标识</li>
            </ul>
        </div>
    </div>

    <script>
        // 配置信息
        const CONFIG = {
            baseURL: 'http://localhost:4002/workchat', // 后端服务地址
            redirectURL: window.location.origin + '/callback.html' // 授权回调页面
        };
        
        // 开始微信登录
        async function startWechatLogin() {
            try {
                showLoading(true);
                hideError();
                
                // 获取授权链接
                const response = await fetch(`${CONFIG.baseURL}/auth?redirect_url=${encodeURIComponent(CONFIG.redirectURL)}`);
                const data = await response.json();
                
                if (data.success) {
                    // 跳转到微信授权页面
                    window.location.href = data.authUrl;
                } else {
                    throw new Error(data.message || '获取授权链接失败');
                }
            } catch (error) {
                console.error('微信登录失败:', error);
                showError('微信登录失败: ' + error.message);
                showLoading(false);
            }
        }
        
        // 显示加载状态
        function showLoading(show) {
            const btn = document.getElementById('wechatLoginBtn');
            const loading = document.getElementById('loading');
            
            if (show) {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                loading.style.display = 'block';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                loading.style.display = 'none';
            }
        }
        
        // 显示错误信息
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        // 隐藏错误信息
        function hideError() {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.style.display = 'none';
        }
        
        // 显示用户信息
        function showUserInfo(userInfo) {
            document.getElementById('userAvatar').src = userInfo.headimgurl || 'https://via.placeholder.com/60x60?text=User';
            document.getElementById('userName').textContent = userInfo.nickname || '未知用户';
            document.getElementById('userDetails').innerHTML = `
                <strong>性别:</strong> ${userInfo.sex === 1 ? '男' : userInfo.sex === 2 ? '女' : '未知'}<br>
                <strong>地区:</strong> ${userInfo.country || ''} ${userInfo.province || ''} ${userInfo.city || ''}<br>
                <strong>登录时间:</strong> ${new Date().toLocaleString()}
            `;
            document.getElementById('userOpenid').innerHTML = `<strong>OpenID:</strong><br>${userInfo.openid}`;
            
            // 隐藏登录按钮，显示用户信息
            document.getElementById('wechatLoginBtn').style.display = 'none';
            document.getElementById('userInfo').style.display = 'block';
            
            // 保存用户信息到本地存储
            localStorage.setItem('wechat_user_info', JSON.stringify(userInfo));
        }
        
        // 退出登录
        function logout() {
            localStorage.removeItem('wechat_user_info');
            document.getElementById('wechatLoginBtn').style.display = 'block';
            document.getElementById('userInfo').style.display = 'none';
            hideError();
        }
        
        // 页面加载完成后检查是否已登录
        window.onload = function() {
            const savedUserInfo = localStorage.getItem('wechat_user_info');
            if (savedUserInfo) {
                try {
                    const userInfo = JSON.parse(savedUserInfo);
                    showUserInfo(userInfo);
                } catch (e) {
                    console.error('解析用户信息失败:', e);
                    localStorage.removeItem('wechat_user_info');
                }
            }
            
            // 监听来自授权回调页面的消息
            window.addEventListener('message', function(event) {
                if (event.data.type === 'wechat_auth_success') {
                    showUserInfo(event.data.userInfo);
                    hideError();
                } else if (event.data.type === 'wechat_auth_error') {
                    showError(event.data.message);
                    showLoading(false);
                }
            });
        };
    </script>
</body>
</html>
```

### 2. 授权回调页面 (callback.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信授权处理中...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .callback-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            text-align: center;
            max-width: 400px;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #07c160;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .status-message {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        
        .error-message {
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
        
        .success-message {
            color: #155724;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="callback-container">
        <div class="loading-spinner"></div>
        <div class="status-message">正在处理微信授权...</div>
        <div id="errorMessage" class="error-message"></div>
        <div id="successMessage" class="success-message"></div>
    </div>

    <script>
        // 配置信息
        const CONFIG = {
            baseURL: 'http://localhost:4002/workchat'
        };
        
        // 处理微信授权回调
        async function handleWechatCallback() {
            try {
                // 获取URL参数
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                
                if (!code) {
                    throw new Error('未获取到授权码，授权可能被取消');
                }
                
                // 发送授权码到后端处理
                const response = await fetch(`${CONFIG.baseURL}/auth/callback?code=${code}&state=${state}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    // JSON响应 - 处理错误情况
                    const data = await response.json();
                    if (!data.success) {
                        throw new Error(data.message || '授权处理失败');
                    }
                } else {
                    // HTML响应 - 成功情况
                    const html = await response.text();
                    
                    // 从HTML中提取用户信息
                    const userInfo = extractUserInfoFromHTML(html);
                    
                    if (userInfo) {
                        // 显示成功消息
                        showSuccess('授权成功！正在跳转...');
                        
                        // 向父页面发送成功消息
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'wechat_auth_success',
                                userInfo: userInfo
                            }, '*');
                            
                            // 延迟关闭窗口
                            setTimeout(() => {
                                window.close();
                            }, 1500);
                        } else {
                            // 如果不是弹窗，重定向到主页
                            setTimeout(() => {
                                window.location.href = '/login.html';
                            }, 2000);
                        }
                    } else {
                        throw new Error('无法解析用户信息');
                    }
                }
                
            } catch (error) {
                console.error('授权处理失败:', error);
                showError(error.message);
                
                // 向父页面发送错误消息
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'wechat_auth_error',
                        message: error.message
                    }, '*');
                    
                    // 延迟关闭窗口
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                }
            }
        }
        
        // 从HTML中提取用户信息
        function extractUserInfoFromHTML(html) {
            try {
                // 使用正则表达式提取用户信息
                const openidMatch = html.match(/OpenID:<\/strong>\s*([^<]+)/);
                const nicknameMatch = html.match(/<h2>([^<]+)<\/h2>/);
                const avatarMatch = html.match(/src="([^"]+)"/);
                
                if (openidMatch && nicknameMatch) {
                    return {
                        openid: openidMatch[1].trim(),
                        nickname: nicknameMatch[1].trim(),
                        headimgurl: avatarMatch ? avatarMatch[1] : '',
                        // 其他字段可以根据需要添加
                        sex: 0,
                        country: '',
                        province: '',
                        city: ''
                    };
                }
                
                return null;
            } catch (e) {
                console.error('解析用户信息失败:', e);
                return null;
            }
        }
        
        // 显示错误信息
        function showError(message) {
            document.querySelector('.loading-spinner').style.display = 'none';
            document.querySelector('.status-message').textContent = '授权失败';
            
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        // 显示成功信息
        function showSuccess(message) {
            document.querySelector('.loading-spinner').style.display = 'none';
            document.querySelector('.status-message').textContent = '授权成功';
            
            const successDiv = document.getElementById('successMessage');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }
        
        // 页面加载完成后开始处理
        window.onload = function() {
            handleWechatCallback();
        };
    </script>
</body>
</html>
```

## 🔧 后端接口调整

### 修改授权回调接口

在原有的Koa2服务中，需要修改 `/workchat/auth/callback` 路由以支持JSON返回：

```javascript
// 路由：微信授权回调 - 支持JSON返回
router.get('/auth/callback', async (ctx) => {
  const { code, state, format } = ctx.query;
  
  if (!code) {
    if (format === 'json') {
      ctx.status = 400;
      ctx.body = { success: false, message: '授权失败，未获取到code' };
    } else {
      ctx.type = 'text/html';
      ctx.body = `
        <html>
          <body>
            <h1>授权失败</h1>
            <p>未获取到授权码，可能是用户取消了授权</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'wechat_auth_error',
                  message: '用户取消了授权'
                }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `;
    }
    return;
  }
  
  try {
    // 获取用户access_token
    const tokenData = await getUserAccessToken(code);
    
    if (tokenData.errcode) {
      const errorMsg = '获取access_token失败: ' + (tokenData.errmsg || '未知错误');
      
      if (format === 'json') {
        ctx.status = 400;
        ctx.body = { success: false, message: errorMsg, error: tokenData };
      } else {
        ctx.type = 'text/html';
        ctx.body = generateErrorHTML(errorMsg);
      }
      return;
    }
    
    const { access_token, openid, refresh_token } = tokenData;
    
    // 获取用户信息
    const userInfo = await getUserInfo(access_token, openid);
    
    if (userInfo.errcode) {
      const errorMsg = '获取用户信息失败: ' + (userInfo.errmsg || '未知错误');
      
      if (format === 'json') {
        ctx.status = 400;
        ctx.body = { success: false, message: errorMsg, error: userInfo };
      } else {
        ctx.type = 'text/html';
        ctx.body = generateErrorHTML(errorMsg);
      }
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
    
    // 根据请求格式返回不同响应
    if (format === 'json') {
      ctx.body = {
        success: true,
        message: '授权成功',
        data: {
          openid: userInfo.openid,
          nickname: userInfo.nickname,
          headimgurl: userInfo.headimgurl,
          sex: userInfo.sex,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country
        }
      };
    } else {
      // 返回HTML页面
      ctx.type = 'text/html';
      ctx.body = generateSuccessHTML(userInfo);
    }
    
  } catch (error) {
    console.error('授权回调处理错误:', error);
    const errorMsg = '服务器错误: ' + error.message;
    
    if (format === 'json') {
      ctx.status = 500;
      ctx.body = { success: false, message: errorMsg };
    } else {
      ctx.type = 'text/html';
      ctx.body = generateErrorHTML(errorMsg);
    }
  }
});

// 辅助函数：生成成功HTML
function generateSuccessHTML(userInfo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>授权成功</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; background: #f5f5f5; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #4caf50; margin-bottom: 20px; }
            .info { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: left; }
            img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; }
            .user-name { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .user-details { color: #666; font-size: 14px; line-height: 1.6; }
            .openid { background: #e9ecef; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="success">✅ 授权成功！</h1>
            <div class="info">
                <img src="${userInfo.headimgurl}" alt="头像" onerror="this.src='https://via.placeholder.com/80x80?text=User'">
                <div class="user-name">${userInfo.nickname}</div>
                <div class="user-details">
                    <strong>性别:</strong> ${userInfo.sex === 1 ? '男' : userInfo.sex === 2 ? '女' : '未知'}<br>
                    <strong>地区:</strong> ${userInfo.country} ${userInfo.province} ${userInfo.city}
                </div>
                <div class="openid">
                    <strong>OpenID:</strong><br>${userInfo.openid}
                </div>
            </div>
            <p>页面将自动关闭...</p>
        </div>
        <script>
            // 将用户信息传递给父页面
            if (window.opener) {
                window.opener.postMessage({
                    type: 'wechat_auth_success',
                    userInfo: {
                        openid: '${userInfo.openid}',
                        nickname: '${userInfo.nickname}',
                        headimgurl: '${userInfo.headimgurl}',
                        sex: ${userInfo.sex},
                        country: '${userInfo.country}',
                        province: '${userInfo.province}',
                        city: '${userInfo.city}'
                    }
                }, '*');
                
                // 3秒后自动关闭窗口
                setTimeout(() => {
                    window.close();
                }, 3000);
            } else {
                // 如果不是弹窗，3秒后跳转到主页
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);
            }
        </script>
    </body>
    </html>
  `;
}

// 辅助函数：生成错误HTML
function generateErrorHTML(errorMessage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>授权失败</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; background: #f5f5f5; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #f44336; margin-bottom: 20px; }
            .error-message { background: #ffebee; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="error">❌ 授权失败</h1>
            <div class="error-message">${errorMessage}</div>
            <p>页面将自动关闭...</p>
        </div>
        <script>
            // 将错误信息传递给父页面
            if (window.opener) {
                window.opener.postMessage({
                    type: 'wechat_auth_error',
                    message: '${errorMessage}'
                }, '*');
                
                // 3秒后自动关闭窗口
                setTimeout(() => {
                    window.close();
                }, 3000);
            } else {
                // 如果不是弹窗，3秒后跳转到主页
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);
            }
        </script>
    </body>
    </html>
  `;
}
```

## 📁 项目结构

```
project/
├── app.js                 # 后端服务（Koa2）
├── public/               # 静态文件目录
│   ├── login.html        # 登录页面
│   └── callback.html     # 授权回调页面
├── package.json          # 项目依赖
└── README.md            # 项目说明
```

## 🚀 部署和测试

### 1. 启动后端服务

```bash
node app.js
```

### 2. 配置静态文件服务

在Koa2应用中添加静态文件服务：

```javascript
const serve = require('koa-static');
app.use(serve('public')); // 服务静态文件
```

### 3. 访问测试

1. 打开浏览器访问：`http://localhost:4002/login.html`
2. 点击"微信登录"按钮
3. 在微信授权页面点击"同意"
4. 查看返回的用户信息和OpenID

### 4. 微信公众号配置

确保在微信公众号后台配置：
- **网页授权域名**: `你的域名`
- **授权回调URL**: `https://你的域名/callback.html`

## 🔒 安全注意事项

1. **HTTPS要求**: 生产环境必须使用HTTPS
2. **域名验证**: 确保授权域名已在微信后台配置
3. **参数验证**: 后端要验证所有接收的参数
4. **错误处理**: 完善的错误处理机制
5. **用户信息保护**: 合理存储和使用用户信息

## 🎯 核心要点

1. **用户点击登录** → 跳转微信授权页面
2. **用户同意授权** → 微信回调带code参数
3. **后端处理code** → 获取access_token和用户信息
4. **返回用户信息** → 前端显示登录成功状态
5. **保存OpenID** → 用于后续消息推送

通过这个完整的示例，您就可以在任何Web页面中实现微信授权登录，获取用户的OpenID和基本信息了！