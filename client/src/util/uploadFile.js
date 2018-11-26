import request from 'axios';
import last from 'lodash/last';
// import OSS from 'ali-oss';

const OSS = window.OSS;

const chatId = last(window.location.pathname.split('/'));

function generateRandomString() {
    return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}

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

export default async function (file) {
    const client = await getValidClient();

    const storeAs = `${chatId}/${generateRandomString()}_${file.name}`;

    return new Promise((resolve, reject) => {
        client.multipartUpload(storeAs, file).then(function (result) {
            const match = result.name.match(/\.(\w+)$/);
            let type = match ? match[1] : '';
            if (['jpg', 'jpeg', 'png', 'svg', 'gif'].indexOf(type) > -1) {
                type = 'img';
            }

            request.post('/api/message/create', {
                chatId,
                type,
                content: result.name
            }).then(res => {
                resolve(res.data);
            });
        }).catch(function (err) {
            console.log(err);
        });
    })
}
