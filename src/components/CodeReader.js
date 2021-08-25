// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  BarcodeScan,
  CloseCircle,
  CreditCardScan,
  MagnifyScan,
  QrcodeScan,
} from 'mdi-material-ui';
import PropTypes from 'prop-types';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useFormContent } from '../hooks/useForm';

const useStyles = makeStyles(() => ({
  codeIcon: {
    fontSize: '100px',
  },
  progress: {
    position: 'absolute',
    top: '-50px',
    left: '-50px',
  },
}));
function CodeReaderComponent(
  { open, title, formats, handleScan, handleClose },
  ref,
) {
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
      <Paper elevation={24}>
        <Box display="flex" p={2}>
          <Box clone flexGrow={1}>
            <Typography variant="h6">{title}</Typography>
          </Box>

          <IconButton color="secondary" onClick={handleClose}>
            <CloseCircle variant="contained" />
          </IconButton>
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
      </Paper>
    );
  } else {
    const classes = useStyles();
    const { content, onChange, setValue } = useFormContent({ scanner: '' }),
      { scanner } = content;

    const handleSubmit = (e) => {
      e.preventDefault();
      handleScan(scanner);
      setValue('scanner', '');
    };

    return (
      <Container disableGutters maxWidth="xs">
        <Paper elevation={24}>
          <Box display="flex" p={2}>
            <Box clone flexGrow={1}>
              <Typography variant="h6">{title}</Typography>
            </Box>

            <IconButton color="secondary" onClick={handleClose}>
              <CloseCircle variant="contained" />
            </IconButton>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Box my={10} position="relative">
              <CodeIcon format={formats[0]} className={classes.codeIcon} />

              <CircularProgress size="200px" className={classes.progress} />
            </Box>
            <Box clone p={2} width="100%">
              <form onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="scanner"
                  label="Scanner"
                  name="scanner"
                  value={scanner}
                  onChange={onChange}
                  onBlur={() => ref.current.focus()}
                  inputRef={ref}
                />
              </form>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }
}

CodeReaderComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
};

export const CodeReader = forwardRef(CodeReaderComponent);

function CodeIcon({ format, ...rest }) {
  let icon;

  switch (format) {
    case 'qr_code':
      icon = <QrcodeScan {...rest} />;
      break;
    case 'code_128':
      icon = <BarcodeScan {...rest} />;
      break;
    case 'pdf417':
      icon = <CreditCardScan {...rest} />;
      break;
    default:
      icon = <MagnifyScan {...rest} />;
      break;
  }

  return icon;
}
