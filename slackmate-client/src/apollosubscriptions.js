import { ApolloClient, InMemoryCache, ApolloLink, split } from 'apollo-boost';
import apolloUploadClient from 'apollo-upload-client';
//import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
const host = 'http://localhost:3001/graphql';
const wsHost = 'ws://localhost:3001/graphql';
/*const httpLink = new HttpLink({
  uri: host
});*/
const httpLink = apolloUploadClient.createUploadLink({
  uri: host
});
const middlewareLink = setContext(() => ({
  headers: {
    token: localStorage.getItem('token') || null,
    refreshtoken: localStorage.getItem('refreshToken') || null
  }
}));

const afterWareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext();
    const {
      response: { headers }
    } = context;
    if (headers) {
      const token = headers.get('token');
      const refreshToken = headers.get('refreshtoken');
      if (token) {
        localStorage.setItem('token', token);
      }

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
    return response;
  });
});
const httpLinkWithMiddleware = afterWareLink.concat(
  middlewareLink.concat(httpLink)
);
//ws
export const wsLink = new WebSocketLink({
  uri: wsHost,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: {
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken')
    }
  }
});
//split the connections between ws and (authmiddleware, middleware and httplink)
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLinkWithMiddleware
);

export default new ApolloClient({
  link,
  //link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
