'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _formateErrors = require('../formateErrors.js');

var _formateErrors2 = _interopRequireDefault(_formateErrors);

var _auth = require('../auth.js');

var _permissions = require('../permissions.js');

var _permissions2 = _interopRequireDefault(_permissions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

//_.pick grabs what needed;

exports.default = {
  User: {
    teams: (parent, args, { db, user }) => db.sequelize.query('select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?', {
      replacements: [user.id],
      model: db.Team,
      raw: true
    })
  },
  Query: {
    allUsers: (parent, args, { db }) => db.User.findAll(),
    getUser: _permissions2.default.createResolver((parent, args, { db, user }) => db.User.findOne({ where: { id: user.id } })),
    getMessagedUser: (parent, { userId }, { db }) => db.User.findOne({ where: { id: userId } })
  },
  //username,email, password
  //dont add curly braces to es6 fns, unless more than 2 lines, or else they dont return a value
  Mutation: {
    login: (parent, { email, password }, { db, SECRET, SECRET2 }) => (0, _auth.tryLogin)(email, password, db, SECRET),
    register: async (parent, _ref, { db }) => {
      let { password } = _ref,
          otherArgs = _objectWithoutProperties(_ref, ['password']);

      try {
        if (password.length < 5) {
          return {
            ok: false,
            errors: [{
              path: 'password',
              message: 'Password need greater than 5 characters. '
            }]
          };
        } else {
          const hashedPassword = await _bcrypt2.default.hash(password, 11);
          const user = await db.User.create(_extends({}, otherArgs, {
            password: hashedPassword
          }));
          return {
            ok: true,
            user
          };
        }
      } catch (error) {
        return {
          ok: false,
          errors: (0, _formateErrors2.default)(error, db)
        };
      }
    }
    //faster query by using sql native
    //select all from teams as alias, join against members where teamId===member.teamId, then filter if also equals to userId
  } };