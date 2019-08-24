export default {
  Mutation: {
    createChannel: async (parent, args, { db }) => {
      try {
        await db.Channel.create(args);
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }
};
