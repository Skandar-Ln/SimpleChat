const OSS = require('ali-oss');
const {oss} = require('../../../config.json');

const client = new OSS(oss.client);

const getDownloadUrl = fileName => {
    const url = client.signatureUrl(fileName, {
        // response: {
        //     'content-disposition': 'attachment'
        // }
    });

    return url;
}

exports.getDownloadUrl = getDownloadUrl;
