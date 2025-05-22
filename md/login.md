# 用户登录接口文档

## 基本信息

- **接口URL**: `/per/login`
- **请求方式**: POST
- **接口描述**: 用户登录认证接口，需要配合验证码接口使用

## 请求参数

### 请求头(Headers)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| accept | 否 | String | 接受的内容类型 |
| accept-language | 否 | String | 接受的语言 |
| content-type | 是 | String | 内容类型，固定值："application/json;charset=UTF-8" |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

### 请求体(Body)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| mobilePhone | 是 | String | 手机号码 |
| password | 是 | String | 加密后的密码 |
| loginStyle | 是 | String | 登录方式，例如："PASSWORD"表示密码登录 |
| uuid | 是 | String | 验证码唯一标识，来自验证码接口返回 |
| code | 是 | String | 用户输入的验证码 |
| channelCode | 是 | String | 渠道代码 |
| requestGlobalJnlNo | 是 | Number | 请求全局流水号 |
| requestDate | 是 | String | 请求日期时间，格式：yyyy-MM-dd HH:mm:ss |
| requestGlobalTrackNo | 是 | String | 请求全局追踪号 |
| requestJnlNo | 是 | Number | 请求流水号 |
| requestChannelCode | 是 | String | 请求渠道代码 |
| requestChannelId | 是 | String | 请求渠道ID |
| requestIp | 是 | String | 请求IP地址 |
| terminalType | 是 | String | 终端类型 |
| terminalId | 是 | String | 终端ID |
| authType | 是 | String | 认证类型，例如："MESSAGE"表示短信认证 |
| authData | 是 | Number | 认证数据 |
| requestCifSeq | 是 | Number | 客户序列号 |
| requestUserSeq | 是 | Number | 请求用户序列号 |
| requestDeptSeq | 是 | Number | 请求部门序列号 |
| markingId | 是 | Number | 标记ID |
| bankId | 是 | Number | 银行ID |
| preCheck | 是 | Boolean | 预检查标志 |

## 密码加密说明

登录请求中的密码需要使用RSA加密后传输。加密流程如下：

```javascript
import JSEncrypt from 'jsencrypt/bin/jsencrypt'

// 公钥（用于加密）
const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1EnW9OrwZpySJwgQ7ZwvQNFJtelTx6yOqvy6p3idRB/u/RP5vlDXCPhaI+o/pHHTG5tdYSTLlAA2PCJT65veNv8x4wzormmu8b0V4Yrt/hgJX92i8GDpeK7NdYk9prvW/L5B1mAlVbSSUYCvH9YVkDouyqjv1btAWUydOe/ueowIDAQAB'

// 私钥（用于解密，仅在前端调试时使用）
const privateKey = 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALUSdb06vBmnJInCBDtnC9A0Um16VPHrI6q/LqneJ1EH+79E/m+UNcI+Foj6j+kcdMbm11hJMuUADY8IlPrm942/zHjDOiuaa7xvRXhiu3+GAlf3aLwYOl4rs11iT2mu9b8vkHWYCVVtJJRgK8f1hWQOi7KqO/Vu0BZTJ057+56jAgMBAAECgYAOuqCvMt7oK0tylUCo4Fn6prbpxuCwCROOqRyPns2N7ttQlLkptGGnGkvU+qTILpNlNpPfz5x/OkDgGK+dtTn/v74VDzYE5daPsDfnIrpnj7YYsassIAWcpOC6NQRrXWosVjS+O6knJyWTJWcIDU5LymkWp5eK/ncmkkJemR922QJBAOLeYp3FkCETmrfFeFL1zZNmgbt8uMp/UN7WNLZ9usTkcdcbQ1rqeA8R2ly8lGTQFixOQ1VeFRgiBhb7+iMR8L8CQQDMUqbqYslK+2C7Hwdg5t0c7oJy3UfFsyT/xbh1VUpdxbqfhmop8Q/Gb5XOgbc5AVEdgPMFPQacZkUuuekkCecdAkBVtFlg7N+T/0n1nr3j6UPuKU1dPLK6nPo6FIX5YuoJs5tl/cCmOel9F+t8GSmeJBYcSryZJV+mrEPMrwhB82cVAkBHoBm/RI4H6QNJ1WDCyWttvvafyY5lcZ1gxDEbgKCnKq93SKlitoyvJWLAl5xhMWL8Er4ecfwlS3ypGqbt6ULJAkEA3j8ddJzWp7PYssLoytgUHBRUE3Y6xWWGoB4B5bcCJC9kSQWM9Cwa4pv91kcVMXoXdj67BbDM7blOc1EE4SrYTg=='

// 加密函数
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

// 解密函数（仅在前端调试时使用）
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}
```

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| userStatus | String | 用户状态，例如："NORMAL"表示正常 |
| nation | String | 国家 |
| userNo | String | 用户编号 |
| contactType | String | 联系方式类型 |
| idNo | String | 身份证号（脱敏） |
| requestGlobalJnlNo | String | 请求全局流水号 |
| userTier | String | 用户等级 |
| userLevel | String | 用户级别 |
| loginTime | Number | 登录时间戳 |
| transCheckFlag | String | 交易检查标志 |
| coreUserNo | String | 核心用户编号 |
| secretNotice | String | 密码通知 |
| permissions | Array | 用户权限列表 |
| browser | String | 浏览器信息 |
| firstFlag | String | 是否首次登录标志 |
| ipaddr | String | IP地址 |
| channelCode | String | 渠道代码 |
| respMessage | String | 响应消息 |
| idType | String | 证件类型 |
| os | String | 操作系统 |
| nickName | String | 昵称 |
| userName | String | 用户姓名 |
| equFlag | String | 设备标志 |
| loginCount | Number | 登录次数 |
| token | String | 认证令牌，后续请求需要携带 |
| vocation | String | 职业 |
| instId | String | 机构ID |
| serverDate | String | 服务器日期 |
| expireTime | Number | 令牌过期时间戳 |
| nationality | String | 民族 |
| accountList | Array | 账户列表 |
| userUuid | String | 用户UUID |
| channelName | String | 渠道名称 |
| userType | String | 用户类型 |
| loginLocation | String | 登录位置 |
| respCode | String | 响应代码 |
| contactNo | String | 联系号码 |
| serverDateTime | String | 服务器日期时间 |

### 账户信息(accountList)子项说明

| 参数名 | 类型 | 说明 |
|-------|------|------|
| accountAlias | String | 账户别名 |
| openBankOrgId | String | 开户银行组织ID |
| openStatus | String | 开户状态 |
| accountName | String | 账户名称 |
| accountCategory | String | 账户类别 |
| userNo | String | 用户编号 |
| accountType | String | 账户类型 |
| createUserNo | String | 创建用户编号 |
| availableAmt | Number | 可用金额 |
| accountOrder | String | 账户排序 |
| accountDefault | String | 是否默认账户 |
| openBankOrgName | String | 开户银行名称 |
| deleteFlag | String | 删除标志 |
| password | String | 密码（空） |
| accountNo | String | 账号 |
| ccy | String | 币种 |
| createInstId | String | 创建机构ID |
| currencyFlag | String | 币种标志 |
| updateInstId | String | 更新机构ID |
| id | String | ID |
| openTime | String | 开户时间 |
| updateUserNo | String | 更新用户编号 |
| channelCode | String | 渠道代码 |

## 前端调用示例

```javascript
import moment from 'moment';
import JSEncrypt from 'jsencrypt/bin/jsencrypt';

// 公钥（用于加密密码）
const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1EnW9OrwZpySJwgQ7ZwvQNFJtelTx6yOqvy6p3idRB/u/RP5vlDXCPhaI+o/pHHTG5tdYSTLlAA2PCJT65veNv8x4wzormmu8b0V4Yrt/hgJX92i8GDpeK7NdYk9prvW/L5B1mAlVbSSUYCvH9YVkDouyqjv1btAWUydOe/ueowIDAQAB';

// 生成随机数函数
function randomWord(length = 13) {
  let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let num = '';
  for (let i = 0; i < length; i++) {
    num += arr[parseInt(Math.random() * arr.length)];
  }
  return num;
}

// 密码加密函数
function encryptPassword(password) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(password);
}

// 生成全局流水号
function generateGlobalJnlNo() {
  return 'PI' + moment(new Date()).format("YYYYMMDDhhmmss") + randomWord();
}

// 登录函数
async function login(mobilePhone, password, captchaCode, captchaUuid) {
  try {
    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 加密密码
    const encryptedPassword = encryptPassword(password);
    
    // 构建请求体
    const requestBody = {
      mobilePhone: mobilePhone,
      password: encryptedPassword,
      loginStyle: "PASSWORD",
      uuid: captchaUuid,  // 使用验证码接口返回的uuid
      code: captchaCode,  // 用户输入的验证码
      channelCode: "PI",
      requestGlobalJnlNo: 123123123123123,
      requestDate: "2020-02-13 12:00:00",
      requestGlobalTrackNo: "track123123",
      requestJnlNo: 123123123123123,
      requestChannelCode: "PI",
      requestChannelId: "PI",
      requestIp: "192.168.1.100",
      terminalType: "ANDROID",
      terminalId: "DJDJDJDJ",
      authType: "MESSAGE",
      authData: 123456,
      requestCifSeq: 800000003,
      requestUserSeq: 80000000301,
      requestDeptSeq: 10000,
      markingId: 100000,
      bankId: 10000,
      preCheck: false
    };

    // 发起登录请求
    const response = await fetch("/per/login", {
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json;charset=UTF-8",
        "requestchannelcode": "PI",
        "requestglobaljnlno": requestGlobalJnlNo
      },
      referrerPolicy: "no-referrer",
      body: JSON.stringify(requestBody),
      method: "POST",
      mode: "cors",
      credentials: "omit"
    });

    const data = await response.json();
    
    // 如果登录成功，保存token到本地存储
    if (data.respCode === "00000000") {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify({
        userNo: data.userNo,
        userName: data.userName,
        userUuid: data.userUuid,
        expireTime: data.expireTime
      }));
    }
    
    return data;
  } catch (error) {
    console.error("登录失败:", error);
    throw error;
  }
}

// 使用示例
// 1. 先获取验证码
async function loginProcess() {
  try {
    // 获取验证码
    const captchaResponse = await getCaptchaImage();
    
    // 显示验证码图片
    document.getElementById('captcha-img').src = `data:image/jpeg;base64,${captchaResponse.img}`;
    
    // 用户输入手机号、密码和验证码后，调用登录接口
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', async () => {
      const mobilePhone = document.getElementById('mobile-phone').value;
      const password = document.getElementById('password').value;
      const captchaCode = document.getElementById('captcha-code').value;
      
      // 调用登录接口
      const loginResponse = await login(mobilePhone, password, captchaCode, captchaResponse.uuid);
      
      if (loginResponse.respCode === "00000000") {
        console.log("登录成功");
        // 跳转到首页或其他页面
        window.location.href = "/home";
      } else {
        console.error("登录失败:", loginResponse.respMessage);
        // 显示错误信息
        document.getElementById('error-message').textContent = loginResponse.respMessage;
      }
    });
  } catch (error) {
    console.error("登录流程错误:", error);
  }
}

// 启动登录流程
loginProcess();
```

## 登录流程说明

1. 调用验证码接口获取验证码图片和uuid
2. 展示验证码图片给用户
3. 用户输入手机号、密码和验证码
4. 使用RSA公钥加密密码
5. 构建登录请求，包含手机号、加密后的密码、验证码和uuid等信息
6. 发送登录请求
7. 处理登录响应，保存token和用户信息
8. 根据响应结果执行后续操作（如跳转页面或显示错误信息）

## 注意事项

1. 密码必须使用RSA加密后传输，前端不要存储明文密码
2. 登录成功后，需要保存返回的token，后续接口调用需要在请求头中携带此token
3. 验证码和uuid是配对的，必须使用验证码接口返回的uuid来进行登录
4. token有过期时间，需要在过期前刷新或重新登录