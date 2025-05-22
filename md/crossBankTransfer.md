# 跨行转账接口文档

## 基本信息

- **接口URL**: `/per/api/cash/account/crossBankTransfer`
- **请求方式**: POST
- **接口描述**: 实现用户跨行转账功能，支持向他行账户转账

## 请求参数

### 请求头(Headers)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| accept | 否 | String | 接受的内容类型 |
| accept-language | 否 | String | 接受的语言 |
| authorization | 是 | String | 用户登录后的认证令牌(token) |
| content-type | 是 | String | 内容类型，固定值："application/json;charset=UTF-8" |
| requestchannelcode | 是 | String | 请求渠道代码，固定值："PI" |
| requestglobaljnlno | 是 | String | 请求全局流水号，生成规则见登录接口文档 |

### 请求体(Body)

| 参数名 | 必填 | 类型 | 说明 |
|-------|-----|------|------|
| accountType | 是 | String | 账户类型，例如："AT1" |
| openBankOrgName | 是 | String | 开户行名称 |
| payerAcctNo | 是 | String | 付款人账号 |
| payerName | 是 | String | 付款人姓名 |
| transAmt | 是 | String | 转账金额，例如："2000.00" |
| payeeAccountName | 是 | String | 收款人姓名 |
| payeeAccountNo | 是 | String | 收款人账号 |
| payeeBankId | 是 | String | 收款银行ID |
| payeeDeptId | 是 | String | 收款银行部门ID |
| payeeBankName | 是 | String | 收款银行名称 |
| prodCode | 是 | String | 产品代码，例如："PER_CROSS_BANK" |
| usage | 是 | String | 用途代码，例如："OFF_AMT" |
| payeeMobile | 是 | String | 收款人手机号 |
| timerFreq | 否 | String | 定时频率，定时转账时使用 |
| timerRule | 否 | String | 定时规则，定时转账时使用 |
| remark | 否 | String | 备注信息 |
| trsMode | 是 | String | 交易模式，例如："S"(单笔转账) |
| addPayeeFlag | 是 | String | 是否新增收款人，"1"表示是 |
| cardUrl | 否 | String | 银行卡图片Base64编码 |
| currency | 是 | String | 币种，例如："CNY"(人民币) |
| noticeFlag | 是 | String | 通知标志，例如："N"(不通知) |
| payerAcctType | 是 | String | 付款人账户类型 |
| userNo | 是 | String | 用户编号 |
| payerPhoneNo | 是 | String | 付款人手机号 |
| captcha | 否 | String | 验证码，部分交易可能需要 |
| password | 是 | String | 支付密码 |
| cifLevel | 是 | String | 客户等级，例如："NORMAL" |
| trsType | 是 | String | 交易类型，例如："D"(借记) |
| payeeDeptName | 是 | String | 收款银行部门名称 |
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
| channelCode | 是 | String | 渠道代码 |

## 响应参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| respMessage | String | 响应消息，例如："ok" |
| linkCode | String | 连接码，可用于查询交易状态 |
| transTime | String | 交易时间，格式：yyyy-MM-dd HH:mm:ss |
| payeeAcctName | String | 收款人姓名 |
| usage | String | 用途代码 |
| reduceFee | String | 减免费用 |
| payeeAcctNo | String | 收款人账号 |
| requestGlobalJnlNo | String | 请求全局流水号 |
| totalReduceFee | String | 总减免费用 |
| serverDate | String | 服务器日期 |
| payeeBankName | String | 收款银行名称 |
| coreJnlNo | String | 核心流水号 |
| respTime | String | 响应时间，格式：yyyy-MM-dd HH:mm:ss |
| transAmt | Number | 交易金额 |
| respCode | String | 响应代码，"00000000"表示成功 |
| transStatus | String | 交易状态，例如："交易成功" |
| serverDateTime | String | 服务器日期时间，格式：yyyy-MM-dd HH:mm:ss |

## 前端调用示例

```javascript
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

// 跨行转账函数
async function crossBankTransfer(transferData) {
  try {
    // 获取存储的token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或登录已过期，请重新登录');
    }
    
    // 生成全局流水号
    const requestGlobalJnlNo = generateGlobalJnlNo();
    
    // 构建请求数据
    const requestData = {
      ...transferData,
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
      preCheck: false,
      channelCode: "PI"
    };
    
    // 发起请求
    const response = await fetch("/per/api/cash/account/crossBankTransfer", {
      method: "POST",
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": token,
        "content-type": "application/json;charset=UTF-8",
        "requestchannelcode": "PI",
        "requestglobaljnlno": requestGlobalJnlNo
      },
      referrerPolicy: "no-referrer",
      body: JSON.stringify(requestData),
      mode: "cors",
      credentials: "include"
    });
    
    // 解析响应
    const responseData = await response.json();
    
    if (responseData.respCode !== "00000000") {
      throw new Error(responseData.respMessage || '转账失败');
    }
    
    return responseData;
  } catch (error) {
    console.error('跨行转账失败:', error);
    throw error;
  }
}

// 使用示例
async function executeTransfer() {
  try {
    // 构建转账数据
    const transferData = {
      accountType: "AT1",
      openBankOrgName: "赞同科技北京分行",
      payerAcctNo: "6200200100010122119",
      payerName: "高强",
      transAmt: "2000.00",
      payeeAccountName: "高强",
      payeeAccountNo: "62002001000101221",
      payeeBankId: "001",
      payeeDeptId: "62002001000101221",
      payeeBankName: "赞同科技",
      prodCode: "PER_CROSS_BANK",
      usage: "OFF_AMT",
      payeeMobile: "19935153663",
      timerFreq: "",
      timerRule: "",
      remark: "19935153663",
      trsMode: "S",
      addPayeeFlag: "1",
      cardUrl: "data:image/png;base64,iVBOR...", // 省略部分base64编码
      currency: "CNY",
      noticeFlag: "N",
      payerAcctType: "AT1",
      userNo: "100320",
      payerPhoneNo: "19935153663",
      captcha: "",
      password: "123654", // 注意：实际应用中应加密处理
      cifLevel: "NORMAL",
      trsType: "D",
      payeeDeptName: "赞同科技北京分行"
    };
    
    // 执行转账
    const result = await crossBankTransfer(transferData);
    
    // 处理成功响应
    console.log('转账成功:', result);
    alert(`转账成功！\n交易金额: ${result.transAmt}\n交易时间: ${result.transTime}\n交易状态: ${result.transStatus}`);
    
    // 可以跳转到交易成功页面
    // window.location.href = "/transfer-success?jnlNo=" + result.coreJnlNo;
    
  } catch (error) {
    // 处理错误
    alert('转账失败: ' + error.message);
  }
}
```

## 注意事项

1. 转账前需要先登录获取token，并在请求头中携带
2. 支付密码在实际应用中应当加密处理
3. 敏感信息（如密码、账号等）在传输过程中应注意安全性
4. 转账金额的格式应为字符串，例如："2000.00"
5. 请求头中的全局流水号应保证唯一性，避免重复交易
6. 收款人信息务必准确，避免转账错误
7. 转账成功后，可通过linkCode查询交易状态
8. 跨行转账可能产生手续费，具体费用请参考银行规定