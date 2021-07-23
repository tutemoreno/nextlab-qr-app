import DateFnsUtils from '@date-io/date-fns';
import { Container, CssBaseline } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import Navbar from './components/Navbar.js';
import { ProvideAuth } from './context/auth';
import { AppRouter } from './routers/AppRouter.js';

export default function App() {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <ProvideAuth>
        <>
          <CssBaseline />
          <Navbar />
          <Container>
            <AppRouter />
          </Container>
        </>
      </ProvideAuth>
    </MuiPickersUtilsProvider>
  );
}
