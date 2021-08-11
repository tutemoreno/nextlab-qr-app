import React from 'react';
import { BrowserRouter as Router, Redirect, Switch } from 'react-router-dom';
import Login from '../components/Login';
import PatientInfo from '../components/PatientInfo';
import { useAuth } from '../context/Auth';
import { PrivateRoute } from './PrivateRoute.js';
import { PublicRoute } from './PublicRoute.js';

export const AppRouter = () => {
  const auth = useAuth();

  return (
    <Router>
      <div>
        <Switch>
          <PublicRoute
            exact
            path="/login"
            component={Login}
            isAuthenticated={auth.user && auth.user.isValid ? true : false}
          />

          <PrivateRoute
            exact
            path="/"
            component={PatientInfo}
            isAuthenticated={auth.user && auth.user.isValid ? true : false}
          />

          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  );
};
