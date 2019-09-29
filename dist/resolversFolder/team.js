'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _formateErrors = require('../formateErrors.js');

var _formateErrors2 = _interopRequireDefault(_formateErrors);

var _permissions = require('../permissions.js');

var _permissions2 = _interopRequireDefault(_permissions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Query: {
    getTeamMembers: _permissions2.default.createResolver(async (parent, { teamId }, { db }) => {
      const getTeamMembers = await db.sequelize.query('select * from users as u join members as m on m.user_id = u.id where m.team_id = ?', {
        replacements: [teamId],
        model: db.User,
        raw: true
      });
      return getTeamMembers;
    })
  },
  Mutation: {
    createTeam: _permissions2.default.createResolver(async (parent, args, { db, user }) => {
      try {
        //create transcation. if team or channel isnt created neither get created
        const responseTranscation = await db.sequelize.transaction(async () => {
          //also will need owner inferred via JWT spread ..args, owner:user.id
          //create team , with default channel and a member default for team
          const newTeam = await db.Team.create(_extends({}, args));
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
        });
        return {
          ok: true,
          team: responseTranscation
        };
      } catch (err) {
        return {
          ok: false,
          errors: (0, _formateErrors2.default)(err, db)
        };
      }
    }),
    addTeamMember: _permissions2.default.createResolver(async (parent, { email, teamId }, { db, user }) => {
      try {
        //await both promises. Check if member is in there
        const memberPromise = await db.Member.findOne({ where: { teamId, userId: user.id } }, { raw: true });
        const addUserPromise = await db.User.findOne({ where: { email } }, { raw: true });
        const [member, addUser] = await Promise.all([memberPromise, addUserPromise]);
        if (!member.admin) {
          return {
            ok: false,
            errors: [{
              path: 'email',
              message: 'Cannot add member to team, not owner'
            }]
          };
        }
        if (!addUser) {
          return {
            ok: false,
            errors: [{
              path: 'email',
              message: 'This user does not exist. Please check email.'
            }]
          };
        }
        await db.Member.create({ userId: addUser.id, teamId });
        return {
          ok: true
        };
      } catch (err) {
        return {
          ok: false,
          errors: (0, _formateErrors2.default)(err, db)
        };
      }
    })
  },
  Team: {
    channels: ({ id }, args, { channelLoader }) => channelLoader.load(id),
    directMessageMembers: ({ id }, args, { db, user }) => db.sequelize.query('select distinct on (u.id) u.id, u.username from users as u join direct_messages as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId', {
      replacements: { currentUserId: user.id, teamId: id },
      model: db.User,
      raw: true
    })
  }
};