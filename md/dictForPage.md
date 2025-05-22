# 转账用途查询接口文档

## 基本信息

- **接口URL**: `/per/api/base/pradictdata/dictForPage`
- **请求方式**: GET
- **接口描述**: 根据指定的代码ID获取相应的转账用途内容

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| codeIds | 是 | String | 转账用途代码ID，多个代码ID用逗号分隔 |
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
| authorization | 是 | String | 认证Token，登录接口返回的token |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见验证码接口文档 |

## 认证说明

该接口需要用户登录后获取的Token进行认证。Token通过登录接口获取，并在请求头中的`authorization`字段传递。

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respCode | String | 响应代码，"00000000"表示成功 |
| respMessage | String | 响应消息 |
| dictMap | Object | 转账用途映射对象，包含请求的字典数据 |

### dictMap字典对象结构

dictMap是一个对象，其中:
- 键是请求的codeId
- 值是该codeId对应的转账用途内容（键值对形式）

## 响应示例

```json
{
    "respCode": "00000000",
    "respMessage": "交易成功",
    "dictMap": {
        "Transfer_Purpose_Type": {
            "199": "其他个人贷款用途",
            "210": "生态环境改造",
            "211": "交通设施",
            "299": "其他对公贷款用途",
            "212": "农网升级改造",
            "213": "水利设施",
            "214": "易地扶贫搬迁贷款",
            "100": "个人贷款用途",
            "101": "购住房",
            "200": "对公贷款用途",
            "102": "购商业用房",
            "201": "经营周转",
            "103": "购个人自用车",
            "202": "临时",
            "104": "购商业用车",
            "203": "科技开发,技术改造",
            "105": "购耐用消费品",
            "204": "项目建设",
            "106": "住房装修",
            "205": "投资项目",
            "107": "教育支出",
            "206": "投资股权",
            "108": "生产经营",
            "207": "房地产开发",
            "109": "旅游",
            "208": "购置",
            "209": "土地储备"
        }
    }
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

// 获取转账用途函数
async function getDictData(codeIds) {
  try {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('用户未登录，请先登录');
    }
    
    // 生成请求全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建请求URL
    const url = `/per/api/base/pradictdata/dictForPage?codeIds=${codeIds}&bankId=10000&requestChannelCode=PI&requestChannelId=PI&requestCifSeq=800000003&requestDate=2020-02-13+12:00:00&requestDeptSeq=10000&requestGlobalJnlNo=123123123123123&requestGlobalTrackNo=track123123&requestIp=192.168.1.100&requestJnlNo=123123123123123&requestUserSeq=80000000301&terminalId=DJDJDJDJ&terminalType=ANDROID&channelCode=PI`;
    
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
    const responseData = await response.json();
    
    // 检查响应状态
    if (responseData.respCode !== "00000000") {
      throw new Error(`获取转账用途失败: ${responseData.respMessage}`);
    }
    
    return responseData.dictMap;
  } catch (error) {
    console.error("获取转账用途失败:", error);
    throw error;
  }
}

// 使用示例
async function loadTransferPurposeTypes() {
  try {
    // 获取转账用途类型字典
    const dictMap = await getDictData('Transfer_Purpose_Type');
    const transferPurposeTypes = dictMap['Transfer_Purpose_Type'];
    
    // 填充下拉菜单
    const selectElement = document.getElementById('transfer-purpose');
    if (selectElement) {
      // 清空现有选项
      selectElement.innerHTML = '';
      
      // 添加默认选项
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '请选择转账用途';
      selectElement.appendChild(defaultOption);
      
      // 添加字典选项
      Object.entries(transferPurposeTypes).forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        selectElement.appendChild(option);
      });
    }
  } catch (error) {
    console.error('加载转账用途失败:', error);
  }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
  loadTransferPurposeTypes();
});
```

## 使用说明

1. 该接口用于获取系统中预定义的转账用途内容
2. 通过指定不同的`codeIds`参数，可以一次获取多种类型的转账用途
3. 接口需要用户登录后的认证Token才能访问
4. 返回的转账用途结构为双层嵌套的对象，便于直接使用

## 常见的字典代码ID

| 代码ID | 说明 |
|-------|------|
| Transfer_Purpose_Type | 转账用途类型 |
| Card_Type | 银行卡类型 |
| Currency_Type | 货币类型 |
| Account_Status | 账户状态 |
| Transaction_Type | 交易类型 |

*注意：实际可用的字典代码ID可能因系统配置而异，上述列表仅供参考。*