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
          const channel = await db.Channel.create(args);
          return {
            ok: true,
            channel
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
