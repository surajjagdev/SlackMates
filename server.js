if (process.env.NODE_ENV !== 'production') require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer, gql } from 'apollo-server-express';
import graphql from 'graphql';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import db from './models';
const app = express();
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
    }
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
