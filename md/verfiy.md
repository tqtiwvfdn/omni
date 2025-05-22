# 验证码图片接口文档

## 基本信息

- **接口URL**: `/per/captchaImage`
- **请求方式**: GET
- **接口描述**: 获取验证码图片

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
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
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见下方 |

## 请求头特殊说明

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
| msg | String | 操作消息 |
| respMessage | String | 响应消息 |
| img | String | 验证码图片的Base64编码 |
| code | Number | 响应状态码 |
| uuid | String | 验证码唯一标识 |
| respCode | String | 响应代码 |

## 响应示例

```json
{
  "msg": "操作成功",
  "respMessage": "交易成功",
  "img": "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/...",
  "code": 200,
  "uuid": "70227e36726c4de1bcf2524f5b848d88",
  "respCode": "00000000"
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
const requestGlobalJnlNo = 'PI' + moment(new Date()).format("YYYYMMDDhhmmss") + randomWord();

// 发起请求
async function getCaptchaImage() {
  try {
    const response = await fetch("/per/captchaImage?bankId=10000&requestChannelCode=PI&requestChannelId=PI&requestCifSeq=800000003&requestDate=2020-02-13+12:00:00&requestDeptSeq=10000&requestGlobalJnlNo=123123123123123&requestGlobalTrackNo=track123123&requestIp=192.168.1.100&requestJnlNo=123123123123123&requestUserSeq=80000000301&terminalId=DJDJDJDJ&terminalType=ANDROID&channelCode=PI", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "requestchannelcode": "PI",
        "requestglobaljnlno": requestGlobalJnlNo
      },
      "referrerPolicy": "no-referrer",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("获取验证码失败:", error);
    throw error;
  }
}

// 使用示例
getCaptchaImage().then(data => {
  // 处理返回的验证码图片
  const captchaImg = document.getElementById('captcha-img');
  if (captchaImg && data.img) {
    captchaImg.src = `data:image/jpeg;base64,${data.img}`;
    // 保存uuid用于后续验证
    localStorage.setItem('captchaUuid', data.uuid);
  }
});
```

## 后端验证提示

后端接收验证码时，需要同时接收前端传递的:
- 用户输入的验证码
- 获取验证码时返回的uuid

这两个参数共同用于验证用户输入是否正确。