import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const getAllUsers = gql`
  query {
    allUsers {
      id
      email
    }
  }
`;
const Home = () => (
  <Query query={getAllUsers}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading...';
      if (error) return `Error! ${error.message}`;
      if (typeof data !== 'undefined') {
        return data.allUsers.map(user => {
          return <h1 key={user.id}>{user.email}</h1>;
        });
      } else {
        return <h1>undefined</h1>;
      }
    }}
  </Query>
);
/*
const Home = ({ data: { loading, allUsers } }) =>
  loading
    ? null
    : allUsers.map(u => {
        return <h1 key={u.id}>{u.email}</h1>;
      });*/
export default Home;
