export default {
  //username,email, password
  Mutation: {
    createUser: (parent, args, { db }) => db.User.create(args)
  },
  Query: {
    getUser: (parent, args, { id }, { db }) =>
      db.User.findOne({ where: { id } }),
    allUsers: (parent, args, { db }) => db.User.findAll()
  }
};
