/**
 * 云通信基础能力业务短信发送、查询详情以及消费消息示例，供参考。
 * Created on 2017-07-31
 */
const SMSClient = require('@alicloud/sms-sdk')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAIyfocBP09Ge0c'
const secretAccessKey = 'iFbyNueVsIuBqDCUvD4IrioFNcBvYl'
//初始化sms_client
let smsClient = new SMSClient({accessKeyId, secretAccessKey})

const phoneDic = {
    'hcl': '18918271200',
    'ztx': '17621193049'
};

module.exports = function(content, to) {
    console.log(content, to);
    if (process.env.NODE_ENV === 'dev') {
        console.log('不会发短信的...');
        return Promise.resolve({});
    }
    //发送短信
    return smsClient.sendSMS({
        PhoneNumbers: phoneDic[to],
        SignName: '张天星',
        TemplateCode: 'SMS_125022590',
        TemplateParam: `{"from":"[ ${content} ]"}`
    }).then(function (res) {
        let {Code}=res
        if (Code === 'OK') {
            //处理返回参数
            console.log(res)
        }
        return res;
    }, function (err) {
        console.log(err)
    })
}
