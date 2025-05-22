# 账户余额查询接口文档

## 基本信息

- **接口URL**: `/per/api/cash/account/accountBalanceQuery`
- **请求方式**: GET
- **接口描述**: 查询用户账户余额信息

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| acctNo | 是 | String | 账号 |
| userNo | 是 | String | 用户编号 |
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
| authorization | 是 | String | 登录成功后返回的token，格式为JWT |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

## 请求头特殊说明

1. `authorization` 头必须包含从登录接口获取的JWT格式token
2. `requestglobaljnlno` 的生成规则：
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
| respTime | String | 响应时间，格式：yyyy-MM-dd HH:mm:ss |
| pageNo | Number | 当前页码 |
| pageSize | Number | 每页大小 |
| acctNo | String | 账号 |
| acctName | String | 账户名称 |
| acctType | String | 账户类型 |
| currency | String | 货币类型 |
| acctBalance | String | 账户余额（分） |
| availBalance | String | 可用余额（分） |
| frozeAmt | String | 冻结金额（分） |

## 响应示例

```json
{
    "respCode": "00000000",
    "respMessage": "success",
    "respTime": "2025-03-31 23:36:37",
    "pageNo": 1,
    "pageSize": 10,
    "acctNo": "6200200100010122119",
    "acctName": "高强",
    "acctType": "活期结算账户",
    "currency": "人民币",
    "acctBalance": "200000",
    "availBalance": "200000",
    "frozeAmt": "0"
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

// 查询账户余额函数
async function queryAccountBalance(acctNo, userNo) {
  try {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或token已过期，请重新登录');
    }
    
    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      acctNo: acctNo,
      userNo: userNo,
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
    const response = await fetch(`/per/api/cash/account/accountBalanceQuery?${queryParams}`, {
      method: 'GET',
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": token,
        "requestchannelcode": "PI",
        "requestglobaljnlno": requestGlobalJnlNo
      },
      referrerPolicy: "no-referrer",
      body: null,
      mode: "cors",
      credentials: "include"
    });
    
    // 解析响应
    const data = await response.json();
    
    // 检查响应状态
    if (data.respCode !== "00000000") {
      throw new Error(data.respMessage || '查询账户余额失败');
    }
    
    return data;
  } catch (error) {
    console.error("查询账户余额失败:", error);
    throw error;
  }
}

// 使用示例
async function displayAccountBalance() {
  try {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // 调用查询接口
    const balanceData = await queryAccountBalance('6200200100010122119', userInfo.userNo);
    
    // 显示账户余额（将分转换为元显示）
    document.getElementById('account-balance').textContent = 
      `账户余额: ${(Number(balanceData.acctBalance) / 100).toFixed(2)} 元`;
    
    // 显示可用余额
    document.getElementById('available-balance').textContent = 
      `可用余额: ${(Number(balanceData.availBalance) / 100).toFixed(2)} 元`;
      
    // 显示账户信息
    document.getElementById('account-info').textContent = 
      `${balanceData.acctName} - ${balanceData.acctNo} (${balanceData.acctType})`;
      
  } catch (error) {
    console.error('获取账户余额失败:', error);
    // 显示错误信息
    document.getElementById('error-message').textContent = '获取账户余额失败: ' + error.message;
  }
}

// 页面加载时显示账户余额
document.addEventListener('DOMContentLoaded', displayAccountBalance);
```

## 金额说明

接口中的金额字段（acctBalance、availBalance、frozeAmt）均以分为单位，前端显示时需要将其转换为元：

```javascript
// 分转元，保留2位小数
function fenToYuan(fen) {
  return (Number(fen) / 100).toFixed(2);
}
```

## 注意事项

1. 必须先登录获取token，并在请求头中设置authorization字段
2. 每次请求都需要生成新的全局流水号
3. 账户余额、可用余额、冻结金额均以分为单位，显示时需转换为元
4. 请确保请求参数完整，缺少必要参数可能导致请求失败