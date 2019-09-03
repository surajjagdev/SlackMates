import formateErrors from '../formateErrors.js';
export default {
  Mutation: {
    createChannel: async (parent, args, { db }) => {
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
    }
  }
};
