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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } //import formateErrors from '../formateErrors.js';


const moment = require('moment');
const Op = _sequelize2.default.Op;
//event name
//listen for new channel message via pubsub
const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';
const uploadFile = async (stream, filename) => {
  const uploadDir = './uploadfolder';
  if (!_fs2.default.existsSync(uploadDir)) {
    _fs2.default.mkdirSync(uploadDir);
  }
  const path = `${uploadDir}/${filename}`;
  const writestream = await _fs2.default.createWriteStream(path);
  stream.pipe(writestream);
};
exports.default = {
  Subscription: {
    newChannelMessage: {
      subscribe: _permissions.requiresTeamAccess.createResolver((0, _graphqlSubscriptions.withFilter)(() => _pubsub2.default.asyncIterator(NEW_CHANNEL_MESSAGE), (payload, args) => payload.channelId === args.channelId))
    }
  },
  Date: new _graphql.GraphQLScalarType({
    name: 'Date',
    description: 'date scalar type',
    parseValue(value) {
      console.log('parse value: ', value);
      return new Date(value);
    },
    serialize(value) {
      return new Date(value);
    },
    parseLiteral(ast) {
      if (ast.kind === _language.Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    }
  }),
  Message: {
    url: (parent, args, { serverUrl }) => parent.url ? `${serverUrl}/static/${parent.url}` : parent.url,
    user: ({ user, userId }, args, { db }) => {
      if (user) {
        return user;
      }
      //data load this as well
      return db.User.findOne({ where: { id: userId } });
    }
  },
  Query: {
    messages: _permissions2.default.createResolver(async (parent, { cursor, channelId }, { db, user }) => {
      const channel = await db.Channel.findOne({
        where: { id: channelId },
        raw: true
      });
      if (!channel.public) {
        const member = await db.PrivateMember.findOne({
          where: { channelId: channelId, userId: user.id },
          raw: true
        });
        if (!member) {
          throw new Error('Not authorized to see messages to which you are not a part of.');
        }
      }
      const options = {
        order: [['created_at', 'DESC']],
        where: { channelId },
        limit: 35
      };
      //find all elements after cursor;
      if (cursor) {
        console.log('cursor: ', cursor);
        options.where.created_at = {
          [Op.lt]: cursor
        };
      }
      return db.Message.findAll(options, { raw: true });
    })
  },
  Mutation: {
    createMessage: _permissions2.default.createResolver(async (parent, _ref, { db, user }) => {
      let { file } = _ref,
          args = _objectWithoutProperties(_ref, ['file']);

      try {
        let messageData = args;
        if (file) {
          const {
            filename,
            mimetype,
            encoding,
            createReadStream
          } = await file;
          messageData.filetype = mimetype;
          messageData.url = filename;
          const stream = createReadStream();
          uploadFile(stream, filename);
        }
        const now = moment();
        const message = await db.Message.create(_extends({}, messageData, {
          created_at: now.format(),
          userId: user.id
        }));
        //pubsub publish: event name and schema query
        //get back message.dataValues, b/c from sequelize
        _pubsub2.default.publish(NEW_CHANNEL_MESSAGE, {
          channelId: args.channelId,
          newChannelMessage: message.dataValues
        });
        return true;
      } catch (err) {
        console.log('err:', err);
        return false;
      }
    })
  }
};
/*Query:{
   messages:async(parent, args, {db, user})=>[//]
 },*/