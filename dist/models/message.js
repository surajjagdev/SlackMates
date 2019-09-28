'use strict';

//user schema
var withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = function (sequelize, DataTypes) {
  var DataTypesZ = withDateNoTz(DataTypes);
  var Message = sequelize.define('message', {
    text: {
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING
    },
    filetype: {
      type: DataTypes.STRING
    },
    created_at: {
      type: DataTypesZ.DATE_NO_TZ,
      allownull: false
    }
  }, {
    indexes: [{
      fields: ['created_at']
    }]
  });
  return Message;
};