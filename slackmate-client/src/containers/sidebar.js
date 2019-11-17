import React from 'react';
import AddChannelModal from '../components/addchannelmodal.js';
import InviteMateModal from '../components/invitematemodal.js';
import DirectMessageModal from '../components/directmessagemodal.js';
import Channels from '../components/channels.js';
import Teams from '../components/teams.js';

export default class Sidebar extends React.Component {
  state = {
    openAddChannelModal: false,
    openAddInviteModal: false,
    openDirectMessageModal: false
  };
  handleAddDirectMessage = e => {
    if (e) {
      e.preventDefault();
    }
    this.setState(prevState => ({
      openDirectMessageModal: !prevState.openDirectMessageModal
    }));
  };
  handleAddChannel = e => {
    if (e) {
      e.preventDefault();
    }
    this.setState(prevState => ({
      openAddChannelModal: !prevState.openAddChannelModal
    }));
  };
  handleInviteMate = e => {
    if (e) {
      e.preventDefault();
    }
    this.setState(prevState => ({
      openAddInviteModal: !prevState.openAddInviteModal
    }));
  };
  render() {
    const { teams, team, userName } = this.props;
    let isOwner = false;
    const regularChannels = [];
    const dmChannels = [];
    team.channels.forEach(c => {
      if (c.directmessage) {
        dmChannels.push(c);
      } else {
        regularChannels.push(c);
      }
    });
    try {
      if (team.admin === true) {
        isOwner = true;
      }
    } catch (err) {
      console.log('err: ', err);
    }

    return [
      <Teams key="team-sidebar" teams={teams} />,
      <Channels
        key="channels-sidebar"
        teamName={team.name}
        userName={userName}
        isOwner={isOwner}
        teamId={team.id}
        channels={regularChannels}
        dmChannels={dmChannels}
        addChannel={this.handleAddChannel}
        handleInviteMate={this.handleInviteMate}
        directMessageClick={this.handleAddDirectMessage}
      />,
      <DirectMessageModal
        key="adddirectmessagemodal-sidebar"
        teamId={parseInt(team.id, 10)}
        open={this.state.openDirectMessageModal}
        onClose={this.handleAddDirectMessage}
        currentUserId={this.props.currentUserId}
      />,
      <AddChannelModal
        key="addchannelmodal-sidebar"
        open={this.state.openAddChannelModal}
        teamId={parseInt(team.id, 10)}
        close={this.handleAddChannel}
        currentUserId={this.props.currentUserId}
      />,
      <InviteMateModal
        key="invitematemodal-sidebar"
        open={this.state.openAddInviteModal}
        teamId={parseInt(team.id, 10)}
        close={this.handleInviteMate}
      />
    ];
  }
}
