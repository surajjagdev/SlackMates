import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
import team from '../schemaFolder/team.js';
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
          const newTeam = await db.Team.create({ ...args, owner: user.id });
          await db.Channel.create({
            name: 'general',
            public: true,
            teamId: newTeam.id
          });
          return {
            ok: true,
            team: newTeam
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
