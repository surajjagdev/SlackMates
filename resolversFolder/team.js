import formateErrors from '../formateErrors.js';
export default {
  Mutation: {
    createTeam: async (parent, args, { db, user }) => {
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
  }
};
