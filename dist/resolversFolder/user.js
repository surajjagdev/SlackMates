'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _formateErrors = require('../formateErrors.js');

var _formateErrors2 = _interopRequireDefault(_formateErrors);

var _auth = require('../auth.js');

var _permissions = require('../permissions.js');

var _permissions2 = _interopRequireDefault(_permissions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//_.pick grabs what needed;

exports.default = {
  User: {
    teams: function teams(parent, args, _ref) {
      var db = _ref.db,
          user = _ref.user;
      return db.sequelize.query('select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?', {
        replacements: [user.id],
        model: db.Team,
        raw: true
      });
    }
  },
  Query: {
    allUsers: function allUsers(parent, args, _ref2) {
      var db = _ref2.db;
      return db.User.findAll();
    },
    getUser: _permissions2.default.createResolver(function (parent, args, _ref3) {
      var db = _ref3.db,
          user = _ref3.user;
      return db.User.findOne({ where: { id: user.id } });
    }),
    getMessagedUser: function getMessagedUser(parent, _ref4, _ref5) {
      var userId = _ref4.userId;
      var db = _ref5.db;
      return db.User.findOne({ where: { id: userId } });
    }
  },
  //username,email, password
  //dont add curly braces to es6 fns, unless more than 2 lines, or else they dont return a value
  Mutation: {
    login: function login(parent, _ref6, _ref7) {
      var email = _ref6.email,
          password = _ref6.password;
      var db = _ref7.db,
          SECRET = _ref7.SECRET,
          SECRET2 = _ref7.SECRET2;
      return (0, _auth.tryLogin)(email, password, db, SECRET);
    },
    register: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(parent, _ref9, _ref10) {
        var password = _ref9.password,
            otherArgs = (0, _objectWithoutProperties3.default)(_ref9, ['password']);
        var db = _ref10.db;
        var hashedPassword, user;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!(password.length < 5)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return', {
                  ok: false,
                  errors: [{
                    path: 'password',
                    message: 'Password need greater than 5 characters. '
                  }]
                });

              case 5:
                _context.next = 7;
                return _bcrypt2.default.hash(password, 11);

              case 7:
                hashedPassword = _context.sent;
                _context.next = 10;
                return db.User.create((0, _extends3.default)({}, otherArgs, {
                  password: hashedPassword
                }));

              case 10:
                user = _context.sent;
                return _context.abrupt('return', {
                  ok: true,
                  user: user
                });

              case 12:
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context['catch'](0);
                return _context.abrupt('return', {
                  ok: false,
                  errors: (0, _formateErrors2.default)(_context.t0, db)
                });

              case 17:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined, [[0, 14]]);
      }));

      return function register(_x, _x2, _x3) {
        return _ref8.apply(this, arguments);
      };
    }()
    //faster query by using sql native
    //select all from teams as alias, join against members where teamId===member.teamId, then filter if also equals to userId
  } };