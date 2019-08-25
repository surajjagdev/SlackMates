import bcrypt from 'bcrypt';
export default {
  //username,email, password
  Mutation: {
    register: async (parent, { password, ...otherArgs }, { db }) => {
      try {
        const hashedPassword = await bcrypt.hash(password, 11);
        await db.User.create({ ...otherArgs, password: hashedPassword });
        return true;
      } catch (error) {
        return false;
      }
    }
  },
  Query: {
    getUser: (parent, { id }, { db }) => db.User.findOne({ where: { id } }),
    allUsers: (parent, args, { db }) => db.User.findAll()
  }
};
