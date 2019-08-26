if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const path = require('path');
const {
  fileLoader,
  mergeTypes,
  mergeResolvers
} = require('merge-graphql-schemas');
const db = require('./models');
const cors = require('cors');
const app = express();
app.use(cors('*'));

const port = process.env.PORT || 8080;
const endpoint = '/graphql';
//mash together typeDefs and resolvers.
const types = fileLoader(path.join(__dirname, './schemaFolder'));
const resolversArray = fileLoader(path.join(__dirname, './resolversFolder'));
//merge all files
const typeDefs = mergeTypes(types);
const resolvers = mergeResolvers(resolversArray);
//start apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    db,
    user: {
      id: 1
    },
    SECRET: process.env.JWTSECRET,
    SECRET2: process.env.JWTSECRET2
  },
  playground: {
    endpoint,
    settings: {
      'editor.theme': 'light'
    }
  }
});
server.applyMiddleware({ app });
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log('application listening on port: ', port);
  });
});
