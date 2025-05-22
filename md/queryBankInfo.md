# 银行信息查询接口文档

## 基本信息

- **接口URL**: `/per/api/base/pracardbin/queryBankInfo`
- **请求方式**: GET
- **接口描述**: 根据账号查询银行信息，判断账号是否存在

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| payeeAccountNo | 是 | String | 收款人账号 |
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
| authorization | 是 | String | 登录接口返回的令牌(token) |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respCode | String | 响应代码，"00000000"表示成功 |
| respMessage | String | 响应消息 |
| existPayeeFlag | String | 账号是否存在标志，"1"表示存在，"0"表示不存在 |

## 响应示例

```json
{
  "respCode": "00000000",
  "respMessage": "交易成功",
  "existPayeeFlag": "1"
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

// 查询银行信息函数
async function queryBankInfo(accountNo) {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或登录已过期，请重新登录');
    }
    
    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建请求URL
    const baseUrl = '/per/api/base/pracardbin/queryBankInfo';
    const params = new URLSearchParams({
      payeeAccountNo: accountNo,
      bankId: '10000',
      requestChannelCode: 'PI',
      requestChannelId: 'PI',
      requestCifSeq: '800000003',
      requestDate: '2020-02-13 12:00:00',
      requestDeptSeq: '10000',
      requestGlobalJnlNo: '123123123123123',
      requestGlobalTrackNo: 'track123123',
      requestIp: '192.168.1.100',
      requestJnlNo: '123123123123123',
      requestUserSeq: '80000000301',
      terminalId: 'DJDJDJDJ',
      terminalType: 'ANDROID',
      channelCode: 'PI'
    });
    
    // 发起请求
    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'authorization': token,
        'requestchannelcode': 'PI',
        'requestglobaljnlno': requestGlobalJnlNo
      },
      referrerPolicy: 'no-referrer',
      mode: 'cors',
      credentials: 'include'
    });
    
    // 解析响应
    const data = await response.json();
    
    // 检查响应状态
    if (data.respCode !== '00000000') {
      throw new Error(data.respMessage || '查询银行信息失败');
    }
    
    return data;
  } catch (error) {
    console.error('查询银行信息失败:', error);
    throw error;
  }
}

// 使用示例
async function checkAccount() {
  try {
    const accountNo = document.getElementById('account-number').value;
    const result = await queryBankInfo(accountNo);
    
    if (result.existPayeeFlag === '1') {
      console.log('账号存在');
      // 处理账号存在的情况
    } else {
      console.log('账号不存在');
      // 处理账号不存在的情况
    }
  } catch (error) {
    // 处理错误
    console.error(error);
  }
}
```

## 接口说明

1. 此接口用于验证收款账号是否存在，通常在转账前调用
2. 需要在请求头中携带登录接口返回的token
3. 请求需要生成全局流水号，与验证码和登录接口使用相同的生成规则
4. 响应中的`existPayeeFlag`字段表示账号是否存在，"1"表示存在，"0"表示不存在
5. 此接口需要登录后调用，确保认证信息有效