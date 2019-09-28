'use strict';

//member schema
module.exports = function (sequelize, DataTypes) {
  var PrivateMember = sequelize.define('private_member', {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: true
      }
    }
  });
  return PrivateMember;
};