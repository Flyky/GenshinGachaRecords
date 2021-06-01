const router = require('koa-router')()
const fs = require('fs')
const ups = require('../controller/up')
const querying = require('../controller/query')

const pwd = '123456'
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'GenshinGachaRecords'
  })
})

router.post('/uploadData', async (ctx, next) => {
  let input_pwd = ctx.request.body.pwd
  let is_clearDB = false
  if(input_pwd[0]=='-' && input_pwd[input_pwd.length-1]=='-') {
    is_clearDB = true
    input_pwd = input_pwd.replace(/-/g, '')
  }

  if(input_pwd !== pwd) 
    ctx.body = {"code": 500, "msg": "上传密码错误"}
  else {
    const file = ctx.request.files.file
    console.log(file)
    let gacha_datas = JSON.parse(fs.readFileSync(file.path))
    let insert_records = await ups.uploadGachaData(gacha_datas, is_clearDB)

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

router.get('/queryData/AnaGroupCount', async (ctx, next) => {
  tableData = await querying.queryDataGroupCount()
  ctx.body = { "code": 200, "data": tableData }
})

module.exports = router
