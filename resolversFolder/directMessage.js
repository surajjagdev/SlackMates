//import formateErrors from '../formateErrors.js';
import Sequelize from 'sequelize';
import requiresAuth, { directMessageSubscription } from '../permissions.js';
import { pubsub } from '../pubsub.js';
import { withFilter } from 'graphql-subscriptions';
const Op = Sequelize.Op;
const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE';
export default {
  DirectMessage: {
    sender: ({ sender, senderId }, args, { db }) => {
      if (sender) {
        return sender;
      }
      return db.User.findOne({ where: { id: senderId } }, { raw: true });
    }
  },
  Subscription: {
    newDirectMessage: {
      subscribe: directMessageSubscription.createResolver(
        withFilter(
          () => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
          (payload, args, { user }) =>
            payload.teamId === args.teamId &&
            ((payload.senderId === user.user.id &&
              payload.receiverId === args.userId) ||
              (payload.senderId === args.userId &&
                payload.receiverId === user.user.id))
        )
      )
    }
  },
  Query: {
    directMessages: requiresAuth.createResolver(
      async (parent, { teamId, otherUserId }, { db, user }) =>
        db.DirectMessage.findAll(
          {
            order: [['createdAt', 'ASC']],
            where: {
              teamId,
              [Op.or]: [
                {
                  [Op.and]: [{ receiverId: otherUserId }, { senderId: user.id }]
                },
                {
                  [Op.and]: [{ receiverId: user.id }, { senderId: otherUserId }]
                }
              ]
            }
          },
          { raw: true }
        )
    )
  },
  Mutation: {
    createDirectMessage: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        try {
          const directMessage = await db.DirectMessage.create({
            ...args,
            senderId: user.id
          });
          //pubsub publish: event name and schema query
          //get back message.dataValues, b/c from sequelize
          pubsub.publish(NEW_DIRECT_MESSAGE, {
            teamId: args.teamId,
            senderId: user.id,
            receiverId: args.receiverId,
            newDirectMessage: {
              ...directMessage.dataValues,
              sender: {
                username: user.username
              }
            }
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
