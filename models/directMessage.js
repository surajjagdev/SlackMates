//user schema
module.exports = function(sequelize, DataTypes) {
  const DirectMessage = sequelize.define('direct_message', {
    text: {
      type: DataTypes.STRING
    }
  });
  return DirectMessage;
};
