import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login.js';
import PatientInfo from './components/PatientInfo.js';
import PrivateRoute from './components/PrivateRoute.js';
import { ProvideAuth } from './context/auth';

export default function App() {
  return (
    <ProvideAuth>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <PrivateRoute path="/patientInfo">
            <PatientInfo />
          </PrivateRoute>
        </Switch>
      </Router>
    </ProvideAuth>
  );
}
