//member schema
module.exports = function(sequelize, DataTypes) {
  const PrivateMember = sequelize.define('private_member', {});
  return PrivateMember;
};
