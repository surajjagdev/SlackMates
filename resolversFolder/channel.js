import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Mutation: {
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
