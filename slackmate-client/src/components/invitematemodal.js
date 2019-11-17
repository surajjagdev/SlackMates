import React from 'react';
import { Form, Input, Button, Modal } from 'semantic-ui-react';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';
import errorFormat from '../errorFormat.js';
const InviteMateModal = ({
  open,
  close,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  touched,
  errors
}) => (
  <Modal open={open} onClose={close}>
    <Modal.Header>Invite a Mate to Team</Modal.Header>
    <Modal.Content>
      <Form>
        <Form.Field>
          <Input
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            name="email"
            fluid
            placeholder="Mate's Email"
          />
        </Form.Field>
        {touched.email && errors.email ? errors.email[0] : null}
        <Form.Group widths="equal">
          <Button type="submit" disabled={isSubmitting} fluid onClick={close}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            fluid
          >
            Add Mate
          </Button>
        </Form.Group>
      </Form>
    </Modal.Content>
  </Modal>
);

const addTeamMemberMutation = gql`
  mutation($email: String!, $teamId: Int!) {
    addTeamMember(email: $email, teamId: $teamId) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export default flowRight(
  graphql(addTeamMemberMutation),
  withFormik({
    mapPropsToValues: () => ({ email: '' }),
    handleSubmit: async (
      values,
      { props: { close, teamId, mutate }, setSubmitting, setErrors }
    ) => {
      const response = await mutate({
        variables: { teamId, email: values.email }
      });
      const { ok, errors } = response.data.addTeamMember;
      if (ok) {
        close();
        setSubmitting(false);
      } else {
        setSubmitting(false);
        const errorLength = errors.length;
        const filteredErrors = errors.filter(
          e => e.message !== 'user_id must be unique'
        );
        if (errorLength !== filteredErrors.length) {
          filteredErrors.push({
            path: 'email',
            message: 'This user is already part of the team.'
          });
        }
        setErrors(errorFormat(filteredErrors));
      }
    }
  })
)(InviteMateModal);
