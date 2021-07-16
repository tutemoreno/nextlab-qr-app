// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import { Container, MenuItem, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useFormInput } from '../hooks/useForm';

export default function QrReader(props) {
  // import("./math").then(math => {
  //   console.log(math.add(16, 26));
  // });
  // formats ['qr_code', 'code_128', 'pdf417']
  const barcodeDetector = new window.BarcodeDetector({
    formats: props.formats,
  });
  const deviceState = useFormInput('');
  const [devices, setDevices] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    const getDevices = async () => {
      // TODO: agregar try catch
      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );

      setDevices(videoDevices);

      deviceState.setValue(videoDevices[videoDevices.length - 1].deviceId);
    };

    getDevices();
  }, []);

  useEffect(() => {
    let intervalId, stream;

    const startScan = async () => {
      // TODO: agregar try catch
      console.log('scan');
      const data = await barcodeDetector.detect(videoRef.current);

      if (data.length) props.handleScan(data[0]);
    };

    const startVideo = async () => {
      // TODO: agregar try catch
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceState.input.value,
          facingMode: 'environment',
        },
      });

      videoRef.current.srcObject = stream;

      intervalId = setInterval(startScan, 200);
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
}

QrReader.propTypes = {
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
};
