//user schema
module.exports = function(sequelize, DataTypes) {
  const Message = sequelize.define('message', {
    text: {
      type: DataTypes.STRING
    }
  });
  return Message;
};
