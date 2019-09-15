//import formateErrors from '../formateErrors.js';
import requiresAuth, { requiresTeamAccess } from '../permissions.js';
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from '../pubsub.js';
import fs from 'fs';
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
  Message: {
    user: ({ user, userId }, args, { db }) =>
      db.User.findOne({ where: { id: userId } })
  },
  Query: {
    messages: requiresAuth.createResolver(
      async (parent, { channelId }, { db, user }) => {
        const messages = await db.Message.findAll(
          { where: { channelId } },
          { raw: true }
        );
        return messages;
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
          const message = await db.Message.create({
            ...messageData,
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
