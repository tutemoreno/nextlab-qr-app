import DateFnsUtils from '@date-io/date-fns';
import { CssBaseline } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Fragment } from 'react';
import { ProvideAuth } from './context/auth';
import { AppRouter } from './routers/AppRouter.js';

export default function App() {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <ProvideAuth>
        <Fragment>
          <CssBaseline />
          
          <AppRouter />

        </Fragment>
      </ProvideAuth>
    </MuiPickersUtilsProvider>
  );
}
