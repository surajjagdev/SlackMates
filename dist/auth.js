'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tryLogin = exports.refreshTokens = exports.createTokens = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var createTokens = exports.createTokens = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(user, secret, secret2) {
    var createToken, createRefreshToken;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createToken = _jsonwebtoken2.default.sign({
              user: _lodash2.default.pick(user, ['id', 'username'])
            }, secret, {
              expiresIn: '7d'
            });
            createRefreshToken = _jsonwebtoken2.default.sign({
              user: _lodash2.default.pick(user, 'id')
            }, secret2, {
              expiresIn: '7d'
            });
            return _context.abrupt('return', [createToken, createRefreshToken]);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function createTokens(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var refreshTokens = exports.refreshTokens = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(token, refreshToken, db, SECRET, SECRET2) {
    var userId, _jwt$decode, id, user, refreshSecret, _ref3, _ref4, _newToken, _newRefreshToken, _ref5, _ref6, newToken, newRefreshToken;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            userId = 0;
            _context2.prev = 1;
            _jwt$decode = _jsonwebtoken2.default.decode(refreshToken), id = _jwt$decode.user.id;

            userId = id;
            _context2.next = 10;
            break;

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2['catch'](1);

            console.log('err: ', _context2.t0);
            return _context2.abrupt('return', {});

          case 10:
            if (userId) {
              _context2.next = 12;
              break;
            }

            return _context2.abrupt('return', {});

          case 12:
            _context2.next = 14;
            return db.User.findOne({ where: { id: userId }, raw: true });

          case 14:
            user = _context2.sent;

            if (user) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt('return', {});

          case 17:
            refreshSecret = user.password + SECRET2;
            _context2.prev = 18;

            _jsonwebtoken2.default.verify(refreshToken, refreshSecret);
            _context2.next = 25;
            break;

          case 22:
            _context2.prev = 22;
            _context2.t1 = _context2['catch'](18);
            return _context2.abrupt('return', {});

          case 25:
            _context2.prev = 25;
            _context2.prev = 26;
            _context2.next = 29;
            return createTokens(user, SECRET, refreshSecret);

          case 29:
            _ref3 = _context2.sent;
            _ref4 = _slicedToArray(_ref3, 2);
            _newToken = _ref4[0];
            _newRefreshToken = _ref4[1];
            return _context2.abrupt('return', {
              token: _newToken,
              refreshToken: _newRefreshToken,
              user: user
            });

          case 36:
            _context2.prev = 36;
            _context2.t2 = _context2['catch'](26);

            console.log(_context2.t2);

          case 39:
            return _context2.finish(25);

          case 40:
            _context2.next = 42;
            return createTokens(user, SECRET, refreshSecret);

          case 42:
            _ref5 = _context2.sent;
            _ref6 = _slicedToArray(_ref5, 2);
            newToken = _ref6[0];
            newRefreshToken = _ref6[1];
            return _context2.abrupt('return', {
              token: newToken,
              refreshToken: newRefreshToken,
              user: user
            });

          case 47:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[1, 6], [18, 22, 25, 40], [26, 36]]);
  }));

  return function refreshTokens(_x4, _x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
}();

var tryLogin = exports.tryLogin = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(email, password, db, SECRET, SECRET2) {
    var user, valid, refreshTokenSecret, _ref8, _ref9, token, refreshToken;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return db.User.findOne({ where: { email: email }, raw: true });

          case 2:
            user = _context3.sent;

            if (user) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt('return', {
              ok: false,
              errors: [{ path: 'email', message: 'Wrong email' }]
            });

          case 5:
            _context3.next = 7;
            return _bcrypt2.default.compare(password, user.password);

          case 7:
            valid = _context3.sent;

            if (valid) {
              _context3.next = 10;
              break;
            }

            return _context3.abrupt('return', {
              ok: false,
              errors: [{ path: 'password', message: 'Wrong password' }]
            });

          case 10:
            refreshTokenSecret = user.password + SECRET2;
            _context3.next = 13;
            return createTokens(user, SECRET, refreshTokenSecret);

          case 13:
            _ref8 = _context3.sent;
            _ref9 = _slicedToArray(_ref8, 2);
            token = _ref9[0];
            refreshToken = _ref9[1];
            return _context3.abrupt('return', {
              ok: true,
              token: token,
              refreshToken: refreshToken
            });

          case 18:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function tryLogin(_x9, _x10, _x11, _x12, _x13) {
    return _ref7.apply(this, arguments);
  };
}();