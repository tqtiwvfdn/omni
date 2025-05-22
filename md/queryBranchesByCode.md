# 银行网点查询接口文档

## 基本信息

- **接口URL**: `/per/api/base/prabankCategory/queryBranchesByCode`
- **请求方式**: GET
- **接口描述**: 根据银行代码查询银行网点信息

## 请求参数

### 查询参数(Query Parameters)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| bankCode | 是 | String | 银行代码 |
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
| authorization | 是 | String | JWT令牌，来自登录接口返回的token |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见登录接口文档 |

## 安全认证

该接口需要授权访问，需要在请求头中设置authorization字段，值为登录接口返回的JWT令牌。

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respCode | String | 响应代码，"00000000"表示成功 |
| respMessage | String | 响应消息 |
| branches | Array | 网点信息数组 |

### 网点信息(branches)子项说明

| 参数名 | 类型 | 说明 |
|-------|------|------|
| instName | String | 网点名称 |
| jonesLangLasalle | String | 网点编号 |

## 响应示例

```json
{
    "respCode": "00000000",
    "respMessage": "交易成功",
    "branches": [
        {
            "instName": "东亚银行北京朝阳支行",
            "jonesLangLasalle": "001310100001"
        }
    ]
}
```

## 前端调用示例

```javascript
// 引入moment库处理日期
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

/**
 * 查询银行网点信息
 * @param {string} bankCode - 银行代码
 * @param {string} token - 登录接口返回的JWT令牌
 * @returns {Promise} - 返回Promise对象
 */
async function queryBankBranches(bankCode, token) {
  try {
    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建查询URL
    const queryUrl = `/per/api/base/prabankCategory/queryBranchesByCode?bankCode=${bankCode}&bankId=10000&requestChannelCode=PI&requestChannelId=PI&requestCifSeq=800000003&requestDate=2020-02-13+12:00:00&requestDeptSeq=10000&requestGlobalJnlNo=123123123123123&requestGlobalTrackNo=track123123&requestIp=192.168.1.100&requestJnlNo=123123123123123&requestUserSeq=80000000301&terminalId=DJDJDJDJ&terminalType=ANDROID&channelCode=PI`;
    
    // 发起请求
    const response = await fetch(queryUrl, {
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
    
    // 解析响应数据
    const data = await response.json();
    
    // 检查响应状态
    if (data.respCode !== "00000000") {
      throw new Error(data.respMessage || "查询网点信息失败");
    }
    
    return data;
  } catch (error) {
    console.error("查询银行网点失败:", error);
    throw error;
  }
}

// 使用示例
async function showBankBranchesExample() {
  // 获取存储在本地的用户登录令牌
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error("未登录，请先登录");
    return;
  }
  
  try {
    // 查询东亚银行的网点信息
    const result = await queryBankBranches('001', token);
    
    // 处理返回的数据
    console.log("查询成功，网点数量:", result.branches.length);
    
    // 显示网点列表
    if (result.branches.length > 0) {
      const branchList = document.getElementById('branch-list');
      branchList.innerHTML = '';
      
      result.branches.forEach(branch => {
        const item = document.createElement('div');
        item.className = 'branch-item';
        item.innerHTML = `
          <h3>${branch.instName}</h3>
          <p>网点编号: ${branch.jonesLangLasalle}</p>
        `;
        branchList.appendChild(item);
      });
    } else {
      console.log("没有找到相关网点");
    }
  } catch (error) {
    console.error("获取网点信息失败:", error);
  }
}
```

## 注意事项

1. 调用此接口需要用户先完成登录，获取到有效的JWT令牌
2. 令牌需要在请求头的authorization字段中传递
3. 全局流水号需要按照指定规则生成，保证唯一性
4. 实际应用中可能需要处理令牌过期的情况，当令牌过期时需要引导用户重新登录