//user schema
module.exports = function(sequelize, DataTypes) {
  const Channel = sequelize.define('channel', {
    username: {
      type: DataTypes.STRING
    },
    public: {
      type: DataTypes.BOOLEAN
    }
  });
  return Channel;
};
