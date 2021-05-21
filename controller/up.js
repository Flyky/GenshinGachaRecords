const model = require("../model");
const seqDb = require('../database/db')
const {Sequelize} = require('sequelize')
let Genshin = model.Genshin

let uploadGachaData = async function (datas, is_clearDB) {
    if(is_clearDB) { // 清除表数据
        await Genshin.destroy({ 
            where: {}, 
            truncate: true 
        }) 
    }

    // console.log(datas)
    const finalGachaTimes = await getFinalGachaInfo()
    const finalGuaranteedTimes = await getFinalGuaranteedTimes()
    let result = []
    
    datas['result'].forEach(ele => {
        let gacha_type = -1
        if(ele[0] === '301') gacha_type = 1
        else if(ele[0] === '302') gacha_type = 2
        else if(ele[0] === '200') gacha_type = 3
        else if(ele[0] === '100') gacha_type = 0

        if(gacha_type === -1) return false
        let times_in_total = 1, times_in_guaranteed = 1

        if(finalGachaTimes[gacha_type.toString()]) {
            ele[1].splice(0, finalGachaTimes[gacha_type.toString()])
            times_in_total = finalGachaTimes[gacha_type.toString()] + 1
        }
        if(finalGuaranteedTimes[gacha_type.toString()]) {
            times_in_guaranteed = finalGuaranteedTimes[gacha_type.toString()] + 1
        }
        
        ele[1].forEach(ele_gacha => {
            result.push({
                gacha_time: ele_gacha[0],
                item: ele_gacha[1],
                item_type: ele_gacha[2] === '角色' ? 1:2,
                rank: ele_gacha[3],
                times_in_total: times_in_total,
                gacha_type: gacha_type,
                times_in_guaranteed: times_in_guaranteed,
            })
            times_in_total++
            times_in_guaranteed = ele_gacha[3] == 5 ? 1 : times_in_guaranteed + 1
        })
    });

    console.log(result.length)
    let records = []
    await Genshin.bulkCreate(result).then(r => {
        console.log(r)
        records = [0,0,0,0]
        r.forEach(c => {
            records[c["dataValues"]["gacha_type"]]++
        })
    }).catch((err) => {
        console.log(err);
    });
    return records
}

let getFinalGachaInfo = async function() {
    let sql = 'SELECT gacha_type , count(*) FROM gacha.genshin GROUP BY gacha_type'
    let result = await seqDb.query(sql, {type: Sequelize.SELECT})
    let r = {}
    result[0].forEach(e => {
        r[e['gacha_type']] = e['count(*)']
    })
    return r
}

let getFinalGuaranteedTimes = async function() {
    let r = {}
    const l = [1,2,3,0]
    for (let index in [1,2,3,0]) {
        let tp = l[index]
        let sql = `SELECT times_in_guaranteed FROM gacha.genshin where gacha_type = ${tp} order by times_in_total desc limit 1`
        let result = await seqDb.query(sql, {type: Sequelize.SELECT, plain: true })
        if (result) r[tp.toString()] = result['times_in_guaranteed']
        else r[tp.toString()] = result
    }
    return r
}

module.exports = {
    uploadGachaData: uploadGachaData
}