// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useRef, useState } from 'react';
import { useFormInput } from '../utils/form';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(3, 0, 2),
  },
  formControl: {
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function QrReader() {
  const barcodeDetector = new window.BarcodeDetector({
    formats: ['qr_code', 'code_128', 'pdf417'],
  });
  const deviceState = useFormInput('');
  const [devices, setDevices] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const classes = useStyles();
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
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <FormControl
        id="selectedCamera"
        className={classes.formControl}
        variant="outlined"
        margin="normal"
        fullWidth
      >
        <InputLabel id="selectedCamera">Camara seccionada</InputLabel>
        <Select
          labelId="selectedCamera"
          id="selectedCamera"
          name="selectedCamera"
          label="Camara seccionada"
          {...deviceState.input}
        >
          {devices.map((e) => (
            <MenuItem key={e.deviceId} value={e.deviceId}>
              {e.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <video autoPlay ref={videoRef} />
      {/* <input type="file" accept="image/*" capture="environment"></input> */}
      {/* <canvas ref={photoRef} width="640" height="480" /> */}
    </Container>
  );
}
