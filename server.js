if (process.env.NODE_ENV !== 'production') require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer, gql } from 'apollo-server-express';
import graphql from 'graphql';
import typeDefs from './schema';
import resolvers from './resolvers';
import db from './models';
const app = express();
const port = process.env.PORT || 8080;
const endpoint = '/graphql';
const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint,
    settings: {
      'editor.theme': 'light'
    }
  }
});
server.applyMiddleware({ app });
db.sequelize.sync({ force: true }).then(() => {
  app.listen(port, () => {
    console.log('application listening on port: ', port);
  });
});
