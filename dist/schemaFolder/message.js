"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\nscalar Date\ntype Message{\n  id:Int!,\n  text:String,\n  user:User!,\n  channel:Channel!,\n  createdAt:Date!, \n  created_at:Date,\n  url:String, \n  filetype:String\n}\ninput File{\n  type:String!, \n  path:String!\n}\ntype Subscription{\n  newChannelMessage(channelId:Int!):Message!\n}\ntype Query{\n  messages(cursor:String,channelId:Int!):[Message!]!\n}\ntype Mutation{\n  createMessage(channelId:Int!, text:String, file:Upload):Boolean!\n}\n\n";