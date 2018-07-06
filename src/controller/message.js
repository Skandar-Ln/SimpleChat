const _ = require('lodash');
const Sequelize = require('sequelize');

const Message = require('../model/message');
const Router = require('koa-router');

const util = require('./util');

const Op = Sequelize.Op;
const koaRouter = Router();

const state = {
    isNew: false, // 获取的数据是否最新
    lastQuery: {},
    lastDatasource: []
};

koaRouter.post('api/message/list', async (ctx, next) => {
    const fields = ctx.request.fields || {};
    const {page = 1, size = 999} = fields;
    const {isNew, lastQuery, lastDatasource} = state;

    if (_.isEqual(state.lastQuery, fields) && isNew) {
        ctx.body = {
            ...lastQuery,
            result: lastDatasource
        };
        return;
    }

    await Message.findAll({
        offset: size * (page -1),
        limit: size,
        order: [['id', 'DESC']]
    }).then(function(res) {
        ctx.body = {
            result: res.reverse(),
            page,
            size
        };
        state.lastDatasource = res;
        state.lastQuery = fields;
        state.isNew = true;
    })
});

koaRouter.post('api/message/create', async (ctx, next) => {
    const fields = ctx.request.fields;
    const params = _.pick(fields, ['content', 'from', 'to']);

    await Message.create({
        ...params
    }).then(async function(files) {
        util.successHandler(ctx, '插入成功');
        state.isNew = false;
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
        state.isNew = false;
        util.successHandler(ctx, '撤回成功');
    });
});

module.exports = koaRouter;
