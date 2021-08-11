import DateFnsUtils from '@date-io/date-fns';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import Navbar from './components/Navbar.js';
import { ProvideAuth } from './context/Auth';
import { ProvideSnackbar } from './context/Snackbar';
import { AppRouter } from './routers/AppRouter';
import theme from './styles/theme';

export default function App() {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <ProvideAuth>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ProvideSnackbar>
            <>
              <Navbar />
              <AppRouter />
            </>
          </ProvideSnackbar>
        </ThemeProvider>
      </ProvideAuth>
    </MuiPickersUtilsProvider>
  );
}
