const model = require("../model");
const sequelize = require('sequelize')
let Genshin = model.Genshin

let queryData = async params => {
    wheres = {where:{}}
    if(params['gacha_timeRange[]']) {
        wheres['where']['gacha_time'] = {
            $between: params['gacha_timeRange[]']
        }
    }
    if(params['gacha_type[]']) {
        wheres['where']['gacha_type'] = {
            $in: params['gacha_type[]']
        }
    }
    if(params['item_type[]']) {
        wheres['where']['item_type'] = {
            $in: params['item_type[]']
        }
    }
    if(params['timeDesc']) {
        wheres['order'] = params['timeDesc'] === 'true'? 
            sequelize.literal('gacha_time DESC'): 
            sequelize.literal('gacha_time ASC')
    }
    console.log(wheres)
    let result = await Genshin.findAll(wheres)
    console.log(result)
    return result
}

module.exports = {
    queryData: queryData
}