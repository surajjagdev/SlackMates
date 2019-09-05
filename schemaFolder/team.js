export default `
  type Team{
  id:Int!,
  name:String!,
  owner: String!,
  members: [User!]!,
  channels: [Channel!]!
}
type CreateTeamResponse{
ok:Boolean!
team:Team
errors:[Error!]
}
type Query{
  allTeams:[Team!]!
  teamInvitedTo:[Team!]!
}
type VoidResponse{
  ok:Boolean!
  errors:[Error!]
}
type Mutation{
  createTeam(name:String!):CreateTeamResponse!
  addTeamMember(email:String!, teamId:Int!):VoidResponse!
}
`;
