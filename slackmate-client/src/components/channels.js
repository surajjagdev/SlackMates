import React from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
const ChannelWrapper = styled.div`
  grid-column: 2;
  grid-row: 1/4;
  background-color: #4e3a4c;
  color: #958993;
  @media (max-width: 640px) {
    display: none;
  }
`;
//team header white
const TeamNameHeader = styled.h1`
  color: #fff;
  font-size: 20px;
`;
const paddingLeft = 'padding-left: 10px';
const SideBarListItem = styled.li`
  padding: 2px;
  ${paddingLeft};
  &:hover {
    background: #3e313c;
  }
`;
//no list decoration, full width of parent and taking off padding-left
const SideBarList = styled.ul`
  width: 100%;
  list-style: none;
  padding-left: 0px;
`;
//pads it left 10px;
const SideBarListHeader = styled.li`
  ${paddingLeft};
`;
//pads it left 10px;
const PushLeft = styled.div`
  ${paddingLeft};
`;

const Blue = styled.span`
  color: #38978d;
`;

const OnlineBubble = ({ on = true }) => (on ? <Blue>●</Blue> : '○');
const channel = ({ id, name }, teamId) => {
  return (
    <Link to={`/viewteam/${teamId}/${id}`} key={`channel-${id}`}>
      <SideBarListItem>{`# ${name}`}</SideBarListItem>
    </Link>
  );
};

const dmChannel = ({ id, name }, teamId) => (
  <SideBarListItem key={`user-${id}`}>
    <Link to={`/viewteam/${teamId}/${id}`}>
      <OnlineBubble /> {name}
    </Link>
  </SideBarListItem>
);
export default ({
  teamName,
  userName,
  channels,
  dmChannels,
  addChannel,
  teamId,
  directMessageClick,
  handleInviteMate,
  isOwner
}) => {
  return (
    <ChannelWrapper>
      <PushLeft>
        <TeamNameHeader>{teamName}</TeamNameHeader>
        {userName}
      </PushLeft>
      <div>
        <SideBarList>
          <SideBarListHeader>
            Channels{' '}
            {isOwner ? <Icon name="add circle" onClick={addChannel} /> : null}
          </SideBarListHeader>
          {channels.map(chan => channel(chan, teamId))}
        </SideBarList>
      </div>
      <div>
        <SideBarList>
          <SideBarListHeader>
            Direct Messages{' '}
            <Icon name="add circle" onClick={directMessageClick} />
          </SideBarListHeader>
          {dmChannels.map(dm => dmChannel(dm, teamId))}
        </SideBarList>
      </div>
      {isOwner ? (
        <div>
          <a href="#invite-Mate" onClick={handleInviteMate}>
            + Invite Mates
          </a>
        </div>
      ) : null}
    </ChannelWrapper>
  );
};
