import request from 'axios';
// import OSS from 'ali-oss';

const OSS = window.OSS;

async function getValidClient() {
    return await request.post('/api/service/oss/sts').then(({data: result}) => {
        const client = new OSS({
            accessKeyId: result.AccessKeyId,
            accessKeySecret: result.AccessKeySecret,
            stsToken: result.SecurityToken,
            endpoint: 'oss-cn-hangzhou.aliyuncs.com',
            bucket: 'bulibuli-chat'
        });

        return client;
    });
}

export default async function (chatId, file) {
    const client = await getValidClient();

    const storeAs = `${chatId}_${file.name}`;

    client.multipartUpload(storeAs, file).then(function (result) {
        request.post('/api/message/create', {
            chatId,
            type: 'img',
            content: result.name
        });
    }).catch(function (err) {
        console.log(err);
    });
}
