# 用户账户查询接口文档

## 基本信息

- **接口URL**: `/per/api/cif/user/getPerUserAccount`
- **请求方式**: GET
- **接口描述**: 获取用户的账户信息列表

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
| userNo | 是 | String | 用户编号，登录接口返回 |

### 请求头(Headers)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| accept | 是 | String | 接受的内容类型 |
| accept-language | 否 | String | 接受的语言 |
| authorization | 是 | String | 认证令牌(JWT)，登录接口返回的token |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respCode | String | 响应代码，"00000000"表示成功 |
| respMessage | String | 响应消息 |
| respTime | String | 响应时间 |
| respGlobalJnlNo | String | 响应全局流水号 |
| respGlobalTrackNo | String | 响应全局追踪号 |
| pageNo | String | 页码 |
| pageSize | String | 每页大小 |
| totalCount | String | 总记录数 |
| passbookVo | Array | 存折列表 |
| accountVo | Array | 账户列表 |

### 账户信息(accountVo)子项说明

| 参数名 | 类型 | 说明 |
|-------|------|------|
| id | String | 账户ID |
| userNo | String | 用户编号 |
| accountName | String | 账户名称 |
| accountNo | String | 账号 |
| accountAlias | String | 账户别名 |
| accountType | String | 账户类型代码 |
| accountTypeName | String | 账户类型名称 |
| accountCategory | String | 账户类别代码 |
| accountCategoryName | String | 账户类别名称 |
| openBankOrgId | String | 开户银行组织ID |
| openBankOrgName | String | 开户银行名称 |
| accountDefault | String | 是否默认账户，"Y"表示是 |
| pkAccount | String | 是否主键账户 |
| openStatus | String | 开户状态代码 |
| availableAmt | Number | 可用金额（分） |
| openStatusName | String | 开户状态名称 |

## 响应示例

```json
{
    "respCode": "00000000",
    "respMessage": "交易成功",
    "respTime": "",
    "respGlobalJnlNo": "",
    "respGlobalTrackNo": "",
    "pageNo": "",
    "pageSize": "",
    "totalCount": "",
    "passbookVo": [],
    "accountVo": [
        {
            "id": "100420",
            "userNo": "100320",
            "accountName": "高强",
            "accountNo": "6200200100010122119",
            "accountAlias": "",
            "accountType": "AT1",
            "accountTypeName": "活期结算账户",
            "accountCategory": "DR1",
            "accountCategoryName": "借记一类户",
            "openBankOrgId": "2001",
            "openBankOrgName": "赞同科技北京分行",
            "accountDefault": "Y",
            "pkAccount": "是",
            "openStatus": "NORMAL",
            "availableAmt": 200000,
            "openStatusName": "正常"
        }
    ]
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

// 获取用户信息函数
async function getUserAccounts(userNo) {
  try {
    // 获取保存的token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或登录已过期');
    }

    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建请求URL
    const url = `/per/api/cif/user/getPerUserAccount?bankId=10000&requestChannelCode=PI&requestChannelId=PI&requestCifSeq=800000003&requestDate=2020-02-13+12:00:00&requestDeptSeq=10000&requestGlobalJnlNo=123123123123123&requestGlobalTrackNo=track123123&requestIp=192.168.1.100&requestJnlNo=123123123123123&requestUserSeq=80000000301&terminalId=DJDJDJDJ&terminalType=ANDROID&channelCode=PI&userNo=${userNo}`;
    
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
    
    // 处理响应
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.respCode !== "00000000") {
      throw new Error(`获取账户信息失败: ${data.respMessage}`);
    }
    
    return data;
  } catch (error) {
    console.error("获取账户信息失败:", error);
    throw error;
  }
}

// 使用示例
async function displayUserAccounts() {
  try {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      console.error('未找到用户信息');
      return;
    }
    
    // 获取账户信息
    const accountData = await getUserAccounts(userInfo.userNo);
    
    // 显示账户信息
    const accountList = accountData.accountVo;
    if (accountList && accountList.length > 0) {
      // 在页面上展示账户信息
      const accountContainer = document.getElementById('account-container');
      accountContainer.innerHTML = '';
      
      accountList.forEach(account => {
        const accountCard = document.createElement('div');
        accountCard.className = 'account-card';
        accountCard.innerHTML = `
          <h3>${account.accountTypeName} ${account.accountCategoryName}</h3>
          <p class="account-number">${formatAccountNumber(account.accountNo)}</p>
          <p class="account-balance">可用余额: ${formatMoney(account.availableAmt)}</p>
          <p class="account-bank">${account.openBankOrgName}</p>
          <p class="account-status">状态: ${account.openStatusName}</p>
        `;
        accountContainer.appendChild(accountCard);
      });
    } else {
      document.getElementById('account-container').innerHTML = '<p>暂无账户信息</p>';
    }
  } catch (error) {
    console.error('显示账户信息失败:', error);
    document.getElementById('account-container').innerHTML = '<p class="error">获取账户信息失败，请稍后重试</p>';
  }
}

// 格式化账号，显示前4位和后4位，中间用星号代替
function formatAccountNumber(accountNo) {
  if (!accountNo || accountNo.length < 8) return accountNo;
  return accountNo.substring(0, 4) + ' **** **** ' + accountNo.substring(accountNo.length - 4);
}

// 格式化金额，分转换为元并添加千分位
function formatMoney(amount) {
  if (amount === undefined || amount === null) return '0.00';
  const yuan = (amount / 100).toFixed(2);
  return yuan.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查用户是否已登录
  const token = localStorage.getItem('token');
  if (!token) {
    // 未登录，跳转到登录页面
    window.location.href = '/login.html';
    return;
  }
  
  // 加载并显示账户信息
  displayUserAccounts();
});
```

## 字段说明

### 账户类型(accountType)

| 代码 | 名称 | 说明 |
|------|------|------|
| AT1 | 活期结算账户 | 用于日常交易的活期账户 |
| AT2 | 定期存款账户 | 固定期限的存款账户 |
| AT3 | 信用卡账户 | 信用卡相关账户 |

### 账户类别(accountCategory)

| 代码 | 名称 | 说明 |
|------|------|------|
| DR1 | 借记一类户 | 一类借记卡账户 |
| DR2 | 借记二类户 | 二类借记卡账户 |
| DR3 | 借记三类户 | 三类借记卡账户 |
| CR1 | 贷记卡账户 | 信用卡账户 |

### 开户状态(openStatus)

| 代码 | 名称 | 说明 |
|------|------|------|
| NORMAL | 正常 | 账户正常可用 |
| FREEZE | 冻结 | 账户被冻结 |
| CANCEL | 注销 | 账户已注销 |
| LOCK | 锁定 | 账户被锁定 |

## 注意事项

1. 接口调用需要在用户登录成功后进行，需要携带有效的token
2. 金额单位为分，前端展示时需要除以100转换为元
3. 账号信息敏感，展示时建议进行部分隐藏处理
4. 默认账户标识为accountDefault="Y"
5. 接口返回的账户信息可能包含多个账户，需要进行列表展示