const createResolver = resolver => {
  const baseResolver = resolver;
  baseResolver.createResolver = childResolver => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

// requiresAuth
//wrapper
export default createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('not authenticated');
  }
});
//double check to admin level
//check if user logged then check is user is admin
/*
export requiresAdmin = requiresAuth.createResolver((parent, args, { user }) => {
  if (!contex.user.isAdmin) {
    throw new Error('Requires Admin access!');
  }
});

*/
