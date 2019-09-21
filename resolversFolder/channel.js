import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Mutation: {
    getOrCreateChannel: requiresAuth.createResolver(
      async (parent, { teamId, members }, { db, user }) => {
        const newMemberArray = [];
        members.push(user.id);
        // check if dm channel already exists with these members
        const [data, result] = await db.sequelize.query(
          `
      select c.id 
      from channels as c, private_members pc 
      where pc.channel_id = c.id and c.directmessage = true and c.public = false and c.team_id = ${teamId}
      group by c.id 
      having array_agg(pc.user_id) @> Array[:members]::uuid[] and count(pc.user_id) = ${members.length};
      `,
          {
            replacements: { members: members },
            raw: true
          }
        );

        console.log(data, result);

        if (data.length) {
          return data[0].id;
        }

        const channelId = await db.sequelize.transaction(async transaction => {
          const channel = await db.Channel.create(
            {
              name: 'hello',
              public: false,
              directmessage: true,
              teamId
            },
            { transaction }
          );

          const cId = channel.dataValues.id;
          const pcmembers = members.map(m => ({ userId: m, channelId: cId }));
          await db.PrivateMember.bulkCreate(pcmembers, { transaction });
          return cId;
        });

        return channelId;
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
