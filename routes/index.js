const router = require('koa-router')()
const fs = require('fs')
const ups = require('../controller/up')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.post('/uploadData', async (ctx, next) => {
  const file = ctx.request.files.file
  console.log(file)
  let gacha_datas = JSON.parse(fs.readFileSync(file.path))
  await ups.uploadGachaData(gacha_datas)
  ctx.body = {"code": 200}
})

module.exports = router
