'use strict';

//user schema
module.exports = function (sequelize, DataTypes) {
  var Channel = sequelize.define('channel', {
    name: {
      type: DataTypes.STRING
    },
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    directmessage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
  return Channel;
};