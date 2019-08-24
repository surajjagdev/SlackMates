//user schema
module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      type: DataTypes.STRING
    }
  });
  return User;
};
