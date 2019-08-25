export default {
  //username,email, password
  Mutation: {
    register: (parent, args, { db }) => db.User.create(args)
  },
  Query: {
    getUser: (parent, { id }, { db }) => db.User.findOne({ where: { id } }),
    allUsers: (parent, args, { db }) => db.User.findAll()
  }
};
