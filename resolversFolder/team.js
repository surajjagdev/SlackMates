import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        try {
          //create transcation. if team or channel isnt created neither get created
          const responseTranscation = await db.sequelize.transaction(
            async () => {
              //also will need owner inferred via JWT spread ..args, owner:user.id
              //create team , with default channel and a member default for team
              const newTeam = await db.Team.create({ ...args });
              await db.Channel.create({
                name: 'general',
                public: true,
                teamId: newTeam.id
              });
              await db.Member.create({
                teamId: newTeam.id,
                userId: user.id,
                admin: true
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
          //await both promises. Check if member is in there
          const memberPromise = await db.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true }
          );
          const addUserPromise = await db.User.findOne(
            { where: { email } },
            { raw: true }
          );
          const [member, addUser] = await Promise.all([
            memberPromise,
            addUserPromise
          ]);
          if (!member.admin) {
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
