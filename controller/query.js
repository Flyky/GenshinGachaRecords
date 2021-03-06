const model = require("../model");
const sequelize = require('sequelize')
const seqDb = require('../database/db')
let Genshin = model.Genshin
const {Sequelize} = require('sequelize')

// 判断字符串是否为空/空格/null/undefined
let isEmptyStr = str => {
    if(!str) return true
    if (str == '') return true;
    let regu = "^[ ]+$";
    let re = new RegExp(regu);
    return re.test(str);
}

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
    if(params['keyword']) {
        let kw = params['keyword'].toString()
        if(!isEmptyStr(kw))
            where += `AND item LIKE '%${kw}%' `
    }
    if(params['timeDesc']) {
        where += params['timeDesc'] === 'true'? 
            'ORDER BY gacha_time DESC, times_in_total DESC':
            'ORDER BY gacha_time ASC, times_in_total ASC'
    }

    sql = `SELECT DATE_FORMAT(gacha_time, '%Y-%m-%d %H:%i:%s') AS gacha_time,
     item, item_type, rank, times_in_total, gacha_type, times_in_guaranteed FROM gacha.genshin ${where}`
    
    // console.log(sql)
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

let queryAnaYearMonth = async params => {
    let sql = `SELECT t1.yy, t1.mm, t1.c_all, t2.c5, t3.c_nm, t4.c_ch, t5.c_arm from 
    (SELECT YEAR(gacha_time) yy, MONTH(gacha_time) mm, count(*) c_all from gacha.genshin group by yy, mm) as t1
    left join 
    (SELECT YEAR(gacha_time) y1, MONTH(gacha_time) m1, count(*) c5 FROM gacha.genshin
    WHERE \`rank\` = 5 group by y1, m1) as t2
    on t1.yy=t2.y1 AND t1.mm = t2.m1
    left join 
    (SELECT YEAR(gacha_time) y2, MONTH(gacha_time) m2, count(*) c_nm FROM gacha.genshin
    WHERE gacha_type = 3 group by y2, m2) as t3
    on t1.yy=t3.y2 AND t1.mm = t3.m2
    left join 
    (SELECT YEAR(gacha_time) y3, MONTH(gacha_time) m3, count(*) c_ch FROM gacha.genshin
    WHERE gacha_type = 1 group by y3, m3) as t4
    on t1.yy=t4.y3 AND t1.mm = t4.m3
    left join 
    (SELECT YEAR(gacha_time) y4, MONTH(gacha_time) m4, count(*) c_arm FROM gacha.genshin
    WHERE gacha_type = 2 group by y4, m4) as t5
    on t1.yy=t5.y4 AND t1.mm = t5.m4`
    let result = {
        xAxisData: [],
        series: [
            {
                name: 'Total',
                type: 'line',
                data: []
            },
            {
                name: '五星',
                type: 'line',
                data: []
            },
            {
                name: '常驻池',
                type: 'line',
                data: []
            },
            {
                name: '角色UP池',
                type: 'line',
                data: []
            },
            {
                name: '武器池',
                type: 'line',
                data: []
            },
        ]
    };
    let r = await seqDb.query(sql, {type: Sequelize.SELECT })
    r = r[0]
    // console.log(r)
    
    r.forEach(e => {
        result.xAxisData.push(''+e.yy+'-'+e.mm)
        result.series[0].data.push(e.c_all===null ?0 :e.c_all)
        result.series[1].data.push(e.c5===null ?0 :e.c5)
        result.series[2].data.push(e.c_nm===null ?0 :e.c_nm)
        result.series[3].data.push(e.c_ch===null ?0 :e.c_ch)
        result.series[4].data.push(e.c_arm===null ?0 :e.c_arm)
    });
    return result
}

let queryAnaDaily = async params => {
    let result = []
    let queryYear = params['year']
    let whereQueryType = params['gacha_type']? `AND gacha_type = ${params['gacha_type']}`: ''
    let sql = `SELECT YEAR(gacha_time)yy, MONTH(gacha_time)mm, DAY(gacha_time)dd, COUNT(*)cd FROM gacha.genshin
    WHERE YEAR(gacha_time) = '${queryYear}' ${whereQueryType}
    GROUP BY yy, mm, dd`

    let r = await seqDb.query(sql, {type: Sequelize.SELECT })
    r = r[0]
    // console.log(r)

    r.forEach(e => {
        let m = ''+e.mm
        let d = ''+e.dd
        m = m.length == 1? `0${m}`: m
        d = d.length == 1? `0${d}`: d
        result.push([`${e.yy}-${m}-${d}`, e.cd])
    });

    return result
}

module.exports = {
    queryData: queryData,
    queryDataGroupCount: queryDataGroupCount,
    queryAnaYearMonth: queryAnaYearMonth,
    queryAnaDaily: queryAnaDaily
}