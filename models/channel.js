//user schema
module.exports = function(sequelize, DataTypes) {
  const Channel = sequelize.define('channel', {
    name: {
      type: DataTypes.STRING
    },
    public: {
      type: DataTypes.BOOLEAN
    }
  });
  return Channel;
};
