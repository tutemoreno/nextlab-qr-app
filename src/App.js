import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login.js';
import PatientInfo from './components/PatientInfo.js';
import { ProvideAuth } from './context/auth';

export default function App() {
  return (
    <ProvideAuth>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/patientInfo">
            <PatientInfo />
          </Route>
        </Switch>
      </Router>
    </ProvideAuth>
  );
}
