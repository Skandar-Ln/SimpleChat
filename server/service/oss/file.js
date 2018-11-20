const OSS = require('ali-oss');
const {oss} = require('../../config/config.json');

const client = new OSS(oss.client);

const expires = 60 * 60 * 24;
const defaultOpt = {
    // isThumb: true
}

const getDownloadUrl = (fileName, opt) => {
    opt = Object.assign({}, defaultOpt, opt);

    const url = client.signatureUrl(fileName, {
        // response: {
        //     'content-disposition': 'attachment'
        // }
        expires,
        process : opt.isThumb ? 'style/thumb' : ''
    });

    return url;
}

exports.getDownloadUrl = getDownloadUrl;
