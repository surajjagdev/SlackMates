import formateErrors from '../formateErrors.js';
import requiresAuth from '../permissions.js';
export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(
      async (parent, args, { db, user }) => {
        try {
          const team = await db.Team.findOne(
            { where: { id: args.teamId } },
            { raw: true }
          );
          if (team.owner !== user.id) {
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
