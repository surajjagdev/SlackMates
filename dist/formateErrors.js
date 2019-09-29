'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (e, db) => {
  if (e instanceof db.Sequelize.ValidationError) {
    return e.errors.map(err => _lodash2.default.pick(err, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong.' }];
};