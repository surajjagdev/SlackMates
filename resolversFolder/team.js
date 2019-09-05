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
    ),
    teamInvitedTo: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        const associatedTeams = await db.Team.findAll(
          {
            include: [
              {
                model: db.User,
                where: { id: user.id }
              }
            ]
          },
          { raw: true }
        );
        return associatedTeams;
      }
    )
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        try {
          //create transcation. if team or channel isnt created neither get created
          const responseTranscation = await db.sequelize.transaction(
            async () => {
              //also will need owner inferred via JWT spread ..args, owner:user.id
              const newTeam = await db.Team.create({ ...args, owner: user.id });
              await db.Channel.create({
                name: 'general',
                public: true,
                teamId: newTeam.id
              });
              return newTeam;
            }
          );
          return {
            ok: true,
            team: responseTranscation
          };
        } catch (err) {
          return {
            ok: false,
            errors: formateErrors(err, db)
          };
        }
      }
    ),
    addTeamMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { db, user }) => {
        try {
          //await both promises. Check if teamid is owner of team and the id of memebe to add
          const teamPromise = await db.Team.findOne(
            { where: { id: teamId } },
            { raw: true }
          );
          const addUserPromise = await db.User.findOne(
            { where: { email } },
            { raw: true }
          );
          const [team, addUser] = await Promise.all([
            teamPromise,
            addUserPromise
          ]);
          if (team.owner !== user.id) {
            return {
              ok: false,
              errors: [
                {
                  path: 'email',
                  message: 'Cannot add member to team, not owner'
                }
              ]
            };
          }
          if (!addUser) {
            return {
              ok: false,
              errors: [
                {
                  path: 'email',
                  message: 'This user does not exist. Please check email.'
                }
              ]
            };
          }
          await db.Member.create({ userId: addUser.id, teamId });
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
