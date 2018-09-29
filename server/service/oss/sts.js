const _ = require('lodash');
const STS = require('ali-oss').STS;
const conf = require('./conf');
const fs = require('fs');

const client = new STS({
    accessKeyId: conf.AccessKeyId,
    accessKeySecret: conf.AccessKeySecret,
});

module.exports = async () => {
    const policy = fs.readFileSync(conf.PolicyFile).toString('utf-8');

    const result = client.assumeRole(conf.RoleArn, policy, conf.TokenExpireTime);
    const result1 = result.next();

    return await result1.value.then(async (res) => {
        if (Math.floor(res.status / 100) !== 2) {
            return false;
        }
        const result = JSON.parse(res.data);

        return {
            AccessKeyId: result.Credentials.AccessKeyId,
            AccessKeySecret: result.Credentials.AccessKeySecret,
            SecurityToken: result.Credentials.SecurityToken,
            Expiration: result.Credentials.Expiration
        };
    });
};
