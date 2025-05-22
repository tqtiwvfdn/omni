# 获取收款人信息接口文档

## 基本信息

- **接口URL**: `/per/api/transfer/getAllCashPayeeInfo`
- **请求方式**: GET
- **接口描述**: 获取用户已保存的所有收款人信息

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
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
| authorization | 是 | String | 认证令牌，登录后获取的token |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respCode | String | 响应代码，"00000000"表示成功 |
| respMessage | String | 响应消息 |
| pageNo | Number | 当前页码 |
| pageSize | Number | 每页记录数 |
| data | Array | 收款人信息列表，成功时返回 |

### 收款人信息(data)子项说明

当接口调用成功且有收款人信息时，data数组中包含以下字段的对象：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| payeeId | String | 收款人ID |
| payeeName | String | 收款人姓名 |
| payeeAccount | String | 收款人账号 |
| bankName | String | 开户银行名称 |
| bankCode | String | 银行代码 |
| relationShip | String | 与收款人关系 |
| addTime | String | 添加时间 |
| lastUsedTime | String | 最后使用时间 |

## 响应示例

### 成功响应（无收款人信息）

```json
{
  "respCode": "00000000",
  "respMessage": "交易成功",
  "pageNo": 1,
  "pageSize": 10
}
```

### 成功响应（有收款人信息）

```json
{
  "respCode": "00000000",
  "respMessage": "交易成功",
  "pageNo": 1,
  "pageSize": 10,
  "data": [
    {
      "payeeId": "10001",
      "payeeName": "张三",
      "payeeAccount": "6222021234567890123",
      "bankName": "中国工商银行",
      "bankCode": "ICBC",
      "relationShip": "FRIEND",
      "addTime": "2025-02-15 14:30:22",
      "lastUsedTime": "2025-03-20 10:15:36"
    },
    {
      "payeeId": "10002",
      "payeeName": "李四",
      "payeeAccount": "6228480123456789012",
      "bankName": "中国农业银行",
      "bankCode": "ABC",
      "relationShip": "FAMILY",
      "addTime": "2025-01-10 09:25:18",
      "lastUsedTime": "2025-03-25 16:42:10"
    }
  ]
}
```

### 失败响应

```json
{
  "respCode": "10000123",
  "respMessage": "未查询到收款人信息"
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

// 获取收款人列表函数
async function getAllCashPayeeInfo(userNo) {
  try {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或登录已过期');
    }

    // 生成请求全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建请求URL
    const url = `/per/api/transfer/getAllCashPayeeInfo?userNo=${userNo}&bankId=10000&requestChannelCode=PI&requestChannelId=PI&requestCifSeq=800000003&requestDate=2020-02-13+12:00:00&requestDeptSeq=10000&requestGlobalJnlNo=123123123123123&requestGlobalTrackNo=track123123&requestIp=192.168.1.100&requestJnlNo=123123123123123&requestUserSeq=80000000301&terminalId=DJDJDJDJ&terminalType=ANDROID&channelCode=PI`;
    
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
    
    // 判断是否成功
    if (data.respCode === "00000000") {
      console.log("获取收款人列表成功");
      return data;
    } else {
      console.error("获取收款人列表失败:", data.respMessage);
      throw new Error(data.respMessage || '获取收款人列表失败');
    }
  } catch (error) {
    console.error("获取收款人列表出错:", error);
    throw error;
  }
}

// 使用示例
async function loadPayeeList() {
  try {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    
    // 调用获取收款人列表接口
    const result = await getAllCashPayeeInfo(userInfo.userNo);
    
    // 显示收款人列表
    if (result.data && result.data.length > 0) {
      // 有收款人信息，渲染列表
      const payeeListElement = document.getElementById('payee-list');
      payeeListElement.innerHTML = ''; // 清空列表
      
      result.data.forEach(payee => {
        const payeeItem = document.createElement('div');
        payeeItem.className = 'payee-item';
        payeeItem.innerHTML = `
          <div class="payee-name">${payee.payeeName}</div>
          <div class="payee-account">${payee.payeeAccount}</div>
          <div class="payee-bank">${payee.bankName}</div>
        `;
        payeeListElement.appendChild(payeeItem);
      });
    } else {
      // 无收款人信息，显示提示
      document.getElementById('payee-list').innerHTML = '<div class="empty-tip">暂无收款人信息</div>';
    }
  } catch (error) {
    // 显示错误信息
    document.getElementById('error-message').textContent = error.message;
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 加载收款人列表
  loadPayeeList();
});
```

## 注意事项

1. 请求头中需要携带登录接口返回的token用于认证
2. 全局流水号需要动态生成，确保唯一性
3. 接口可能返回空的收款人列表，前端需要处理无数据的情况
4. 如果token已过期，需要引导用户重新登录