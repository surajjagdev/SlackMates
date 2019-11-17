import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import MessageContainerClass from './messageContainerClass.js';
const messagesQuery = gql`
  query($cursor: String, $channelId: Int!) {
    messages(cursor: $cursor, channelId: $channelId) {
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
class MessageContainer extends React.Component {
  state = { hasMoreItems: true };
  intializeHasMoreItems = () => {
    this.setState({ hasMoreItems: true });
  };
  render() {
    return (
      <Query
        query={messagesQuery}
        variables={{ channelId: this.props.channelId }}
        fetchPolicy="network-only"
      >
        {({ data, loading, subscribeToMore, fetchMore }) => {
          if (!data) {
            return null;
          }

          if (loading) {
            return <span>Loading ...</span>;
          }

          return (
            <MessageContainerClass
              messages={data.messages}
              subscribeToMore={subscribeToMore}
              channelId={this.props.channelId}
              hasMoreItems={this.state.hasMoreItems}
              intializeHasMoreItems={this.intializeHasMoreItems}
              onLoadMore={() => {
                if (this.state.hasMoreItems) {
                  fetchMore({
                    variables: {
                      channelId: this.props.channelId,
                      cursor: data.messages[data.messages.length - 1].createdAt
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) {
                        return prev;
                      }
                      if (fetchMoreResult.messages.length < 35) {
                        this.setState({ hasMoreItems: false });
                        let newFilteredFetchMoreArray = fetchMoreResult.messages.slice(
                          1
                        );
                        return {
                          ...prev,
                          messages: [
                            ...prev.messages,
                            ...newFilteredFetchMoreArray
                          ]
                        };
                      }
                    }
                  });
                }
              }}
            />
          );
        }}
      </Query>
    );
  }
}
export default MessageContainer;
