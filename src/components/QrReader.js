// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import {
  Box,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseCircle from 'mdi-material-ui/CloseCircle';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useFormInput } from '../hooks/useForm';

export default function QrReader(props) {
  // formats ['qr_code', 'code_128', 'pdf417']

  try {
    const { open, title, formats, handleScan, handleClose, showClose } = props;
    const barcodeDetector = new window.BarcodeDetector({ formats });
    const deviceState = useFormInput('');
    const [devices, setDevices] = useState([]);
    const videoRef = useRef(null);

    useEffect(() => {
      const getDevices = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();

          const videoDevices = devices.filter(
            (device) => device.kind === 'videoinput',
          );

          setDevices(videoDevices);

          deviceState.setValue(videoDevices[videoDevices.length - 1].deviceId);
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
            handleScan(data[0]);
          }
        } catch (error) {
          console.log(error, 'QR error');
        }
      };

      const startVideo = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: deviceState.input.value,
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

      if (open && deviceState.input.value) startVideo();

      return cleanUp;
    }, [open, deviceState.input.value]);

    return (
      <>
        <Box display="flex" p={2} bgcolor="background.paper">
          <Box clone flexGrow={1}>
            <Typography variant="subtitle1">{title}</Typography>
          </Box>

          {showClose && (
            <IconButton color="secondary" onClick={handleClose}>
              <CloseCircle variant="contained" />
            </IconButton>
          )}
        </Box>
        <video
          style={{ width: 'inherit', height: 'inherit' }}
          autoPlay
          ref={videoRef}
        />
        <Box p={2}>
          <TextField
            id="selectedDevice"
            label="Camara seccionada"
            name="selectedDevice"
            variant="outlined"
            fullWidth
            {...deviceState.input}
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
  } catch (error) {
    console.log(error, 'QR Exception');
    return (
      <Box maxWidth="xs">
        <div>
          <h1>No se pudo cargar la Camara del dispositivo</h1>
        </div>
      </Box>
    );
  }
}

QrReader.defaultProps = {
  showClose: true,
};

QrReader.propTypes = {
  open: PropTypes.bool.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
  showClose: PropTypes.bool,
};
