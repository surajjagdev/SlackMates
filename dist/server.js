'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV !== 'production') require('dotenv').config();
var express = require('express');
var jwt = require('jsonwebtoken');

var _require = require('./auth.js'),
    refreshTokens = _require.refreshTokens;

var _require2 = require('apollo-server-express'),
    ApolloServer = _require2.ApolloServer;

var path = require('path');

var _require3 = require('merge-graphql-schemas'),
    fileLoader = _require3.fileLoader,
    mergeTypes = _require3.mergeTypes,
    mergeResolvers = _require3.mergeResolvers;

var db = require('./models');
var DataLoader = require('dataloader');

var _require4 = require('./batchfunctions.js'),
    channelBatcher = _require4.channelBatcher;

var cors = require('cors');
var app = express();
var http = require('http');
var port = process.env.PORT || 3001;
//
//
var addUser = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res, next) {
    var token, _jwt$verify, user, refreshToken, newTokens;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            token = req.headers['token'];

            if (!(token && token !== null)) {
              _context.next = 15;
              break;
            }

            _context.prev = 2;
            _jwt$verify = jwt.verify(token, process.env.JWTSECRET), user = _jwt$verify.user;

            req.user = user;
            _context.next = 15;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context['catch'](2);
            refreshToken = req.headers['refreshtoken'];
            _context.next = 12;
            return refreshTokens(token, refreshToken, db, process.env.JWTSECRET, process.env.JWTSECRET2);

          case 12:
            newTokens = _context.sent;

            if (newTokens.token && newTokens.refreshToken) {
              res.set('Access-Control-Expose-Headers', 'token, refreshtoken');
              res.set('token', newTokens.token);
              res.set('refreshtoken', newTokens.refreshToken);
            }
            req.user = newTokens.user;

          case 15:
            next();

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 7]]);
  }));

  return function addUser(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var endpoint = '/graphql';
//mash together typeDefs and resolvers.
var types = fileLoader(path.join(__dirname, './schemaFolder'));
var resolversArray = fileLoader(path.join(__dirname, './resolversFolder'));
//merge all files
var typeDefs = mergeTypes(types);
var resolvers = mergeResolvers(resolversArray);
//start apollo server
var server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {
      var req = _ref3.req,
          connection = _ref3.connection;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt('return', {
                db: db,
                user: connection ? connection.context : req.user,
                SECRET: process.env.JWTSECRET,
                SECRET2: process.env.JWTSECRET2,
                channelLoader: new DataLoader(function (ids) {
                  return channelBatcher(ids, db, req.user);
                }),
                serverUrl: process.env.SERVERURL
              });

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function context(_x4) {
      return _ref2.apply(this, arguments);
    };
  }(),
  subscriptions: {
    onConnect: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref5, webSocket) {
        var token = _ref5.token,
            refreshToken = _ref5.refreshToken;

        var _jwt$verify2, user, newTokens;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(token && refreshToken)) {
                  _context3.next = 12;
                  break;
                }

                _context3.prev = 1;

                //check user from token then pass back user and db. To see if
                //users are allowrd or whatever
                _jwt$verify2 = jwt.verify(token, process.env.JWTSECRET), user = _jwt$verify2.user;
                return _context3.abrupt('return', { db: db, user: user });

              case 6:
                _context3.prev = 6;
                _context3.t0 = _context3['catch'](1);
                _context3.next = 10;
                return refreshTokens(token, refreshToken, db, process.env.JWTSECRET, process.env.JWTSECRET2);

              case 10:
                newTokens = _context3.sent;
                return _context3.abrupt('return', { db: db, user: newTokens.user });

              case 12:
                return _context3.abrupt('return', { db: db });

              case 13:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined, [[1, 6]]);
      }));

      return function onConnect(_x5, _x6) {
        return _ref4.apply(this, arguments);
      };
    }()
  },
  playground: {
    endpoint: endpoint,
    settings: {
      'editor.theme': 'light'
    }
  }
});
var corsOption = {
  origin: process.env.FRONTEND,
  credentials: true
};
app.use(cors(corsOption));
app.use(addUser);
//access static files from /files url
app.use('/static', express.static('uploadfolder'));
server.applyMiddleware({ app: app });
//create server using http
var httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

db.sequelize.sync().then(function () {
  httpServer.listen(port, function () {
    console.log('server ready at http://localhost:' + port + server.graphqlPath);
    console.log('Subscriptions ready at ws://localhost:' + port + server.subscriptionsPath);
  });
});