import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';

export default {
  Query: {
    getTeamMembers: requiresAuth.createResolver(
      async (parent, { teamId }, { db }) => {
        const getTeamMembers = await db.sequelize.query(
          'select * from users as u join members as m on m.user_id = u.id where m.team_id = ?',
          {
            replacements: [teamId],
            model: db.User,
            raw: true
          }
        );
        return getTeamMembers;
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
    channels: ({ id }, args, { db, user }) =>
      db.sequelize.query(
        'select distinct on (id) * from channels as c, private_members as pm where c.team_id=:teamId and (c.public=true or (pm.user_id=:userId and c.id=pm.channel_id )) ',
        {
          replacements: { teamId: id, userId: user.id },
          model: db.Channel,
          raw: true
        }
      ),
    directMessageMembers: ({ id }, args, { db, user }) =>
      db.sequelize.query(
        'select distinct on (u.id) u.id, u.username from users as u join direct_messages as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId',
        {
          replacements: { currentUserId: user.id, teamId: id },
          model: db.User,
          raw: true
        }
      )
  }
};
/*db.Channel.findAll({
  where: {
    teamId: id,

    public: true
  }
})*/
