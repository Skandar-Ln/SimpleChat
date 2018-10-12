const _ = require('lodash');
const Sequelize = require('sequelize');
// const EventEmitter = require('eventemitter3');
const EventEmitter = require('events');
const {Readable, PassThrough} = require('stream');

const Message = require('../model/message');
const Router = require('koa-router');

const util = require('./util');
const auth = require('../util/auth');
const sse = require('../util/sse');

const koaRouter = Router();
const emitter = new EventEmitter();

koaRouter.post('api/message/list', async (ctx, next) => {
    const fields = ctx.request.fields || {};
    const {page = 1, size = 999, chatId = '', updateAt} = fields;
    const {isLogin} = ctx.session[chatId] || {};

    // if (!isLogin) {
    //     return util.rejectHandler(ctx, '没有访问权限，请刷新登录');
    // }

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
});

koaRouter.get('api/message/events', async (ctx, next) => {
    const query = ctx.request.query || {};
    const {chatId = ''} = query;

    const body = ctx.body = sse();

    // otherwise node will automatically close this connection in 2 minutes
    ctx.req.setTimeout(Number.MAX_VALUE);

    ctx.type = 'text/event-stream';
    ctx.set('Cache-Control', 'no-cache, no-transform');
    ctx.set('Connection', 'keep-alive');


    const event = `messages_update-${chatId}`;
    const cb = (event, data) => {
        event && body.write(`event: ${event}\n`);
        body.write(`data: ${JSON.stringify(data)}\n\n`)
    };

    emitter.on(event, cb);


	const nln = function() {
		body.write('\n');
	};
	const hbt = setInterval(nln, 15000);

    // if the connection closes or errors,
    // we stop the SSE.
    const socket = ctx.socket;
    socket.on('error', close);
    socket.on('close', close);

    function close() {
        socket.removeListener('error', close);
        socket.removeListener('close', close);
        emitter.removeListener(event, cb);
        clearInterval(hbt);
    }

    // 初次的数据
    await Message.findAll({
        limit: 10,
        order: [['id', 'DESC']],
        where: {
            chatId
        }
    }).then(function(res) {
        const result = res.reverse();
        body.write(`data: ${JSON.stringify(result)}\n\n`)
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
    }).then(async function(file) {
        util.successHandler(ctx, '插入成功');
        emitter.emit(`messages_update-${chatId}`, '', file.dataValues);
    });
});

koaRouter.post('api/message/withdraw', async (ctx, next) => {
    const fields = ctx.request.fields;
    const params = _.pick(fields, ['id']);
    const {chatId = '', id = ''} = fields;

    await Message.update({
        isWithDraw: true
    }, {
        where: params
    }).then(async function(file) {
        util.successHandler(ctx, '撤回成功');
        emitter.emit(`messages_update-${chatId}`, 'withdraw', {id});
    });
});

const authedRouter = Router();

authedRouter
    .use('api/message', (ctx, next) => {
        const fields = ctx.request.fields || ctx.request.query || {};
        const {page = 1, size = 999, chatId = '', updateAt} = fields;
        const {isLogin} = ctx.session[chatId] || {};

        if (!isLogin) {
            return util.rejectHandler(ctx, '没有访问权限，请刷新登录');
        }

        return next();
    })
    .use(koaRouter.routes());

module.exports = authedRouter;
