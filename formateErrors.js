import _ from 'lodash';
export default (e, db) => {
  if (e instanceof db.Sequelize.ValidationError) {
    return e.errors.map(err => _.pick(err, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong.' }];
};
