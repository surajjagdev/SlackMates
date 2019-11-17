import React from 'react';
import Dropzone from 'react-dropzone';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const FileUpload = ({ children, disableClick, mutate, channelId }) => (
  <Dropzone
    onDrop={async ([file]) => {
      await mutate({
        variables: {
          channelId,
          file: file
        }
      });
    }}
  >
    {({ getRootProps, getInputProps }) => (
      <div
        {...getRootProps({
          onClick: event => {
            if (disableClick === true) {
              return event.stopPropagation();
            }
          }
        })}
      >
        {children}
        <input type="hidden" {...getInputProps()} />
      </div>
    )}
  </Dropzone>
);
const createFileMessageMutation = gql`
  mutation($channelId: Int!, $file: Upload) {
    createMessage(channelId: $channelId, file: $file)
  }
`;
export default graphql(createFileMessageMutation)(FileUpload);
//export default FileUpload;
