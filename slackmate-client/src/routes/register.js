import React from 'react';
import {
  Message,
  Input,
  Form,
  Button,
  Container,
  Header
} from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
class Register extends React.Component {
  state = {
    username: '',
    email: '',
    password: '',
    usernameError: '',
    emailError: '',
    passwordError: ''
  };
  onChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };
  onSubmit = e => {
    e.preventDefault();
  };
  validateData = () => {
    const { username, email, password } = this.state;
    if (username.length > 4 && email.length > 4 && password.length > 4) {
      return true;
    } else {
      return false;
    }
  };
  postFormRegister = data => {
    const response = data.register;
    this.setState({
      usernameError: '',
      passwordError: '',
      emailError: ''
    });
    if (response.ok === true) {
      this.setState(
        {
          usernameError: '',
          passwordError: '',
          emailError: '',
          username: '',
          email: '',
          password: ''
        },
        () => {
          this.props.history.push('/login');
        }
      );
    } else {
      const err = {};
      response.errors.forEach(({ path, message }) => {
        err[`${path}Error`] = message;
        //err['passwordError]
      });
      this.setState(err, () => {
        console.log(this.state);
      });
    }
  };
  render() {
    const {
      username,
      usernameError,
      emailError,
      passwordError,
      email,
      password
    } = this.state;
    const errorList = [];
    if (usernameError) {
      errorList.push(usernameError);
    }
    if (emailError) {
      errorList.push(emailError);
    }
    if (passwordError) {
      errorList.push(passwordError);
    }
    return (
      <Container text>
        <Header as="h2">Register</Header>
        <Form>
          <Form.Field error={!!usernameError}>
            <Input
              name="username"
              value={username}
              placeholder="Username"
              onChange={this.onChange}
              fluid
            />
          </Form.Field>
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
              mutation={REGISTER_MUTATION}
              variables={{ username, email, password }}
              onCompleted={data => this.postFormRegister(data)}
            >
              {postMutation => (
                <Button
                  disabled={this.validateData() ? false : true}
                  onClick={postMutation}
                >
                  Register
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
const REGISTER_MUTATION = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      ok
      errors {
        path
        message
      }
    }
  }
`;
export default Register;
