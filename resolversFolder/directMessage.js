//import formateErrors from '../formateErrors.js';
import Sequelize from 'sequelize';
import requiresAuth, { requiresTeamAccess } from '../permissions.js';
const Op = Sequelize.Op;
export default {
  DirectMessage: {
    sender: ({ sender, senderId }, args, { db }) => {
      if (sender) {
        return sender;
      }
      return db.User.findOne({ where: { id: senderId } }, { raw: true });
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
          /*pubsub.publish(NEW_CHANNEL_MESSAGE, {
            channelId: args.channelId,
            newChannelMessage: message.dataValues
          });*/
          return true;
        } catch (err) {
          console.log('err:', err);
          return false;
        }
      }
    )
  }
};
