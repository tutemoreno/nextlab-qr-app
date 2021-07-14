// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import { Container, MenuItem, TextField } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { useFormInput } from '../utils/form';

export default function QrReader() {
  // import("./math").then(math => {
  //   console.log(math.add(16, 26));
  // });
  const barcodeDetector = new window.BarcodeDetector({
    formats: ['qr_code', 'code_128', 'pdf417'],
  });
  const deviceState = useFormInput('');
  const [devices, setDevices] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const videoRef = useRef(null);
  // const photoRef = useRef(null);

  useEffect(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoDevicesBack = devices.filter(
      (device) =>
        device.kind === 'videoinput' &&
        device.getCapabilities().facingMode.includes('environment'),
    );

    setDevices(videoDevicesBack);
    deviceState.setValue(
      videoDevicesBack[videoDevicesBack.length - 1].deviceId,
    );
  }, []);

  useEffect(async () => {
    const startScan = async () => {
      // let video = videoRef.current;
      // let photo = photoRef.current;
      // let ctx = photo.getContext('2d');
      // ctx.drawImage(video, 0, 0);

      const data = await barcodeDetector.detect(videoRef.current);

      if (data.length) console.log(data[0].rawValue);
    };

    if (deviceState.input.value) {
      const oldStream = videoRef.current.srcObject;

      if (oldStream) {
        oldStream.getTracks().forEach((track) => {
          track.stop();
        });

        clearInterval(intervalId);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceState.input.value,
          resizeMode: 'none',
          facingMode: 'environment',
        },
      });

      videoRef.current.srcObject = stream;

      setIntervalId(setInterval(startScan, 200));
    }

    return () => clearInterval(intervalId);
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
      <video autoPlay ref={videoRef} />
      {/* <input type="file" accept="image/*" capture="environment"></input> */}
      {/* <canvas ref={photoRef} width="640" height="480" /> */}
    </Container>
  );
}
