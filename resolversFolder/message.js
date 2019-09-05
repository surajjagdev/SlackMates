//import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Query: {
    messages: requiresAuth.createResolver(
      async (parent, { channelId }, { db, user }) => {
        db.Message.findAll({ where: { channelId } }, { raw: true });
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
