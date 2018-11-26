const _ = require('lodash');
const Sequelize = require('sequelize');
const shortid = require('shortid');

const Chat = require('../model/chat');
const Router = require('koa-router');

const controlUtil = require('./util');
const util = require('../util/util');
const auth = require('../util/auth');

const koaRouter = Router();

async function getChatData(chatId) {
    const a = await Chat.findOne({
        where: {
            chatId
        }
    });

    return auth.getPublicChatData(a);
}

koaRouter.post('api/chat/public/create', async (ctx, next) => {
    const {roomName} = ctx.request.fields || {};
    const chatId = shortid.generate();

    await Chat.create({
        chatId,
        roomName
    }).then(async function(res) {
        ctx.body = auth.getPublicChatData(res);
    });
});

koaRouter.post('api/chat/secret/create', async (ctx, next) => {
    const fields = ctx.request.fields || {};
    let {key, chatId, roomName} = fields;

    chatId = chatId || shortid.generate();
    key = key || util.generateRandomString();

    await Chat.create({
        chatId,
        key,
        roomName
    }).then(function(res) {
        ctx.body = auth.getPublicChatData(res);;
    });
});

koaRouter.post('api/chat/auth', async (ctx, next) => {
    const fields = ctx.request.fields || {};
    const {chatId, key, user} = fields;

    if (ctx.session[chatId]) {
        if (!ctx.session[chatId].user) {
            ctx.session[chatId] = {
                isLogin: true,
                user
            };
        }

        return controlUtil.successHandler(ctx, '状态有效', {
            user: ctx.session[chatId].user,
            chatData: await getChatData(chatId)
        });
    }

    const {isValid, chatData} = await auth.checkChat(chatId, key);

    if (!isValid) {
        return controlUtil.rejectHandler(ctx, '密码错误');
    }

    ctx.session[chatId] = {
        isLogin: true,
        user
    };

    controlUtil.successHandler(ctx, '登录成功', {user, chatData});
});

module.exports = koaRouter;
