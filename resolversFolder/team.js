import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Query: {
    allTeams: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        const teams = await db.Team.findAll(
          { where: { owner: user.id } },
          { raw: true }
        );
        return teams;
      }
    )
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        try {
          console.log(user);
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
  },
  Team: {
    channels: ({ id }, args, { db }) =>
      db.Channel.findAll({ where: { teamId: id } })
  }
};
