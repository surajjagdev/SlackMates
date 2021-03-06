import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
import Sequelize from 'sequelize';
const Op = Sequelize.Op;
export default {
  Mutation: {
    getOrCreateChannel: requiresAuth.createResolver(
      async (parent, { teamId, members }, { db, user }) => {
        const member = await db.Member.findOne({
          where: { teamId, userId: user.id },
          raw: true
        });
        if (!member) {
          throw new Error('Not Authenticated');
        }
        const allMembersArray = [...members, user.id];
        // check if dm channel already exists with these members
        const [data, result] = await db.sequelize.query(
          `
      select c.id, c.name 
      from channels as c, private_members pc 
      where pc.channel_id = c.id and c.directmessage = true and c.public = false and c.team_id = ${teamId}
      group by c.id, c.name 
      having array_agg(pc.user_id) @> Array[:members]::uuid[] and count(pc.user_id) = ${allMembersArray.length};
      `,
          {
            replacements: { members: allMembersArray },
            raw: true
          }
        );

        if (data.length) {
          return data[0];
        }
        const users = await db.User.findAll({
          where: {
            id: {
              [Op.in]: members
            }
          },
          raw: true
        });
        const name = users.map(u => u.username).join(',');
        const channelId = await db.sequelize.transaction(async transaction => {
          const channel = await db.Channel.create(
            {
              name,
              public: false,
              directmessage: true,
              teamId: parseInt(teamId, 10)
            },
            { transaction }
          );

          const cId = channel.dataValues.id;
          const pcmembers = allMembersArray.map(m => ({
            userId: m,
            channelId: parseInt(cId, 10)
          }));
          await db.PrivateMember.bulkCreate(pcmembers, { transaction });
          return cId;
        });
        return {
          id: channelId,
          name
        };
      }
    ),
    createChannel: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        try {
          const member = await db.Member.findOne(
            { where: { teamId: args.teamId, userId: user.id } },
            { raw: true }
          );
          if (!member.admin) {
            return {
              ok: false,
              errors: [
                {
                  path: 'name',
                  message: 'Must be owner of team to create channels'
                }
              ]
            };
          }
          const response = await db.sequelize.transaction(async transcation => {
            const channel = await db.Channel.create(args, { transcation });
            console.log('args: ', args);
            //transcation if not public
            if (!args.public) {
              const members = args.members.filter(m => m !== user.id);
              members.push(user.id);
              await db.PrivateMember.bulkCreate(
                members.map(
                  m => ({
                    userId: m,
                    channelId: channel.dataValues.id
                  }),
                  { transcation }
                )
              );
            }
            return channel;
          });
          return {
            ok: true,
            channel: response
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
