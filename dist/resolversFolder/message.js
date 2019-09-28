'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _permissions = require('../permissions.js');

var _permissions2 = _interopRequireDefault(_permissions);

var _graphqlSubscriptions = require('graphql-subscriptions');

var _pubsub = require('../pubsub.js');

var _pubsub2 = _interopRequireDefault(_pubsub);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _graphql = require('graphql');

var _language = require('graphql/language');

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } //import formateErrors from '../formateErrors.js';


var moment = require('moment');
var Op = _sequelize2.default.Op;
//event name
//listen for new channel message via pubsub
var NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';
var uploadFile = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(stream, filename) {
    var uploadDir, path, writestream;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            uploadDir = './uploadfolder';
            path = uploadDir + '/' + filename;
            _context.next = 4;
            return _fs2.default.createWriteStream(path);

          case 4:
            writestream = _context.sent;

            stream.pipe(writestream);

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function uploadFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports.default = {
  Subscription: {
    newChannelMessage: {
      subscribe: _permissions.requiresTeamAccess.createResolver((0, _graphqlSubscriptions.withFilter)(function () {
        return _pubsub2.default.asyncIterator(NEW_CHANNEL_MESSAGE);
      }, function (payload, args) {
        return payload.channelId === args.channelId;
      }))
    }
  },
  Date: new _graphql.GraphQLScalarType({
    name: 'Date',
    description: 'date scalar type',
    parseValue: function parseValue(value) {
      console.log('parse value: ', value);
      return new Date(value);
    },
    serialize: function serialize(value) {
      return new Date(value);
    },
    parseLiteral: function parseLiteral(ast) {
      if (ast.kind === _language.Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    }
  }),
  Message: {
    url: function url(parent, args, _ref2) {
      var serverUrl = _ref2.serverUrl;
      return parent.url ? serverUrl + '/static/' + parent.url : parent.url;
    },
    user: function user(_ref3, args, _ref4) {
      var _user = _ref3.user,
          userId = _ref3.userId;
      var db = _ref4.db;

      if (_user) {
        return _user;
      }
      //data load this as well
      return db.User.findOne({ where: { id: userId } });
    }
  },
  Query: {
    messages: _permissions2.default.createResolver(function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(parent, _ref6, _ref7) {
        var cursor = _ref6.cursor,
            channelId = _ref6.channelId;
        var db = _ref7.db,
            user = _ref7.user;
        var channel, member, options;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return db.Channel.findOne({
                  where: { id: channelId },
                  raw: true
                });

              case 2:
                channel = _context2.sent;

                if (channel.public) {
                  _context2.next = 9;
                  break;
                }

                _context2.next = 6;
                return db.PrivateMember.findOne({
                  where: { channelId: channelId, userId: user.id },
                  raw: true
                });

              case 6:
                member = _context2.sent;

                if (member) {
                  _context2.next = 9;
                  break;
                }

                throw new Error('Not authorized to see messages to which you are not a part of.');

              case 9:
                options = {
                  order: [['created_at', 'DESC']],
                  where: { channelId: channelId },
                  limit: 35
                };
                //find all elements after cursor;

                if (cursor) {
                  console.log('cursor: ', cursor);
                  options.where.created_at = _defineProperty({}, Op.lt, cursor);
                }
                /*const newMessage = await db.sequelize.query(
                  'select * from messages where "messages"."createdAt" = ?',
                  {
                    replacements: ['2019-09-25 16:50:40.132'],
                    model: db.Message,
                    raw: false
                  }
                );*/
                /* const newMessage = await db.Message.findAll({
                  where: { createdAt: '2019-09-25 20:50:17.769' }
                });
                console.log('new message: ', newMessage);*/
                return _context2.abrupt('return', db.Message.findAll(options, { raw: true }));

              case 12:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, undefined);
      }));

      return function (_x3, _x4, _x5) {
        return _ref5.apply(this, arguments);
      };
    }())
  },
  Mutation: {
    createMessage: _permissions2.default.createResolver(function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(parent, _ref9, _ref10) {
        var file = _ref9.file,
            args = _objectWithoutProperties(_ref9, ['file']);

        var db = _ref10.db,
            user = _ref10.user;

        var messageData, _ref11, filename, mimetype, encoding, createReadStream, stream, now, message;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                messageData = args;

                if (!file) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 5;
                return file;

              case 5:
                _ref11 = _context3.sent;
                filename = _ref11.filename;
                mimetype = _ref11.mimetype;
                encoding = _ref11.encoding;
                createReadStream = _ref11.createReadStream;

                messageData.filetype = mimetype;
                messageData.url = filename;
                stream = createReadStream();

                uploadFile(stream, filename);

              case 14:
                now = moment();
                _context3.next = 17;
                return db.Message.create(_extends({}, messageData, {
                  created_at: now.format(),
                  userId: user.id
                }));

              case 17:
                message = _context3.sent;

                //pubsub publish: event name and schema query
                //get back message.dataValues, b/c from sequelize
                _pubsub2.default.publish(NEW_CHANNEL_MESSAGE, {
                  channelId: args.channelId,
                  newChannelMessage: message.dataValues
                });
                return _context3.abrupt('return', true);

              case 22:
                _context3.prev = 22;
                _context3.t0 = _context3['catch'](0);

                console.log('err:', _context3.t0);
                return _context3.abrupt('return', false);

              case 26:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined, [[0, 22]]);
      }));

      return function (_x6, _x7, _x8) {
        return _ref8.apply(this, arguments);
      };
    }())
  }
};
/*Query:{
   messages:async(parent, args, {db, user})=>[//]
 },*/