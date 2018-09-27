const path = require('path');
const {oss} = require('../../../config.json');

module.exports = {
        ...oss.sts,
        // "TokenExpireTime": "900",
        "PolicyFile": path.resolve(__dirname, './policy.txt')
}
