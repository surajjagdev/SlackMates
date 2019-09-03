//member schema
module.exports = function(sequelize) {
  const Member = sequelize.define('member', {});
  return Member;
};
