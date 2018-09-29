import request from 'axios';
import Chance from 'chance';
import _ from 'lodash';
// import OSS from 'ali-oss';

const OSS = window.OSS;
const chance = new Chance();

const chatId = _.last(window.location.pathname.split('/'));

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

    const storeAs = `${chatId}/${chance.string()}_${file.name}`;

    return new Promise((resolve, reject) => {
        client.multipartUpload(storeAs, file).then(function (result) {
            request.post('/api/message/create', {
                chatId,
                type: 'img',
                content: result.name
            }).then(res => {
                resolve(res.data);
            });
        }).catch(function (err) {
            console.log(err);
        });
    })
}
