//import formateErrors from '../formateErrors.js';
import requiresAuth, { requiresTeamAccess } from '../permissions.js';
import { PubSub, withFilter } from 'graphql-subscriptions';
const pubsub = new PubSub();
//event name
//listen for new channel message via pubsub
const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';
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
      async (parent, args, { db, user }) => {
        try {
          const message = await db.Message.create({ ...args, userId: user.id });
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
