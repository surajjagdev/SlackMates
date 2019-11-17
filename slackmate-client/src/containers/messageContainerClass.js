import React from 'react';
import gql from 'graphql-tag';
import { Comment } from 'semantic-ui-react';
import FileUpload from '../components/fileupload.js';
import RenderText from '../components/rendertext.js';
import _ from 'underscore';
const newChannelMessageSubscription = gql`
  subscription($channelId: Int!) {
    newChannelMessage(channelId: $channelId) {
      id
      text
      user {
        username
      }
      url
      filetype
      createdAt
      created_at
    }
  }
`;
const MessageDetect = ({ message: { url, text, filetype } }) => {
  if (url) {
    if (filetype.startsWith('image/')) {
      return <img src={url} alt="" />;
    } else if (filetype === 'text/plain') {
      return <RenderText url={url} />;
    } else if (filetype.startsWith('audio/')) {
      return (
        <div>
          <audio controls>
            <source src={url} type={filetype} />
          </audio>
        </div>
      );
    } else if (filetype.startsWith('video/')) {
      return (
        <div>
          <video style={{ maxWidth: '320px', maxHeight: '240px' }} controls>
            <source src={url} type={filetype} />
          </video>
        </div>
      );
    }
  }
  return <Comment.Text>{text}</Comment.Text>;
};
class MessageContainerClass extends React.Component {
  componentDidMount() {
    this.props.intializeHasMoreItems();
    this.subscribe(this.props.channelId);
  }
  componentDidUpdate(prevProps) {
    if (this.props.channelId !== prevProps.channelId) {
      this.subscribe(this.props.channelId);
    } else {
      console.log('nothing changed');
    }
  }
  unsubscribe = channelId => {
    return this.subscribe(channelId);
  };
  subscribe = channelId => {
    this.props.subscribeToMore({
      document: newChannelMessageSubscription,
      variables: {
        channelId: channelId
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        const idAlreadyExists =
          prev.messages.filter(item => {
            return item.id === subscriptionData.data.newChannelMessage.id;
          }).length > 0;
        if (!idAlreadyExists) {
          return {
            ...prev,
            messages: [
              subscriptionData.data.newChannelMessage,
              ...prev.messages
            ]
          };
        }
        //return concat of messages available and new messages
      }
    });
  };
  handleScroll = () => {
    if (
      this.scroller &&
      this.scroller.scrollTop < 25 &&
      this.props.hasMoreItems &&
      this.props.messages.length >= 35
    ) {
      return this.props.onLoadMore();
    }
  };
  render() {
    return (
      <div
        style={{
          gridColumn: 3,
          gridRow: 2,
          paddingLeft: '20px',
          paddingRight: '20px',
          display: 'flex',
          flexDirection: 'column-reverse',
          overflowY: 'auto'
        }}
        onScroll={_.throttle(this.handleScroll, 1000)}
        ref={scroller => {
          this.scroller = scroller;
        }}
      >
        <FileUpload channelId={this.props.channelId} disableClick={true}>
          <Comment.Group>
            {this.props.messages
              .slice()
              .reverse()
              .map((message, index) => (
                <Comment key={`message-${message.id}-index-${index}`}>
                  <Comment.Content>
                    <Comment.Author as="a">
                      {message.user.username}
                    </Comment.Author>
                    <Comment.Metadata>
                      <div>{message.createdAt}</div>
                    </Comment.Metadata>
                    <MessageDetect message={message} />
                    <Comment.Actions>
                      <Comment.Action>Reply</Comment.Action>
                    </Comment.Actions>
                  </Comment.Content>
                </Comment>
              ))}
          </Comment.Group>
        </FileUpload>
      </div>
    );
  }
}
export default MessageContainerClass;
