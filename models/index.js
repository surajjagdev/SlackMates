'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
/*
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });
*/
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
//models/tables
db.User = require('./user.js')(sequelize, Sequelize);
//db.Member = require('./member.js')(sequelize, Sequelize);
db.Message = require('./message.js')(sequelize, Sequelize);
db.Team = require('./team.js')(sequelize, Sequelize);
db.Channel = require('./channel.js')(sequelize, Sequelize);
db.Member = require('./member.js')(sequelize, Sequelize);
//associations
//User associations
db.User.belongsToMany(db.Team, { through: db.Member, foreignKey: 'userId' });
db.User.belongsToMany(db.Channel, {
  through: 'channel_member',
  foreignKey: 'userId'
});
db.Team.belongsToMany(db.User, { through: db.Member, foreignKey: 'teamId' });
db.Team.belongsTo(db.User, { foreignKey: 'owner' });
db.Message.belongsTo(db.Channel, { foreignKey: 'channelId' });
db.Channel.belongsToMany(db.User, {
  through: 'channel_member',
  foreignKey: 'channelId'
});
db.Message.belongsTo(db.User, { foreignKey: 'userId' });
db.Channel.belongsTo(db.Team, { foreignKey: 'teamId' });
module.exports = db;
