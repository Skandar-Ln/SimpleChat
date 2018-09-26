const _ = require('lodash');
const store = require('../store');
const Chat = require('../model/chat');

async function isChatKeyValid(chatId, key) {
    const storeKey = _.get(store, `${chatId}.key`);
    if (storeKey && storeKey === key) {
        return true;
    }
console.log(chatId)
    const dataBaseKey = await Chat.findOne({
        where: {
            chatId
        }
    }).then(res => {
        return res ? res.key : null;
    });
console.log(dataBaseKey)

    if (!dataBaseKey || dataBaseKey === key) {
        return true
    }

    return false;
}

exports.isChatKeyValid = isChatKeyValid;
