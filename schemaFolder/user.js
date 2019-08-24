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
  createUser(username:String!, email:String!, password:String!):User!
}
type Query{
  getUser(id:Int!):User!
  allUsers:[User!]!
}
`;
