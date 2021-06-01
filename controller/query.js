const model = require("../model");
const sequelize = require('sequelize')
const seqDb = require('../database/db')
let Genshin = model.Genshin
const {Sequelize} = require('sequelize')

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
    if(params['rank[]']) {
        let rk = params['rank[]'].toString()
        where += `AND rank IN (${rk}) `
    }
    if(params['timeDesc']) {
        where += params['timeDesc'] === 'true'? 
            'ORDER BY gacha_time DESC, times_in_total DESC':
            'ORDER BY gacha_time ASC, times_in_total ASC'
    }

    sql = `SELECT DATE_FORMAT(gacha_time, '%Y-%m-%d %H:%i:%s') AS gacha_time,
     item, item_type, rank, times_in_total, gacha_type, times_in_guaranteed FROM gacha.genshin ${where}`
    
    console.log(sql)
    let result = await seqDb.query(sql, { model: Genshin })
    // console.log(result)
    return result
}

let queryDataGroupCount = async params => {
    let wheres = [
        'WHERE item_type = 1 AND `rank` = 5', 'WHERE item_type = 1 AND `rank` = 4',
        'WHERE item_type = 2 AND `rank` = 5', 'WHERE item_type = 2 AND `rank` = 4',
        'WHERE item_type = 2 AND `rank` = 3',
    ]
    let result = [];
    for (let index = 0; index < 5; index++) {
        let sql = `SELECT item AS name, COUNT(item) AS \`count\` FROM gacha.genshin ${wheres[index]} GROUP BY item ORDER BY \`count\` DESC `
        let r = await seqDb.query(sql, {type: Sequelize.SELECT })
        result.push(r[0])
    }
    
    return result
}

module.exports = {
    queryData: queryData,
    queryDataGroupCount: queryDataGroupCount
}