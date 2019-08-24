export default {
  Mutation: {
    createMessage: async (parent, args, { db, user }) => {
      try {
        await db.Message.create({ ...args, userId: user.id });
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }
};
