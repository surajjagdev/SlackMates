import React from 'react';
import { extendObservable } from 'mobx';
import { observer } from 'mobx-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import {
  Message,
  Form,
  Input,
  Button,
  Container,
  Header
} from 'semantic-ui-react';

class CreateTeam extends React.Component {
  constructor(props) {
    super(props);

    extendObservable(this, {
      name: '',
      errors: {}
    });
  }
  onChange = e => {
    const { name, value } = e.target;
    //mobxlike this.setState
    this[name] = value;
  };
  validateData = () => {
    const { name } = this;
    if (name.length > 0) {
      return true;
    } else {
      return false;
    }
  };
  onSubmit = async () => {
    const { name } = this;
    let response = null;
    try {
      response = await this.props.mutate({
        variables: { name }
      });
    } catch (err) {
      //this.props.history.push('/login');
      console.log('err: ', err);
      return;
    }
    const { ok, errors, team } = response.data.createTeam;

    if (ok) {
      this.props.history.push(`/viewteam/${team.id}/${team.channels[0].id}`);
    } else {
      const err = {};
      errors.forEach(({ path, message }) => {
        err[`${path}Error`] = message;
      });

      this.errors = err;
    }
  };
  render() {
    const {
      name,
      errors: { nameError }
    } = this;
    const errorList = [];
    if (nameError) {
      errorList.push(nameError);
    }
    return (
      <Container text>
        <Header as="h2">Create A Team</Header>
        <Form>
          <Form.Field error={!!nameError}>
            <Input
              name="name"
              value={name}
              placeholder="Name"
              onChange={this.onChange}
              fluid
            />
          </Form.Field>
          <Form.Field>
            <Button onClick={this.onSubmit}>Submit</Button>
          </Form.Field>
        </Form>
        {errorList.length ? (
          <Message
            error
            header="There was some errors with your submission"
            list={errorList}
          />
        ) : null}
      </Container>
    );
  }
}

const CREATE_TEAM = gql`
  mutation($name: String!) {
    createTeam(name: $name) {
      ok
      team {
        id
        channels {
          id
        }
      }
      errors {
        path
        message
      }
    }
  }
`;
export default graphql(CREATE_TEAM)(observer(CreateTeam));
