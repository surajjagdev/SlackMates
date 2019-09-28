"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\n  type Team{\n  id:Int!,\n  name:String!,\n  directMessageMembers: [User!]!,\n  channels: [Channel!]!,\n  admin:Boolean!\n}\ntype CreateTeamResponse{\nok:Boolean!\nteam:Team\nerrors:[Error!]\n}\ntype Query{\n  allTeams:[Team!]!\n  teamInvitedTo:[Team!]!\n  getTeamMembers(teamId: Int!): [User!]!\n}\ntype VoidResponse{\n  ok:Boolean!\n  errors:[Error!]\n}\ntype Mutation{\n  createTeam(name:String!):CreateTeamResponse!\n  addTeamMember(email:String!, teamId:Int!):VoidResponse!\n}\n";