const router = require('koa-router')()
const fs = require('fs')
const ups = require('../controller/up')
const querying = require('../controller/query')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'GenshinGachaRecords'
  })
})

router.post('/uploadData', async (ctx, next) => {
  if(ctx.request.body.pwd !== "123456") 
    ctx.body = {"code": 500, "msg": "上传密码错误"}
  else {
    const file = ctx.request.files.file
    console.log(file)
    let gacha_datas = JSON.parse(fs.readFileSync(file.path))
    let insert_records = await ups.uploadGachaData(gacha_datas)

    if(insert_records.length < 1) {
      ctx.body = {"code": 500, "msg": "插入数据错误！"}
    }
    else {
      ctx.body = {"code": 200, "records": insert_records}
    }
  }
})

router.get('/queryData', async (ctx, next) => {
  params = ctx.query
  tableData = await querying.queryData(params)
  ctx.body = { "code": 200, "data": tableData }
})

module.exports = router
