if (process.env.NODE_ENV !== 'production') require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
const app = express();
const port = process.env.PORT || 8080;
//middleware
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({ schema: myGraphQLSchema })
);
app.listen(port, () => {
  console.log('application listening on port: ', port);
});
