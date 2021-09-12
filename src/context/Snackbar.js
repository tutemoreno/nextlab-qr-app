import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const SnackbarContext = createContext();

export function SnackbarProvider({ children }) {
  const [alertState, setAlertState] = useState({
    message: '',
    severity: 'info',
  });
  const { message, severity } = alertState;
  const [open, setOpen] = useState(false);

  const closeAlert = (event, reason) => {
    if (reason === 'clickaway') return;

    setOpen(false);
  };

  const openAlert = (message, severity = 'info') => {
    setAlertState({ message, severity });
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={{ openAlert }}>
      <Snackbar open={open} autoHideDuration={3000} onClose={closeAlert}>
        <Alert
          onClose={closeAlert}
          elevation={24}
          variant="filled"
          severity={severity}
        >
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackbarContext.Provider>
  );
}
SnackbarProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export const useAlert = () => {
  return useContext(SnackbarContext);
};
