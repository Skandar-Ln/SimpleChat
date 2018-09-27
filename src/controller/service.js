const _ = require('lodash');
const Router = require('koa-router');

const {file, sts} = require('../service/oss');

const koaRouter = Router();

koaRouter.post('api/service/oss/sts', async (ctx, next) => {
    const result = await sts();
    ctx.body = result;
});

koaRouter.post('api/service/oss/get', async (ctx, next) => {
    const fields = ctx.request.fields || {};
    const {fileName} = fields;

    const url = file.getDownloadUrl(fileName);
    ctx.body = {url};
});

module.exports = koaRouter;
