const _ = require('lodash');
const Sequelize = require('sequelize');
const shortid = require('shortid');

const Chat = require('../model/chat');
const Router = require('koa-router');

const controlUtil = require('./util');
const util = require('../util/util');
const auth = require('../util/auth');

const koaRouter = Router();

koaRouter.post('api/chat/public/create', async (ctx, next) => {
    const chatId = shortid.generate();

    await Chat.create({
        chatId
    }).then(async function(res) {
        ctx.body = _.pick(res, ['chatId']);
    });
});

koaRouter.post('api/chat/secret/create', async (ctx, next) => {
    const fields = ctx.request.fields || {};
    let {key, chatId} = fields;

    chatId = chatId || shortid.generate();
    key = key || util.generateRandomString();

    await Chat.create({
        chatId,
        key
    }).then(function(res) {
        ctx.body = _.pick(res, ['chatId', 'key']);
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
            user: ctx.session[chatId].user
        });
    }

    const isValid = await auth.isChatKeyValid(chatId, key);

    if (!isValid) {
        return controlUtil.rejectHandler(ctx, '密码错误');
    }

    ctx.session[chatId] = {
        isLogin: true,
        user
    };

    controlUtil.successHandler(ctx, '登录成功', {user});
});

module.exports = koaRouter;
