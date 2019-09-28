"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\n  type User {\n    id: String!\n    username: String!\n    email: String!\n    teams: [Team!]!\n  }\n  type Query {\n    getUser: User!\n    allUsers: [User!]!\n    getMessagedUser(userId:String!):User\n  }\n  type RegisterResponse {\n    ok: Boolean!\n    user: User\n    errors: [Error!]\n  }\n  type LoginResponse {\n    ok: Boolean!\n    token: String\n    refreshToken: String\n    errors: [Error!]\n  }\n  type Mutation {\n    register(username: String!, email: String!, password: String!): RegisterResponse!\n    login(email: String!, password: String!): LoginResponse!\n  }\n";