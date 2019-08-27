import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        try {
          //also will need owner inferred via JWT spread ..args, owner:user.id
          await db.Team.create({ ...args, owner: user.id });
          return {
            ok: true
          };
        } catch (err) {
          return {
            ok: false,
            errors: formateErrors(err, db)
          };
        }
      }
    )
  }
};
