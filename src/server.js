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
const DataLoader = require('dataloader');
const { channelBatcher } = require('./batchfunctions.js');
const cors = require('cors');
const app = express();
const http = require('http');
const port = process.env.PORT || 3001;
//
//
const addUser = async (req, res, next) => {
  const token = req.headers['token'];
  if (token && token !== null) {
    try {
      const { user } = jwt.verify(token, process.env.JWTSECRET);
      req.user = user;
    } catch (err) {
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
      SECRET2: process.env.JWTSECRET2,
      channelLoader: new DataLoader(ids => channelBatcher(ids, db, req.user)),
      serverUrl: process.env.SERVERURL
    };
  },
  subscriptions: {
    onConnect: async ({ token, refreshToken }, webSocket) => {
      if (token && refreshToken) {
        try {
          //check user from token then pass back user and db. To see if
          //users are allowrd or whatever
          const { user } = jwt.verify(token, process.env.JWTSECRET);
          return { db, user };
        } catch (err) {
          const newTokens = await refreshTokens(
            token,
            refreshToken,
            db,
            process.env.JWTSECRET,
            process.env.JWTSECRET2
          );
          return { db, user: newTokens.user };
        }
      }

      return { db };
    }
  },
  playground: {
    endpoint,
    settings: {
      'editor.theme': 'light'
    }
  }
});
const corsOption = {
  origin: 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOption));
app.use(addUser);
//access static files from /files url
app.use('/static', express.static('uploadfolder'));
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
