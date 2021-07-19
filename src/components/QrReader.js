// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import { Container, MenuItem, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useFormInput } from '../hooks/useForm';
import useStyles from '../hooks/useStyles';

export default function QrReader(props) {
  // import("./math").then(math => {
  //   console.log(math.add(16, 26));
  // });
  // formats ['qr_code', 'code_128', 'pdf417']

  const classes = useStyles();

  try {
    const barcodeDetector = new window.BarcodeDetector({
      formats: props.formats,
    });
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
            props.handleScan(data[0]);
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

      if (deviceState.input.value) startVideo();

      return () => {
        clearInterval(intervalId);

        if (stream)
          stream.getTracks().forEach((track) => {
            track.stop();
          });
      };
    }, [deviceState.input.value]);

    return (
      <Container maxWidth="xs">
        <TextField
          id="selectedDevice"
          label="Camara seccionada"
          name="selectedDevice"
          margin="normal"
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
        <video
          style={{ width: 'inherit', height: 'inherit' }}
          autoPlay
          ref={videoRef}
        />
      </Container>
    );
  } catch (error) {
    console.log(error, 'QR Exception');
    return (
      <Container maxWidth="xs">
        <div className={classes.paper}>
          <h1>No se pudo cargar la Camara del dispositivo</h1>
        </div>
      </Container>
    );
  }
}

QrReader.propTypes = {
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
};
