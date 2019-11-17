import React from 'react';
import { Form, Input, Button, Modal, Checkbox } from 'semantic-ui-react';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import { findIndex } from 'lodash';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';
import { getUserQuery } from '../graphql/team.js';
import SelectUsers from './selectUser.js';

const AddChannelModal = ({
  open,
  close,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  resetForm,
  setFieldValue,
  teamId,
  currentUserId
}) => (
  <Modal
    open={open}
    onClose={e => {
      resetForm();
      close(e);
    }}
  >
    <Modal.Header>Add Channel</Modal.Header>
    <Modal.Content>
      <Form>
        <Form.Field>
          <Input
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            name="name"
            fluid
            placeholder="Channel name"
          />
        </Form.Field>
        <Form.Field>
          <Checkbox
            label="Make Channel Private"
            checked={!values.public}
            onChange={(e, { checked }) => setFieldValue('public', !checked)}
            toggle
          />
        </Form.Field>
        {values.public ? null : (
          <Form.Field>
            <SelectUsers
              value={values.members}
              currentUserId={currentUserId}
              handleChange={(e, { value }) => setFieldValue('members', value)}
              teamId={teamId}
              placeholder="select members to invite"
            />
          </Form.Field>
        )}
        <Form.Group widths="equal">
          <Button
            type="submit"
            disabled={isSubmitting}
            fluid
            onClick={e => {
              resetForm();
              close(e);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            fluid
          >
            Create Channel
          </Button>
        </Form.Group>
      </Form>
    </Modal.Content>
  </Modal>
);

const createChannelMutation = gql`
  mutation(
    $teamId: Int!
    $name: String!
    $public: Boolean!
    $members: [String!]
  ) {
    createChannel(
      teamId: $teamId
      name: $name
      public: $public
      members: $members
    ) {
      ok
      channel {
        id
        name
        directmessage
        createdAt
      }
      errors {
        path
        message
      }
    }
  }
`;

export default flowRight(
  graphql(createChannelMutation),
  withFormik({
    mapPropsToValues: () => ({ public: true, name: '', members: [] }),
    handleSubmit: async (
      values,
      { props: { close, teamId, mutate }, setSubmitting }
    ) => {
      await mutate({
        variables: {
          teamId,
          name: values.name,
          public: values.public,
          members: values.members
        },
        optimisticResponse: {
          createChannel: {
            __typename: 'Mutation',
            ok: true,
            channel: {
              __typename: 'Channel',
              id: -1,
              name: values.name,
              directmessage: false
            }
          }
        },
        update: (store, { data: { createChannel } }) => {
          const { ok, channel } = createChannel;
          console.log('channel: ', channel);
          if (!ok) {
            return;
          }
          const data = store.readQuery({ query: getUserQuery });
          const teamIdx = findIndex(data.getUser.teams, ['id', teamId]);
          data.getUser.teams[teamIdx].channels.push(channel);
          store.writeQuery({ query: getUserQuery, data });
        }
      });
      close();
      setSubmitting(false);
    }
  })
)(AddChannelModal);
