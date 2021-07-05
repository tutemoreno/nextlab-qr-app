import React from 'react';
import Login from './components/Login.js';
import PatientInfo from './components/PatientInfo.js';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/patientInfo">PatientInfo</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/patientInfo">
            <PatientInfo />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
