/**
* @file page routes
* @author Ice(chenzhouji@baidu.com)
*/
const fs = require('fs');
const {join} = require('path');
const _ = require('lodash');
const Router = require('koa-router');

// import configureStore from '@app/configure/store';
// import App from '@app/modules/app/App';
// import routes from '@app/configure/routes';

const pageRouter = new Router();

pageRouter.get('*', async ctx => {
    let htmlContent = '';

    console.log(`GET ${ctx.path}`);
    const htmlName = 'index.html';

    try {
        htmlContent = fs.readFileSync(join(__dirname, '../static', htmlName), 'utf-8');
    }
    catch (error) {
        htmlContent = error.message;
    }

    ctx.type = 'text/html';
    ctx.body = htmlContent;

    // 暂时不做服务端渲染
    return;
});

module.exports =  pageRouter;
