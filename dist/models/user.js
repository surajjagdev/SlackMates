'use strict';

//user schema
const uuidv4 = require('uuid/v4');
module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      validate: {
        notNull: true
      },
      defaultValue: () => uuidv4()
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isAlphanumeric: {
          args: true,
          msg: 'Username can only contain letter and/or numbers.'
        },
        len: {
          args: [4, 20],
          msg: 'Username must be between 4 and 20 characters.'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid email.'
        }
      }
    },
    password: {
      type: DataTypes.STRING
    }
  });
  return User;
};