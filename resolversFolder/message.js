//import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Message: {
    user: ({ userId }, args, { db }) =>
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
          await db.Message.create({ ...args, userId: user.id });
          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
    )
  }
};
/*Query:{
   messages:async(parent, args, {db, user})=>[//]
 },*/
