export default {
  Mutation: {
    createTeam: async (parent, args, { db, user }) => {
      try {
        //also will need owner inferred via JWT spread ..args, owner:user.id
        await db.Team.create({ ...args, owner: user.id });
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }
};
