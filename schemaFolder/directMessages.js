export default `
type DirectMessage{
  id:Int!,
  text:String!,
  sender:User!,
  receiverId:String!,
  createdAt:String!
}
type Query{
  directMessages(teamId:Int!, otherUserId:String!):[DirectMessage!]!
}
type Mutation{
  createDirectMessage(receiverId:String!,text:String!, teamId:Int!):Boolean!
}
`;
