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
import { useAuth } from '../context';

const useStyles = makeStyles(() => ({
  toolbar: {
    backgroundColor: '#979733',
  },
  title: {
    flexGrow: 1,
  },
}));

export const Navbar = () => {
  const classes = useStyles();
  const { user, signOut } = useAuth();

  return (
    <>
      <HideOnScroll>
        <AppBar>
          <Toolbar className={classes.toolbar}>
            <IconButton color="inherit">
              <Menu />
            </IconButton>
            <Typography className={classes.title} variant="h6">
              Nextlab
            </Typography>

            {user && (
              <>
                <Box clone px={2}>
                  <Typography variant="h6">{user.username}</Typography>
                </Box>
                <Button
                  variant="contained"
                  type="button"
                  color="secondary"
                  onClick={signOut}
                >
                  Logout
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Box className={`MuiToolbar-regular ${classes.toolbar}`} />
    </>
  );
};

function HideOnScroll(props) {
  const { children } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger();

  return (
    <Slide direction="down" in={!trigger}>
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
