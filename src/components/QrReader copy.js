// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import {
  AppBar,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import React from 'react';
import useStyles from '../hooks/useStyles';
import QrReader from './QrReader';

export default function QrReaderHoc(props) {
  const classes = useStyles();
  const { open } = props;

  return (
    <Dialog fullScreen open={open}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            {props.title}
          </Typography>
          <IconButton color="inherit" onClick={props.handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <QrReader {...props} />
    </Dialog>
  );
}
QrReaderHoc.propTypes = {
  handleScan: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};
