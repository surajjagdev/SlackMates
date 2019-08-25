//update
//read
//create
//delete
export default `
type User{
  id: Int!,
  email:String!,
  username:String!
  messages:Message!,
  teams:[Team!]!
}
type Mutation{
  register(username:String!, email:String!, password:String!):RegisterResponse!
}
type Query{
  getUser(id:Int!):User!
  allUsers:[User!]!
}
type RegisterResponse{
  ok:Boolean!
  user:User
  errors:[Error!]
}
`;
