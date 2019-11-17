import React from 'react';
import Home from './home';
import Register from './register.js';
import Login from './login.js';
import CreateTeam from './createTeam.js';
import ViewTeam from './viewTeam.js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ProtectedRoute from '../auth/privateroutes.js';
const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <ProtectedRoute
          exact
          path="/viewteam/:teamId?/:channelId?"
          component={ViewTeam}
        />
        <ProtectedRoute exact path="/createteam" component={CreateTeam} />
      </Switch>
    </Router>
  );
};
export default Routes;
