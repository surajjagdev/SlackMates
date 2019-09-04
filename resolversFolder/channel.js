import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(async (parent, args, { db }) => {
      try {
        const channel = await db.Channel.create(args);
        return {
          ok: true,
          channel
        };
      } catch (err) {
        return {
          ok: false,
          errors: formateErrors(err, db)
        };
      }
    })
  }
};
