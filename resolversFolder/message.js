//import formateErrors from '../formateErrors.js';
import requiresAuth, { requiresTeamAccess } from '../permissions.js';
import { withFilter } from 'graphql-subscriptions';
import pubsub from '../pubsub.js';
import fs from 'fs';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import Sequelize from 'sequelize';
import { sequelize } from '../models/index.js';
const moment = require('moment');
const Op = Sequelize.Op;
//event name
//listen for new channel message via pubsub
const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';
const uploadFile = async (stream, filename) => {
  const uploadDir = './uploadfolder';
  const path = `${uploadDir}/${filename}`;
  const writestream = await fs.createWriteStream(path);
  stream.pipe(writestream);
};
export default {
  Subscription: {
    newChannelMessage: {
      subscribe: requiresTeamAccess.createResolver(
        withFilter(
          () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
          (payload, args) => payload.channelId === args.channelId
        )
      )
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'date scalar type',
    parseValue(value) {
      console.log('parse value: ', value);
      return new Date(value);
    },
    serialize(value) {
      console.log('seralize value: ', value);
      return new Date(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    }
  }),
  Message: {
    url: parent =>
      parent.url ? `http://localhost:3001/static/${parent.url}` : parent.url,
    user: ({ user, userId }, args, { db }) => {
      if (user) {
        return user;
      }
      console.log('\nyes\n');
      return db.User.findOne({ where: { id: userId } });
    }
  },
  Query: {
    messages: requiresAuth.createResolver(
      async (parent, { cursor, channelId }, { db, user }) => {
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
            throw new Error(
              'Not authorized to see messages to which you are not a part of.'
            );
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
        return db.Message.findAll(options, { raw: true });
      }
    )
  },
  Mutation: {
    createMessage: requiresAuth.createResolver(
      async (parent, { file, ...args }, { db, user }) => {
        try {
          let messageData = args;
          if (file) {
            console.log('fileAWait: ', await file, ' \n');
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
          console.log('\n, now: ', now, '\n');
          const message = await db.Message.create({
            ...messageData,
            created_at: now.format(),
            userId: user.id
          });
          //pubsub publish: event name and schema query
          //get back message.dataValues, b/c from sequelize
          pubsub.publish(NEW_CHANNEL_MESSAGE, {
            channelId: args.channelId,
            newChannelMessage: message.dataValues
          });
          return true;
        } catch (err) {
          console.log('err:', err);
          return false;
        }
      }
    )
  }
};
/*Query:{
   messages:async(parent, args, {db, user})=>[//]
 },*/
