const Sequelize = require('sequelize');
const sequelize = require('../database/db');

const Genshin = sequelize.define('genshin', {
  gacha_time: {
    type: Sequelize.DATE,
    allowNull: false,
    comment: "抽卡时间"
  },
  item: {
    type: Sequelize.STRING(100),
    allowNull: false,
    comment: "抽卡物品名称"
  },
  item_type: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: "物品类别-> 1:角色 2:武器"
  },
  rank: {
    type: Sequelize.INTEGER,
    allowNull: true,
    comment: "物品稀有度"
  },
  times_in_total: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: "总次数"
  },
  times_in_guaranteed: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: "保底内次数"
  },
  gacha_type: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: "卡池类别-> 1:角色 2:武器 3:常驻 0: 新手"
  }
}, {
  sequelize,
  tableName: 'genshin',
  timestamps: false,
  indexes: [
    {
      name: "genshin_UN",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "gacha_type" },
        { name: "times_in_total" },
      ]
    },
  ]
});

//创建表，默认是false，true则是删除原有表，再创建
Genshin.sync({
  force: false,
});
Genshin.removeAttribute('id')
module.exports = Genshin;