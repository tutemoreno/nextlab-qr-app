import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const SnackbarContext = createContext();

export function ProvideSnackbar({ children }) {
  const [notification, setNotification] = useState({
    message: '',
    severity: 'info',
  });
  const { message, severity } = notification;
  const [open, setOpen] = useState(false);

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') return;

    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{}}>
      <Snackbar open={open} autoHideDuration={2000} onClose={handleCloseError}>
        <Alert
          onClose={handleCloseError}
          elevation={24}
          variant="filled"
          severity={notification}
        >
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackbarContext.Provider>
  );
}
ProvideSnackbar.propTypes = {
  children: PropTypes.element.isRequired,
};

export const useAuth = () => {
  return useContext(SnackbarContext);
};
