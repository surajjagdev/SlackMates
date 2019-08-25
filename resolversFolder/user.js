import bcrypt from 'bcrypt';
import _ from 'lodash';
//_.pick grabs what needed;
const formateErrors = (e, db) => {
  if (e instanceof db.Sequelize.ValidationError) {
    return e.errors.map(err => _.pick(err, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong.' }];
};

export default {
  //username,email, password
  Mutation: {
    register: async (parent, { password, ...otherArgs }, { db }) => {
      try {
        if (password.length < 5) {
          return {
            ok: false,
            errors: [
              {
                path: 'password',
                message: 'Password need greater than 5 characters. '
              }
            ]
          };
        } else {
          const hashedPassword = await bcrypt.hash(password, 11);
          const user = await db.User.create({
            ...otherArgs,
            password: hashedPassword
          });
          return {
            ok: true,
            user
          };
        }
      } catch (error) {
        return {
          ok: false,
          errors: formateErrors(error, db)
        };
      }
    }
  },
  Query: {
    getUser: (parent, { id }, { db }) => db.User.findOne({ where: { id } }),
    allUsers: (parent, args, { db }) => db.User.findAll()
  }
};
