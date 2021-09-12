import DateFnsUtils from '@date-io/date-fns';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Navbar } from './components';
import { AuthProvider, SnackbarProvider } from './context';
import { AppRouter } from './routers';
import { theme } from './styles';

export default function App() {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <>
              <Navbar />
              <AppRouter />
            </>
          </SnackbarProvider>
        </ThemeProvider>
      </AuthProvider>
    </MuiPickersUtilsProvider>
  );
}
