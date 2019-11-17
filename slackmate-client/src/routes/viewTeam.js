import React from 'react';
import Header from '../components/header.js';
import AppLayout from '../components/applayout.js';
import SideBar from '../containers/sidebar.js';
import MessengerContainer from '../containers/messaagerContainer.js';
import { Redirect } from 'react-router-dom';
import SendMessage from '../components/input.js';
import { findIndex } from 'lodash';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { getUserQuery } from '../graphql/team.js';
import { flowRight } from 'lodash';
const ViewTeam = ({
  mutate,
  data: { loading, getUser },
  match: {
    params: { teamId, channelId }
  }
}) => {
  if (loading || !getUser) {
    return null;
  }
  let teamsList = null;
  try {
    if (typeof getUser !== undefined) {
      teamsList = getUser.teams;
    }
  } catch (err) {
    return <Redirect to="/createteam" />;
  }
  const username = getUser.username;
  const currentUserId = getUser.id;
  if (!teamsList.length) {
    return <Redirect to="/createteam" />;
  }
  //if no teams exist redirect to create team
  //merge all teams owned and teams invited to.
  const teamIdInteger = parseInt(teamId, 10); //--working
  const teamIdx = teamIdInteger
    ? findIndex(teamsList, ['id', teamIdInteger])
    : 0;
  const team = teamIdx === -1 ? teamsList[0] : teamsList[teamIdx];
  const channelIdInteger = parseInt(channelId, 10);
  const channelIdx = channelIdInteger
    ? findIndex(team.channels, ['id', channelIdInteger])
    : 0;
  const channel =
    channelIdx === -1 ? team.channels[0] : team.channels[channelIdx];
  return (
    <AppLayout>
      <SideBar
        teams={teamsList.map(t => ({
          id: t.id,
          name: t.name.charAt(0).toUpperCase()
        }))}
        team={team}
        currentUserId={currentUserId}
        userName={username}
      />
      {channel && <Header channelName={channel.name} />}
      {channel && <MessengerContainer channelId={channel.id} />}
      {channel && (
        <SendMessage
          channelId={channel.id}
          placeholder={channel.name}
          onSubmit={async text => {
            await mutate({ variables: { text, channelId: channel.id } });
          }}
        />
      )}
    </AppLayout>
  );
};
const sendMessageMutation = gql`
  mutation($channelId: Int!, $text: String!) {
    createMessage(channelId: $channelId, text: $text)
  }
`;

export default flowRight(
  graphql(getUserQuery, {
    options: { fetchPolicy: 'network-only' }
  }),
  graphql(sendMessageMutation)
)(ViewTeam);
