const router = require('koa-router')()
const fs = require('fs')
const ups = require('../controller/up')
const querying = require('../controller/query')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.post('/uploadData', async (ctx, next) => {
  const file = ctx.request.files.file
  console.log(file)
  let gacha_datas = JSON.parse(fs.readFileSync(file.path))
  await ups.uploadGachaData(gacha_datas)
  ctx.body = {"code": 200}
})

router.get('/queryData', async (ctx, next) => {
  params = ctx.query
  tableData = await querying.queryData(params)
  ctx.body = { "code": 200, "data": tableData }
})

module.exports = router
