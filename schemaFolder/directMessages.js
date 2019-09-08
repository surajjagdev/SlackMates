export default `
type DirectMessage{
  id:Int!,
  text:String!,
  sender:User!,
  receiverId:String!,
  createdAt:String!
}
type Query{
  directMessages:[DirectMessage!]!
}
type Mutation{
  createDirectMessage(receiverId:String!,text:String!):Boolean!
}
`;
