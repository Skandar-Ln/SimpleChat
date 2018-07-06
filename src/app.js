const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-better-body');
const Static = require('koa-static');
const path = require('path');
const compress = require('koa-compress')

const message = require('./controller/message');

const app = new Koa();

const router = Router();
router.use('/',
    message.routes()
);

// const cors = Cors({
//     maxAge: 0,
//     credentials: true,
//     methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
//     headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials'
// });

// const session = Session(app);
// app.keys = ['hcl-is-0'];

app
    .use(compress())
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(Static(path.resolve(__dirname, 'static')))

app.listen(8009);
