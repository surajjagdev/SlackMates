'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

// Override timezone formatting
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);
  // Z here means current timezone, _not_ UTC
  // return date.format('YYYY-MM-DD HH:mm:ss.SSS Z');
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

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
db.PrivateMember = require('./privatemember.js')(sequelize, Sequelize);
//associations
//User associations
db.User.belongsToMany(db.Team, {
  through: db.Member,
  foreignKey: { name: 'userId', field: 'user_id' }
});
db.User.belongsToMany(db.Channel, {
  through: 'channel_member',
  foreignKey: { name: 'userId', field: 'user_id' }
});
db.User.belongsToMany(db.Channel, {
  through: 'private_member',
  foreignKey: {
    name: 'userId',
    field: 'user_id'
  }
});
db.Team.belongsToMany(db.User, {
  through: db.Member,
  foreignKey: { name: 'teamId', field: 'team_id' }
});
//db.Team.belongsTo(db.User, { foreignKey: 'owner' });
db.Message.belongsTo(db.Channel, {
  foreignKey: { name: 'channelId', field: 'channel_id' }
});
db.Channel.belongsToMany(db.User, {
  through: 'channel_member',
  foreignKey: { name: 'channelId', field: 'channel_id' }
});
db.Message.belongsTo(db.User, {
  foreignKey: { name: 'userId', field: 'user_id' }
});
db.Channel.belongsTo(db.Team, {
  foreignKey: { name: 'teamId', field: 'team_id' }
});
db.Channel.belongsToMany(db.User, {
  through: 'private_member',
  foreignKey: {
    name: 'channelId',
    field: 'channel_id'
  }
});
module.exports = db;
