'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const channelBatcher = exports.channelBatcher = async (ids, db, user) => {
  const results = await db.sequelize.query('select distinct on (id) * from channels as c left outer join private_members as pm on c.id=pm.channel_id where c.team_id in (:teamIds) and (c.public=true or pm.user_id=:userId) ', {
    replacements: { teamIds: ids, userId: user.id },
    model: db.Channel,
    raw: true
  });
  const data = {};
  //group by team;
  results.forEach(r => {
    if (data[r.team_id]) {
      data[r.team_id].push(r);
    } else {
      data[r.team_id] = [r];
    }
  });
  return ids.map(id => data[id]);
};