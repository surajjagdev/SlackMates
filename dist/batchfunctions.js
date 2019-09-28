'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var channelBatcher = exports.channelBatcher = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ids, db, user) {
    var results, data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return db.sequelize.query('select distinct on (id) * from channels as c left outer join private_members as pm on c.id=pm.channel_id where c.team_id in (:teamIds) and (c.public=true or pm.user_id=:userId) ', {
              replacements: { teamIds: ids, userId: user.id },
              model: db.Channel,
              raw: true
            });

          case 2:
            results = _context.sent;
            data = {};
            //group by team;

            results.forEach(function (r) {
              if (data[r.team_id]) {
                data[r.team_id].push(r);
              } else {
                data[r.team_id] = [r];
              }
            });
            return _context.abrupt('return', ids.map(function (id) {
              return data[id];
            }));

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function channelBatcher(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();