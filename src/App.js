import Login from './components/Login.js';
import QrScanner from './components/QrScanner.js';
import PatientInfo from './components/PatientInfo.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

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
              <Link to="/qrScanner">QrScanner</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/qrScanner">
            <QrScanner />
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
