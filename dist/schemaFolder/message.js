"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `
scalar Date
type Message{
  id:Int!,
  text:String,
  user:User!,
  channel:Channel!,
  createdAt:Date!, 
  created_at:Date,
  url:String, 
  filetype:String
}
input File{
  type:String!, 
  path:String!
}
type Subscription{
  newChannelMessage(channelId:Int!):Message!
}
type Query{
  messages(cursor:String,channelId:Int!):[Message!]!
}
type Mutation{
  createMessage(channelId:Int!, text:String, file:Upload):Boolean!
}

`;