'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _formateErrors = require('../formateErrors.js');

var _formateErrors2 = _interopRequireDefault(_formateErrors);

var _permissions = require('../permissions.js');

var _permissions2 = _interopRequireDefault(_permissions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Query: {
    getTeamMembers: _permissions2.default.createResolver(function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(parent, _ref2, _ref3) {
        var teamId = _ref2.teamId;
        var db = _ref3.db;
        var getTeamMembers;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return db.sequelize.query('select * from users as u join members as m on m.user_id = u.id where m.team_id = ?', {
                  replacements: [teamId],
                  model: db.User,
                  raw: true
                });

              case 2:
                getTeamMembers = _context.sent;
                return _context.abrupt('return', getTeamMembers);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      };
    }())
  },
  Mutation: {
    createTeam: _permissions2.default.createResolver(function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(parent, args, _ref5) {
        var db = _ref5.db,
            user = _ref5.user;
        var responseTranscation;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return db.sequelize.transaction((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                  var newTeam;
                  return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return db.Team.create((0, _extends3.default)({}, args));

                        case 2:
                          newTeam = _context2.sent;
                          _context2.next = 5;
                          return db.Channel.create({
                            name: 'general',
                            public: true,
                            teamId: newTeam.id
                          });

                        case 5:
                          _context2.next = 7;
                          return db.Member.create({
                            teamId: newTeam.id,
                            userId: user.id,
                            admin: true
                          });

                        case 7:
                          return _context2.abrupt('return', newTeam);

                        case 8:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, undefined);
                })));

              case 3:
                responseTranscation = _context3.sent;
                return _context3.abrupt('return', {
                  ok: true,
                  team: responseTranscation
                });

              case 7:
                _context3.prev = 7;
                _context3.t0 = _context3['catch'](0);
                return _context3.abrupt('return', {
                  ok: false,
                  errors: (0, _formateErrors2.default)(_context3.t0, db)
                });

              case 10:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined, [[0, 7]]);
      }));

      return function (_x4, _x5, _x6) {
        return _ref4.apply(this, arguments);
      };
    }()),
    addTeamMember: _permissions2.default.createResolver(function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(parent, _ref8, _ref9) {
        var email = _ref8.email,
            teamId = _ref8.teamId;
        var db = _ref9.db,
            user = _ref9.user;

        var memberPromise, addUserPromise, _ref10, _ref11, member, addUser;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                _context4.next = 3;
                return db.Member.findOne({ where: { teamId: teamId, userId: user.id } }, { raw: true });

              case 3:
                memberPromise = _context4.sent;
                _context4.next = 6;
                return db.User.findOne({ where: { email: email } }, { raw: true });

              case 6:
                addUserPromise = _context4.sent;
                _context4.next = 9;
                return _promise2.default.all([memberPromise, addUserPromise]);

              case 9:
                _ref10 = _context4.sent;
                _ref11 = (0, _slicedToArray3.default)(_ref10, 2);
                member = _ref11[0];
                addUser = _ref11[1];

                if (member.admin) {
                  _context4.next = 15;
                  break;
                }

                return _context4.abrupt('return', {
                  ok: false,
                  errors: [{
                    path: 'email',
                    message: 'Cannot add member to team, not owner'
                  }]
                });

              case 15:
                if (addUser) {
                  _context4.next = 17;
                  break;
                }

                return _context4.abrupt('return', {
                  ok: false,
                  errors: [{
                    path: 'email',
                    message: 'This user does not exist. Please check email.'
                  }]
                });

              case 17:
                _context4.next = 19;
                return db.Member.create({ userId: addUser.id, teamId: teamId });

              case 19:
                return _context4.abrupt('return', {
                  ok: true
                });

              case 22:
                _context4.prev = 22;
                _context4.t0 = _context4['catch'](0);
                return _context4.abrupt('return', {
                  ok: false,
                  errors: (0, _formateErrors2.default)(_context4.t0, db)
                });

              case 25:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined, [[0, 22]]);
      }));

      return function (_x7, _x8, _x9) {
        return _ref7.apply(this, arguments);
      };
    }())
  },
  Team: {
    channels: function channels(_ref12, args, _ref13) {
      var id = _ref12.id;
      var channelLoader = _ref13.channelLoader;
      return channelLoader.load(id);
    },
    directMessageMembers: function directMessageMembers(_ref14, args, _ref15) {
      var id = _ref14.id;
      var db = _ref15.db,
          user = _ref15.user;
      return db.sequelize.query('select distinct on (u.id) u.id, u.username from users as u join direct_messages as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId', {
        replacements: { currentUserId: user.id, teamId: id },
        model: db.User,
        raw: true
      });
    }
  }
};