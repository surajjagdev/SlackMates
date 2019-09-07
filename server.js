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
const http = require('http');
const port = process.env.PORT || 3001;
//
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
//
const addUser = async (req, res, next) => {
  const token = req.headers['token'];
  if (token && token !== null) {
    try {
      const { user } = jwt.verify(token, process.env.JWTSECRET);
      req.user = user;
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
  context: async ({ req, connection }) => {
    return {
      db,
      user: connection ? connection.context : req.user,
      SECRET: process.env.JWTSECRET,
      SECRET2: process.env.JWTSECRET2
    };
  },
  subscriptions: {
    onConnect: async ({ token, refreshToken }, webSocket) => {
      if (token && refreshToken) {
        let user = null;
        try {
          const payload = jwt.verify(token, process.env.JWTSECRET);
          user = payload.user;
        } catch (err) {
          const newTokens = await refreshTokens(
            token,
            refreshToken,
            db,
            { SECRET: process.env.JWTSECRET },
            { SECRET2: process.env.JWTSECRET2 }
          );
          user = newTokens.user;
        }
        console.log('user: ', user);
        if (!user) {
          throw new Error('Invalid auth tokens');
        }
        const member = await db.Member.findOne({
          where: { teamId: 2, userId: user.id }
        });
        console.log(member);
        if (!member) {
          throw new Error('Missing auth tokens!');
        }

        return true;
      }

      throw new Error('Something Went Wrong, please reload!');
    }
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
//create server using http
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

db.sequelize.sync().then(() => {
  httpServer.listen(port, () => {
    console.log(
      `server ready at http://localhost:${port}${server.graphqlPath}`
    );
    console.log(
      `Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
    );
  });
});
