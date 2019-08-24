require('dotenv').config();
module.exports = {
  development: {
    //cannot name it process.env.USERNAME
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres'
  },
  test: {
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres'
  },
  production: {
    use_env_variable: 'JAWSDB_URL',
    username: process.env.PRODUCTION_USER_NAME,
    password: process.env.PRODUCTION_PASSWORD,
    database: process.env.PRODUCTION_DATABASE,
    host: process.env.PRODUCTION_HOST,
    dialect: 'postgres'
  }
};
