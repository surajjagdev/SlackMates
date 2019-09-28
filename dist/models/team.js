'use strict';

//user schema
module.exports = function (sequelize, DataTypes) {
  var Team = sequelize.define('team', {
    name: {
      type: DataTypes.STRING,
      unique: true
    }
  });
  return Team;
};