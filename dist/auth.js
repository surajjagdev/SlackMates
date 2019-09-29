'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tryLogin = exports.refreshTokens = exports.createTokens = undefined;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createTokens = exports.createTokens = async (user, secret, secret2) => {
  const createToken = _jsonwebtoken2.default.sign({
    user: _lodash2.default.pick(user, ['id', 'username'])
  }, secret, {
    expiresIn: '7d'
  });

  const createRefreshToken = _jsonwebtoken2.default.sign({
    user: _lodash2.default.pick(user, 'id')
  }, secret2, {
    expiresIn: '7d'
  });

  return [createToken, createRefreshToken];
};

const refreshTokens = exports.refreshTokens = async (token, refreshToken, db, SECRET, SECRET2) => {
  let userId = 0;
  try {
    const {
      user: { id }
    } = _jsonwebtoken2.default.decode(refreshToken);
    userId = id;
  } catch (err) {
    console.log('err: ', err);
    return {};
  }

  if (!userId) {
    return {};
  }

  const user = await db.User.findOne({ where: { id: userId }, raw: true });
  if (!user) {
    return {};
  }
  const refreshSecret = user.password + SECRET2;
  try {
    _jsonwebtoken2.default.verify(refreshToken, refreshSecret);
  } catch (err) {
    return {};
  } finally {
    try {
      const [newToken, newRefreshToken] = await createTokens(user, SECRET, refreshSecret);
      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: user
      };
    } catch (err) {
      console.log(err);
    }
  }

  const [newToken, newRefreshToken] = await createTokens(user, SECRET, refreshSecret);
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user
  };
};

const tryLogin = exports.tryLogin = async (email, password, db, SECRET, SECRET2) => {
  const user = await db.User.findOne({ where: { email }, raw: true });
  if (!user) {
    // user with provided email not found
    return {
      ok: false,
      errors: [{ path: 'email', message: 'Wrong email' }]
    };
  }

  const valid = await _bcrypt2.default.compare(password, user.password);
  if (!valid) {
    // bad password
    return {
      ok: false,
      errors: [{ path: 'password', message: 'Wrong password' }]
    };
  }

  const refreshTokenSecret = user.password + SECRET2;

  const [token, refreshToken] = await createTokens(user, SECRET, refreshTokenSecret);

  return {
    ok: true,
    token,
    refreshToken
  };
};