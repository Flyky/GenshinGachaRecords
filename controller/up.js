const model = require("../model");
let Genshin = model.Genshin

let uploadGachaData = function (datas) {
    console.log(datas)
    let result = []

    datas['result'].forEach(ele => {
        let gacha_type = -1
        if(ele[0] === '301') gacha_type = 1
        else if(ele[0] === '302') gacha_type = 2
        else if(ele[0] === '200') gacha_type = 3
        else if(ele[0] === '100') gacha_type = 0

        if(gacha_type === -1) return false

        let times_in_total = 1
        ele[1].forEach(ele_gacha => {
            result.push({
                gacha_time: ele_gacha[0],
                item: ele_gacha[1],
                item_type: ele_gacha[2] === '角色' ? 1:2,
                rank: ele_gacha[3],
                times_in_total: times_in_total,
                gacha_type: gacha_type
            })
            times_in_total++
        })
    });

    console.log(result.length)
    Genshin.bulkCreate(result).then(r => {
        console.log(r)
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = {
    uploadGachaData: uploadGachaData
}