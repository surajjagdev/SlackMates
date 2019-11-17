import React from 'react';
import { extendObservable } from 'mobx';
import { observer } from 'mobx-react';
import gql from 'graphql-tag';
import { wsLink } from '../apollosubscriptions.js';
import { Mutation } from 'react-apollo';
import {
  Message,
  Form,
  Input,
  Button,
  Container,
  Header
} from 'semantic-ui-react';

export default observer(
  class Login extends React.Component {
    constructor(props) {
      super(props);

      extendObservable(this, {
        email: '',
        password: '',
        errors: {}
      });
    }
    onChange = e => {
      const { name, value } = e.target;
      //mobxlike this.setState
      this[name] = value;
    };
    validateData = () => {
      const { email, password } = this;
      if (email.length > 4 && password.length > 4) {
        return true;
      } else {
        return false;
      }
    };
    postFormLogin = data => {
      const response = data.login;
      let { email, password } = this;
      if (response.ok === true) {
        this.errors = {};
        email = '';
        password = '';
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        wsLink.subscriptionClient.tryReconnect();
        return (window.location.href = '/viewteam');
      } else {
        const err = {};
        response.errors.forEach(({ path, message }) => {
          err[`${path}Error`] = message;
          //err['passwordError]
        });
        this.errors = err;
      }
    };
    render() {
      const {
        email,
        password,
        errors: { emailError, passwordError }
      } = this;
      const errorList = [];
      if (emailError) {
        errorList.push(emailError);
      }
      if (passwordError) {
        errorList.push(passwordError);
      }
      return (
        <Container text>
          <Header as="h2">Login</Header>
          <Form>
            <Form.Field error={!!emailError}>
              <Input
                name="email"
                value={email}
                placeholder="Email"
                onChange={this.onChange}
                fluid
              />
            </Form.Field>
            <Form.Field error={!!passwordError}>
              <Input
                name="password"
                value={password}
                type="password"
                placeholder="Password"
                onChange={this.onChange}
                fluid
              />
            </Form.Field>
            <Form.Field>
              <Mutation
                mutation={LOGIN_MUTATION}
                variables={{ email, password }}
                onCompleted={data => this.postFormLogin(data)}
              >
                {postMutation => (
                  <Button
                    disabled={this.validateData() ? false : true}
                    onClick={postMutation}
                  >
                    Login
                  </Button>
                )}
              </Mutation>
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
);

const LOGIN_MUTATION = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ok
      refreshToken
      token
      errors {
        path
        message
      }
    }
  }
`;
/* <Mutation
          mutation={LOGIN_MUTATION}
          variables={{ email, password }}
          onCompleted={data => this.postFormLogin(data)}
        >
          {postMutation => (
            <Button
              disabled={this.validateData() ? false : true}
              onClick={postMutation}
            >
              Register
            </Button>
          )}
        </Mutation>*/
