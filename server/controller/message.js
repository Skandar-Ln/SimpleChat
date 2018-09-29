const _ = require('lodash');
const Sequelize = require('sequelize');

const Message = require('../model/message');
const Router = require('koa-router');

const util = require('./util');
const auth = require('../util/auth');
const event = require('../util/event');

const Op = Sequelize.Op;
const koaRouter = Router();

koaRouter.post('api/message/list', async (ctx, next) => {
    const fields = ctx.request.fields || {};
    const {page = 1, size = 999, chatId = '', updateAt} = fields;
    const {isLogin} = ctx.session[chatId] || {};

    if (!isLogin) {
        return util.rejectHandler(ctx, '没有访问权限，请刷新登录');
    }

    return await Message.findAll({
        offset: size * (page -1),
        limit: size,
        order: [['id', 'DESC']],
        where: {
            chatId
        }
    }).then(function(res) {
        ctx.body = {
            result: res.reverse(),
            page,
            size
        };
    });

    // TODO 用socket
    await new Promise((resolve, reject) => {
        event.one(chatId, 'update', res => {
            ctx.body = {
                result: res
            };

            resolve();
        });

        setTimeout(resolve, 1000 * 60);
    });
});

koaRouter.post('api/message/create', async (ctx, next) => {
    const fields = ctx.request.fields;
    const params = _.pick(fields, ['content', 'chatId', 'type']);
    const chatId = params.chatId || '';
    const {user} = ctx.session[chatId] || {};

    await Message.create({
        ...params,
        from: user
    }).then(async function(files) {
        util.successHandler(ctx, '插入成功');
        // event.dispatch(chatId, 'update', files);
    });
});

koaRouter.post('api/message/withdraw', async (ctx, next) => {
    const fields = ctx.request.fields;
    const params = _.pick(fields, ['id']);

    await Message.update({
        isWithDraw: true
    }, {
        where: params
    }).then(async function(files) {
        util.successHandler(ctx, '撤回成功');
    });
});

module.exports = koaRouter;
