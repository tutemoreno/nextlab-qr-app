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
import Menu from 'mdi-material-ui/Menu';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/auth';

export default function Navbar(props) {
  const { user, signOut } = useAuth();
  const ref = useRef(null);
  const [backgroundHeight, setBackgroundHeight] = useState(0);

  useEffect(() => {
    const { current: offsetHeight } = ref;

    setBackgroundHeight(offsetHeight);
    console.log('width', ref.current.offsetHeight);
  }, []);

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar ref={ref}>
          <Toolbar>
            <IconButton edge="start" color="inherit">
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
      <Box
        bgcolor="red"
        height={ref.current ? ref.current.offsetHeight : 0}
      ></Box>
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
