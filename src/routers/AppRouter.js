import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route as PublicRoute,
  Switch,
} from 'react-router-dom';
import { Home, PatientInfo } from '../components';
import { useAuth } from '../context';
import { PrivateRoute } from './';

export const AppRouter = () => {
  const { user } = useAuth();
  const isAuthenticated = user && user.isValid ? true : false;

  return (
    <Router>
      <div>
        <Switch>
          <PublicRoute
            exact
            path="/"
            component={(props) => Home({ ...props, isAuthenticated })}
          />
          <PrivateRoute
            exact
            path="/paciente"
            component={PatientInfo}
            isAuthenticated={isAuthenticated}
          />
          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  );
};
