const fs = require('fs');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBody = require('koa-body');
const serve  = require('koa-static');
const cors = require('@koa/cors');
const booksRoutes = require('./routes/api/v1/books');

const app = new Koa();
const router = new KoaRouter();

const db = require("../models");

app
  .use(koaBody({ multipart: true }))
  .use(serve('./dist/'))
  .use(async (ctx, next) => {
    if(!ctx.request.path.includes('/api/')){
      ctx.type = 'html';
      ctx.body = fs.readFileSync('./dist/index.html');
    }
    await next();
  })
  .use(booksRoutes.routes())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(cors({credentials: true, origin: true}));


app.on('error', (err, ctx) => {
  console.log(err);
  /* centralized error handling:
    *   console.log error
    *   write error to log file
    *   save error and request information to database if ctx.request match condition
    *   ...
  */
});

const port = process.env.PORT || 3000
db.sequelize.sync().then(async (req) => {
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  });
})