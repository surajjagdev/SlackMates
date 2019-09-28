'use strict';

//member schema
module.exports = function (sequelize, DataTypes) {
  var Member = sequelize.define('member', {
    admin: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue: false
    }
  });
  return Member;
};