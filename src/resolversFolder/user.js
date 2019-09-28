import bcrypt from 'bcrypt';
import formateErrors from '../formateErrors.js';
import { tryLogin } from '../auth.js';
import requiresAuth from '../permissions.js';
//_.pick grabs what needed;

export default {
  User: {
    teams: (parent, args, { db, user }) =>
      db.sequelize.query(
        'select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?',
        {
          replacements: [user.id],
          model: db.Team,
          raw: true
        }
      )
  },
  Query: {
    allUsers: (parent, args, { db }) => db.User.findAll(),
    getUser: requiresAuth.createResolver((parent, args, { db, user }) =>
      db.User.findOne({ where: { id: user.id } })
    ),
    getMessagedUser: (parent, { userId }, { db }) =>
      db.User.findOne({ where: { id: userId } })
  },
  //username,email, password
  //dont add curly braces to es6 fns, unless more than 2 lines, or else they dont return a value
  Mutation: {
    login: (parent, { email, password }, { db, SECRET, SECRET2 }) =>
      tryLogin(email, password, db, SECRET),
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
  }
  //faster query by using sql native
  //select all from teams as alias, join against members where teamId===member.teamId, then filter if also equals to userId
};
