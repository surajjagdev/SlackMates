if (process.env.NODE_ENV !== 'production') require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer, gql } from 'apollo-server-express';
import graphql from 'graphql';
import typeDefs from './schema';
import resolvers from './resolvers';
const app = express();
const port = process.env.PORT || 8080;
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });
app.listen(port, () => {
  console.log('application listening on port: ', port);
});
