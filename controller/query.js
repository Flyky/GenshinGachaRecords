const model = require("../model");
const sequelize = require('sequelize')
const seqDb = require('../database/db')
let Genshin = model.Genshin

let queryData = async params => {
    let where = 'WHERE 1=1 '

    if(params['gacha_timeRange[]']) {
        where += `AND gacha_time BETWEEN '${params['gacha_timeRange[]'][0]}' AND '${params['gacha_timeRange[]'][1]}' `
    }
    if(params['gacha_type[]']) {
        let tp = params['gacha_type[]'].toString()
        where += `AND gacha_type IN (${tp}) `
    }
    if(params['item_type[]']) {
        let it = params['item_type[]'].toString()
        where += `AND item_type IN (${it}) `
    }
    if(params['timeDesc']) {
        where += params['timeDesc'] === 'true'? 
            'ORDER BY gacha_time DESC':
            'ORDER BY gacha_time ASC'
    }

    sql = `SELECT * FROM gacha.genshin ${where}`
    
    console.log(sql)
    let result = await seqDb.query(sql, { model: Genshin })
    console.log(result)
    return result
}

module.exports = {
    queryData: queryData
}