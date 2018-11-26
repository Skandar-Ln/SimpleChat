const _ = require('lodash');
const store = require('../store');
const Chat = require('../model/chat');

async function isChatKeyValid(chatId, key) {
    const storeKey = _.get(store, `${chatId}.key`);
    if (storeKey && storeKey === key) {
        return true;
    }

    const dataBaseKey = await Chat.findOne({
        where: {
            chatId
        }
    }).then(res => {
        return res ? res.key : null;
    });

    if (!dataBaseKey || dataBaseKey === key) {
        return true
    }

    return false;
}

// 通过id和密码检查，并返回valid信息和房间信息
async function checkChat(chatId, key) {
    const storeKey = _.get(store, `${chatId}.key`);

    if (storeKey && storeKey === key) {
        return true;
    }

    const chatData = await Chat.findOne({
        where: {
            chatId
        }
    });

    console.log('chatData', chatData);

    const dataBaseKey = chatData ? chatData.key : null;
    const isValid = !dataBaseKey || dataBaseKey === key;

    return {
        chatData: getPublicChatData(chatData),
        isValid
    };
}

function getPublicChatData(chatData) {
    return _.pick(chatData, ['roomName', 'chatId']);
}

exports.isChatKeyValid = isChatKeyValid;
exports.checkChat = checkChat;
exports.getPublicChatData = getPublicChatData;
