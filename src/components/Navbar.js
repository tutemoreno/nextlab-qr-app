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
import { useAuth } from '../context/Auth';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [backgroundHeight, setBackgroundHeight] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    setBackgroundHeight(ref.current.offsetHeight);
  }, []);

  return (
    <>
      <HideOnScroll>
        <AppBar ref={ref}>
          <Toolbar>
            <IconButton color="inherit">
              <Menu />
            </IconButton>
            <Typography style={{ flexGrow: 1 }} variant="h6">
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
      <Box height={backgroundHeight} />
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
