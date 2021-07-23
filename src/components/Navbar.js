import {
  AppBar,
  Box,
  Button,
  IconButton,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Menu from 'mdi-material-ui/Menu';
import PropTypes from 'prop-types';
import React from 'react';
import { useAuth } from '../context/auth';

export default function Navbar(props) {
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
    <>
      <HideOnScroll {...props}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <Menu />
            </IconButton>
            <Typography style={{ flexGrow: 1 }} variant="h6">
              Nextlab
            </Typography>
            {user && (
              <>
                <Typography variant="h6">{user.username}</Typography>
                <Button variant="contained" color="secondary" onClick={signOut}>
                  Logout
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Box height={64}></Box>
    </>
  );
}

function HideOnScroll(props) {
  const { children } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger();

  return (
    <Slide _appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
};
