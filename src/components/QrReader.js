// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import {
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BarcodeScan, CloseCircle } from 'mdi-material-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useFormContent } from '../hooks/useForm';

const useStyles = makeStyles(() => ({
  codeIcon: {
    fontSize: '100%',
  },
  progress: {
    position: 'absolute',
    top: -6,
    left: -6,
  },
}));

export default function QrReader({
  open,
  title,
  formats,
  handleScan,
  handleClose,
  showClose,
}) {
  const classes = useStyles();

  // formats ['qr_code', 'code_128', 'pdf417']

  if (window['BarcodeDetector']) {
    const barcodeDetector = new window.BarcodeDetector({ formats });

    const { content, onChange, setContent } = useFormContent({
      device: '',
      devices: [],
    });
    const { device, devices } = content;
    const videoRef = useRef(null);

    useEffect(() => {
      const getDevices = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();

          const videoDevices = devices.filter(
            (device) => device.kind === 'videoinput',
          );

          setContent({
            device: videoDevices[videoDevices.length - 1].deviceId,
            devices: videoDevices,
          });
        } catch (error) {
          console.log(error, 'QR Error');
        }
      };

      getDevices();
    }, []);

    useEffect(() => {
      let intervalId,
        stream,
        handled = false;

      const startScan = async () => {
        try {
          if (handled) return;

          const data = await barcodeDetector.detect(videoRef.current);

          if (data.length) {
            handled = true;
            handleScan(data[0].rawValue);
          }
        } catch (error) {
          console.log(error, 'QR error');
        }
      };

      const startVideo = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: device,
              facingMode: 'environment',
            },
          });

          videoRef.current.srcObject = stream;

          intervalId = setInterval(startScan, 200);
        } catch (error) {
          console.log(error, 'QR Error');
        }
      };

      const cleanUp = () => {
        clearInterval(intervalId);

        if (stream)
          stream.getTracks().forEach((track) => {
            track.stop();
          });
      };

      if (open && device) startVideo();

      return cleanUp;
    }, [open, device]);

    return (
      <>
        <Box display="flex" p={2}>
          <Box clone flexGrow={1}>
            <Typography variant="h6">{title}</Typography>
          </Box>

          {showClose && (
            <IconButton color="secondary" onClick={handleClose}>
              <CloseCircle variant="contained" />
            </IconButton>
          )}
        </Box>
        <Box width="100%">
          <video
            style={{ width: 'inherit', height: 'inherit' }}
            autoPlay
            muted
            ref={videoRef}
          />
        </Box>
        <Box p={2}>
          <TextField
            id="selectedDevice"
            label="Camara seccionada"
            name="selectedDevice"
            variant="outlined"
            fullWidth
            value={device}
            onChange={onChange}
            select
          >
            {devices.map((e) => (
              <MenuItem key={e.deviceId} value={e.deviceId}>
                {e.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </>
    );
  } else {
    useEffect(() => {
      let value = '',
        handled = false;

      const keyDown = ({ key }) => {
        if (!handled) {
          if (key.length == 1) value += key;
          else if (key == 'Enter') {
            handled = true;
            handleScan(value);
          }
        }
      };

      if (open) window.addEventListener('keydown', keyDown);

      return () => window.removeEventListener('keydown', keyDown);
    }, [open]);

    return (
      <>
        <Box display="flex" p={2}>
          <Box clone flexGrow={1}>
            <Typography variant="h6">{title}</Typography>
          </Box>

          {showClose && (
            <IconButton color="secondary" onClick={handleClose}>
              <CloseCircle variant="contained" />
            </IconButton>
          )}
        </Box>
        <Box width="100%" display="flex" justifyContent="center" p={'10%'}>
          <Box position="relative">
            <BarcodeScan style={{ fontSize: '100px' }} />

            <CircularProgress
              style={{
                width: '200px',
                height: '200px',
                position: 'absolute',
                top: '-50px',
                left: '-50px',
              }}
              _className={classes.progress}
            />
          </Box>
        </Box>
      </>
    );
  }
}

QrReader.defaultProps = {
  showClose: false,
};

QrReader.propTypes = {
  open: PropTypes.bool.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
  showClose: PropTypes.bool,
};
