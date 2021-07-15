import DateFnsUtils from '@date-io/date-fns';
import { CssBaseline } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login.js';
import PatientInfo from './components/PatientInfo.js';
import PrivateRoute from './components/PrivateRoute.js';
import { ProvideAuth } from './context/auth';

export default function App() {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <ProvideAuth>
        <Fragment>
          <CssBaseline />
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
        </Fragment>
      </ProvideAuth>
    </MuiPickersUtilsProvider>
  );
}
