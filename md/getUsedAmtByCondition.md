# 限额查询接口文档

## 基本信息

- **接口URL**: `/per/api/limit/cumulate/getUsedAmtByCondition`
- **请求方式**: GET
- **接口描述**: 根据条件查询用户已使用的额度

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| userNo | 是 | String | 用户编号 |
| cifDimention | 是 | Number | 客户维度，例如：2 |
| bankId | 是 | String | 银行ID |
| requestChannelCode | 是 | String | 请求渠道代码 |
| requestChannelId | 是 | String | 请求渠道ID |
| requestCifSeq | 是 | String | 客户序列号 |
| requestDate | 是 | String | 请求日期时间，格式：yyyy-MM-dd HH:mm:ss |
| requestDeptSeq | 是 | String | 请求部门序列号 |
| requestGlobalJnlNo | 是 | String | 请求全局流水号 |
| requestGlobalTrackNo | 是 | String | 请求全局追踪号 |
| requestIp | 是 | String | 请求IP地址 |
| requestJnlNo | 是 | String | 请求流水号 |
| requestUserSeq | 是 | String | 请求用户序列号 |
| terminalId | 是 | String | 终端ID |
| terminalType | 是 | String | 终端类型 |
| channelCode | 是 | String | 渠道代码 |

### 请求头(Headers)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| accept | 否 | String | 接受的内容类型 |
| accept-language | 否 | String | 接受的语言 |
| authorization | 是 | String | 认证令牌，登录接口返回的token |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

## 全局流水号生成规则

`requestglobaljnlno` 的生成规则：
- 前缀："PI"
- 日期时间：当前时间，格式为"YYYYMMDDhhmmss"
- 后缀：13位随机数字

```javascript
// 生成全局流水号
function generateGlobalJnlNo() {
  return 'PI' + moment(new Date()).format("YYYYMMDDhhmmss") + randomWord();
}

// 生成随机数
function randomWord(length = 13) {
  let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let num = '';
  for (let i = 0; i < length; i++) {
    num += arr[parseInt(Math.random() * arr.length)];
  }
  return num;
}
```

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respCode | String | 响应代码，"00000000"表示成功 |
| respMessage | String | 响应消息 |

## 响应示例

```json
{
  "respCode": "00000000",
  "respMessage": "交易成功"
}
```

## 前端调用示例

```javascript
// 导入moment库处理日期
import moment from 'moment';

// 生成随机数函数
function randomWord(length = 13) {
  let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let num = '';
  for (let i = 0; i < length; i++) {
    num += arr[parseInt(Math.random() * arr.length)];
  }
  return num;
}

// 生成全局流水号
function generateGlobalJnlNo() {
  return 'PI' + moment(new Date()).format("YYYYMMDDhhmmss") + randomWord();
}

// 查询已使用额度
async function getUsedAmount(userNo, cifDimention) {
  try {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或token已失效，请重新登录');
    }
    
    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建请求URL
    const url = `/per/api/limit/cumulate/getUsedAmtByCondition?userNo=${userNo}&cifDimention=${cifDimention}&bankId=10000&requestChannelCode=PI&requestChannelId=PI&requestCifSeq=800000003&requestDate=2020-02-13+12:00:00&requestDeptSeq=10000&requestGlobalJnlNo=123123123123123&requestGlobalTrackNo=track123123&requestIp=192.168.1.100&requestJnlNo=123123123123123&requestUserSeq=80000000301&terminalId=DJDJDJDJ&terminalType=ANDROID&channelCode=PI`;
    
    // 发起请求
    const response = await fetch(url, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": token,
        "requestchannelcode": "PI",
        "requestglobaljnlno": requestGlobalJnlNo
      },
      "referrerPolicy": "no-referrer",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    });
    
    // 解析响应
    const data = await response.json();
    
    // 检查响应
    if (data.respCode !== "00000000") {
      throw new Error(data.respMessage || '查询失败');
    }
    
    return data;
  } catch (error) {
    console.error("查询已使用额度失败:", error);
    throw error;
  }
}

// 使用示例
async function checkUserLimit() {
  try {
    // 从本地存储获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      console.error('未找到用户信息');
      return;
    }
    
    // 调用接口查询已使用额度
    const result = await getUsedAmount(userInfo.userNo, 2);
    console.log('已使用额度查询结果:', result);
    
    // 可以在这里处理查询结果，例如更新UI显示
  } catch (error) {
    console.error('查询出错:', error);
    // 处理错误，例如显示错误提示或重定向到登录页
  }
}

// 页面加载后执行查询
document.addEventListener('DOMContentLoaded', checkUserLimit);
```

## 注意事项

1. 调用此接口需要用户先登录，并在请求头中携带有效的token
2. 全局流水号需要按照规则动态生成，每次请求都应该不同
3. 如果遇到`respCode`不为"00000000"的情况，表示查询失败，应查看`respMessage`了解具体原因
4. 在实际开发中，可能需要根据具体业务场景调整接口参数