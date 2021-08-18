import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route as PublicRoute,
  Switch,
} from 'react-router-dom';
import Home from '../components/Home';
import PatientInfo from '../components/PatientInfo';
import { useAuth } from '../context/Auth';
import { PrivateRoute } from './PrivateRoute.js';

export const AppRouter = () => {
  const auth = useAuth();
  const isAuthenticated = auth.user && auth.user.isValid ? true : false;

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
