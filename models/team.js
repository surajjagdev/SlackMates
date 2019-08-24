//user schema
module.exports = function(sequelize, DataTypes) {
  const Team = sequelize.define('team', {
    name: {
      type: DataTypes.STRING,
      unique: true
    }
  });
  return Team;
};
