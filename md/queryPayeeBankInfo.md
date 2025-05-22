# 收款银行信息查询接口文档

## 基本信息

- **接口URL**: `/per/api/base/prabankCategory/queryPayeeBankInfo`
- **请求方式**: GET
- **接口描述**: 获取系统支持的收款银行列表信息，用于转账等功能中的银行选择

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| remitRoad | 是 | String | 汇款通道，例如："SUPER"表示超级网银通道 |
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
| authorization | 是 | String | 登录成功后获取的授权令牌(token) |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respCode | String | 响应代码，"00000000"表示成功 |
| respMessage | String | 响应消息 |
| payeeBankVOS | Array | 收款银行列表 |

### 收款银行信息(payeeBankVOS)子项说明

| 参数名 | 类型 | 说明 |
|-------|------|------|
| bankCode | String | 银行代码 |
| bankName | String | 银行名称 |

## 响应示例

```json
{
    "respCode": "00000000",
    "respMessage": "交易成功",
    "payeeBankVOS": [
        {
            "bankCode": "102",
            "bankName": "中国工商银行"
        },
        {
            "bankCode": "313",
            "bankName": "北京银行"
        },
        {
            "bankCode": "001",
            "bankName": "赞同科技"
        },
        {
            "bankCode": "308",
            "bankName": "招商银行"
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

// 获取收款银行列表函数
async function queryPayeeBankInfo() {
  try {
    // 获取本地存储中的token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或登录已过期，请重新登录');
    }
    
    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建请求URL
    const url = "/per/api/base/prabankCategory/queryPayeeBankInfo?remitRoad=SUPER&bankId=10000&requestChannelCode=PI&requestChannelId=PI&requestCifSeq=800000003&requestDate=2020-02-13+12:00:00&requestDeptSeq=10000&requestGlobalJnlNo=123123123123123&requestGlobalTrackNo=track123123&requestIp=192.168.1.100&requestJnlNo=123123123123123&requestUserSeq=80000000301&terminalId=DJDJDJDJ&terminalType=ANDROID&channelCode=PI";
    
    // 发起请求
    const response = await fetch(url, {
      method: "GET",
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
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 解析响应数据
    const data = await response.json();
    
    // 检查业务状态码
    if (data.respCode !== "00000000") {
      throw new Error(`业务处理失败: ${data.respMessage}`);
    }
    
    // 返回银行列表数据
    return data.payeeBankVOS;
    
  } catch (error) {
    console.error("获取收款银行列表失败:", error);
    throw error;
  }
}

// 使用示例
async function displayBankList() {
  try {
    const bankList = await queryPayeeBankInfo();
    
    // 将银行列表数据渲染到下拉选择框
    const selectElement = document.getElementById('bank-select');
    
    // 清空现有选项
    selectElement.innerHTML = '';
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '请选择收款银行';
    selectElement.appendChild(defaultOption);
    
    // 添加银行选项
    bankList.forEach(bank => {
      const option = document.createElement('option');
      option.value = bank.bankCode;
      option.textContent = bank.bankName;
      selectElement.appendChild(option);
    });
  } catch (error) {
    alert('获取银行列表失败: ' + error.message);
  }
}

// 页面加载完成后调用
document.addEventListener('DOMContentLoaded', displayBankList);
```

## 注意事项

1. 调用此接口前需要先完成登录，获取授权令牌(token)
2. 确保在请求头中传递正确的authorization值，格式为登录接口返回的完整token
3. 动态生成全局流水号(requestglobaljnlno)，确保请求的唯一性
4. 接口返回的银行列表数据可用于转账等功能的银行选择下拉框