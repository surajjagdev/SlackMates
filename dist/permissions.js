'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var createResolver = function createResolver(resolver) {
  var baseResolver = resolver;
  baseResolver.createResolver = function (childResolver) {
    var newResolver = function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, args, context, info) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return resolver(parent, args, context, info);

              case 2:
                return _context.abrupt('return', childResolver(parent, args, context, info));

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function newResolver(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    }();
    return createResolver(newResolver);
  };
  return baseResolver;
};

// requiresAuth
//wrapper
exports.default = createResolver(function (parent, args, _ref2) {
  var user = _ref2.user;

  if (!user || !user.id) {
    throw new Error('not authenticated');
  }
});
var requiresTeamAccess = exports.requiresTeamAccess = createResolver(function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(parent, _ref4, _ref5) {
    var channelId = _ref4.channelId;
    var user = _ref5.user,
        db = _ref5.db;
    var channel, member;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(!user || !user.user.id)) {
              _context2.next = 2;
              break;
            }

            throw Error('Not Authenticated');

          case 2:
            _context2.next = 4;
            return db.Channel.findOne({ where: { id: channelId } });

          case 4:
            channel = _context2.sent;
            _context2.next = 7;
            return db.Member.findOne({
              where: { teamId: channel.teamId, userId: user.user.id }
            });

          case 7:
            member = _context2.sent;

            if (member) {
              _context2.next = 10;
              break;
            }

            throw new Error("You have to be a member of the team to subcribe to it's messages");

          case 10:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}());
var directMessageSubscription = exports.directMessageSubscription = createResolver(function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(parent, _ref7, _ref8) {
    var teamId = _ref7.teamId,
        userId = _ref7.userId;
    var user = _ref8.user,
        db = _ref8.db;
    var member;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(!user || !user.user.id)) {
              _context3.next = 2;
              break;
            }

            throw Error('Not Authenticated');

          case 2:
            _context3.next = 4;
            return db.Member.findAll({
              where: _defineProperty({
                teamId: teamId
              }, Op.or, [{
                userId: user.user.id
              }, {
                userId: userId
              }])
            });

          case 4:
            member = _context3.sent;

            if (!(member.length !== 2)) {
              _context3.next = 7;
              break;
            }

            throw new Error('Something went wrong. Your friend is not apart of yout team');

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x8, _x9, _x10) {
    return _ref6.apply(this, arguments);
  };
}());