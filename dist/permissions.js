'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
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
exports.default = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('not authenticated');
  }
});
const requiresTeamAccess = exports.requiresTeamAccess = createResolver(async (parent, { channelId }, { user, db }) => {
  if (!user || !user.user.id) {
    throw Error('Not Authenticated');
  }
  // check if part of the team
  const channel = await db.Channel.findOne({ where: { id: channelId } });

  const member = await db.Member.findOne({
    where: { teamId: channel.teamId, userId: user.user.id }
  });
  if (!member) {
    throw new Error("You have to be a member of the team to subcribe to it's messages");
  }
});
const directMessageSubscription = exports.directMessageSubscription = createResolver(async (parent, { teamId, userId }, { user, db }) => {
  if (!user || !user.user.id) {
    throw Error('Not Authenticated');
  }
  // find member where receiver user or sender
  const member = await db.Member.findAll({
    where: {
      teamId,
      [Op.or]: [{
        userId: user.user.id
      }, {
        userId: userId
      }]
    }
  });
  if (member.length !== 2) {
    throw new Error('Something went wrong. Your friend is not apart of yout team');
  }
});