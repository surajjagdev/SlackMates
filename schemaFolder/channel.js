export default `
type Channel{
  id:Int!,
  name:String!,
  public:Boolean!,
  messages:[Message!]!,
  users:[User!]!, 
  directmessage:Boolean!
  createdAt:String
}
type ChannelResponse{
ok:Boolean!
channel:Channel
errors:[Error!]
}
type DMResponse{
  id:Int!
  name:String!
}
type Mutation{
  createChannel(teamId:Int!,name:String!, public:Boolean=false, members:[String!]=[]):ChannelResponse!
    getOrCreateChannel(teamId: Int!, members: [String!]!): DMResponse!
}
`;
