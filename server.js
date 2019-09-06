if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { refreshTokens } = require('./auth.js');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const {
  fileLoader,
  mergeTypes,
  mergeResolvers
} = require('merge-graphql-schemas');
const db = require('./models');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
//
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
//
const addUser = async (req, res, next) => {
  const token = req.headers['token'];
  if (token && token !== null) {
    try {
      const { user } = jwt.verify(token, process.env.JWTSECRET);
      req.user = user;
      console.log('req.user: ', req.user);
    } catch (err) {
      console.log('err: ', err);
      const refreshToken = req.headers['refreshtoken'];
      const newTokens = await refreshTokens(
        token,
        refreshToken,
        db,
        process.env.JWTSECRET,
        process.env.JWTSECRET2
      );
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'token, refreshtoken');
        res.set('token', newTokens.token);
        res.set('refreshtoken', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
};
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
  context: async ({ req }) => {
    return {
      db,
      user: req.user,
      SECRET: process.env.JWTSECRET,
      SECRET2: process.env.JWTSECRET2
    };
  },
  playground: {
    endpoint,
    settings: {
      'editor.theme': 'light'
    }
  }
});
app.use(cors('*'));
app.use(addUser);
server.applyMiddleware({ app });
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema: { typeDefs, resolvers }
      },
      {
        server: app,
        path: '/subscriptions'
      }
    );
  });
});
