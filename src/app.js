const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-better-body');
const Static = require('koa-static');
const path = require('path');
const compress = require('koa-compress')

const session = require('./session');
const message = require('./controller/message');
const chat = require('./controller/chat');
const pageRouter = require('./controller/page')
const {session: CONFIG} = require('../config.json');

const app = new Koa();
app.keys = CONFIG.secretKeys;

const router = Router();
router.use('/',
    message.routes(),
    chat.routes()
);

// const cors = Cors({
//     maxAge: 0,
//     credentials: true,
//     methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
//     headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials'
// });

// const session = Session(app);

app
    .use(compress())
    .use(session(app))
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(Static(path.resolve(__dirname, 'static')))
    .use(pageRouter.routes())

app.listen(8009);
