const _ = require('lodash');
const Sequelize = require('sequelize');
const Chance = require('chance');

const Chat = require('../model/chat');
const Router = require('koa-router');

const util = require('./util');
const auth = require('../util/auth');

const koaRouter = Router();
const chance = new Chance();

koaRouter.post('api/chat/public/create', async (ctx, next) => {
    const chatId = chance.string({length: 5});;

    await Chat.create({
        chatId
    }).then(async function(res) {
        ctx.body = _.pick(res, ['chatId']);
    });
});

koaRouter.post('api/chat/secret/create', async (ctx, next) => {
    const chatId = chance.string({length: 5});;
    const key = chance.string();

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

        return util.successHandler(ctx, '状态有效', {
            user: ctx.session[chatId].user
        });
    }

    const isValid = await auth.isChatKeyValid(chatId, key);

    if (!isValid) {
        return util.rejectHandler(ctx, '密码错误');
    }

    // if (!user) {
    //     return util.rejectHandler(ctx, '无用户名');
    // }

    ctx.session[chatId] = {
        isLogin: true,
        user
    };

    util.successHandler(ctx, '登录成功', {user});
});

module.exports = koaRouter;
