"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `
  type User {
    id: String!
    username: String!
    email: String!
    teams: [Team!]!
  }
  type Query {
    getUser: User!
    allUsers: [User!]!
    getMessagedUser(userId:String!):User
  }
  type RegisterResponse {
    ok: Boolean!
    user: User
    errors: [Error!]
  }
  type LoginResponse {
    ok: Boolean!
    token: String
    refreshToken: String
    errors: [Error!]
  }
  type Mutation {
    register(username: String!, email: String!, password: String!): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
  }
`;