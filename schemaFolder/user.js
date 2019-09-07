export default `
  type User {
    id: String!
    username: String!
    email: String!
    teams: [Team!]!
  }
  type Query {
    getUser: User!
    allUsers: [User!]!
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
