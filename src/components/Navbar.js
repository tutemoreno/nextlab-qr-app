import { Box, Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useAuth } from '../context/auth';

export default function Navbar() {
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

  const { user, signOut } = useAuth();

  return (
    <Box>
      <Grid container className={classes.logout}>
        <Typography
          variant="button"
          display="block"
          gutterBottom
          className={classes.marginRight}
        >
          {user ? user.username : ''}
        </Typography>
        <Button variant="contained" color="secondary" onClick={signOut}>
          Logout
        </Button>
      </Grid>
    </Box>
  );
}
