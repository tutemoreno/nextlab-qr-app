import { Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useAuth } from '../context/auth';
import { getStore } from '../utils/store';

export const Navbar = () => {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    logout: {
      padding: theme.spacing(2, 2, 0, 2),
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    marginRight: {
      marginRight: theme.spacing(1),
    },
  }));

  const classes = useStyles();

  const { REACT_APP_STORE_PATH } = process.env;

  const store = getStore(REACT_APP_STORE_PATH);

  const auth = useAuth();

  const handleClickLogout = () => {
    auth.signOut();
  };

  return (
    <div>
      <Grid container className={classes.logout}>
        <Typography
          variant="button"
          display="block"
          gutterBottom
          className={classes.marginRight}
        >
          {store !== null ? store.username : ''}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClickLogout}
        >
          Logout
        </Button>
      </Grid>
    </div>
  );
};
