"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\ntype Channel{\n  id:Int!,\n  name:String!,\n  public:Boolean!,\n  messages:[Message!]!,\n  users:[User!]!, \n  directmessage:Boolean!\n  createdAt:String\n}\ntype ChannelResponse{\nok:Boolean!\nchannel:Channel\nerrors:[Error!]\n}\ntype DMResponse{\n  id:Int!\n  name:String!\n}\ntype Mutation{\n  createChannel(teamId:Int!,name:String!, public:Boolean=false, members:[String!]=[]):ChannelResponse!\n    getOrCreateChannel(teamId: Int!, members: [String!]!): DMResponse!\n}\n";