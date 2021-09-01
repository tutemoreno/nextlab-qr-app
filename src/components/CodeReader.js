// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/

import { makeStyles } from '@material-ui/core/styles';
import {
  BarcodeScan,
  Camera as CameraIcon,
  CloseCircle,
  CreditCardScan,
  Keyboard,
  MagnifyScan,
  QrcodeScan,
} from 'mdi-material-ui';
import PropTypes from 'prop-types';
import React, { forwardRef, useState } from 'react';
import { useBarcodeDetector, useCamera, useFormState } from '../hooks';
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from './';

const useStyles = makeStyles(() => ({
  codeIcon: {
    fontSize: '100px',
  },
}));

const hasBarcodeDetector = !!window.BarcodeDetector;

function CodeReaderComponent(
  { isOpen, title, formats, handleScan, handleClose },
  ref,
) {
  const [showInput, setShowInput] = useState(false);
  const showCamera = hasBarcodeDetector && !showInput;

  return (
    <Container disableGutters maxWidth={showCamera ? 'lg' : 'xs'}>
      <Paper elevation={24}>
        <Box display="flex" p={2}>
          <Box clone flexGrow={1}>
            <Typography variant="h6">{title}</Typography>
          </Box>

          <IconButton color="secondary" onClick={handleClose}>
            <CloseCircle variant="contained" />
          </IconButton>
        </Box>
        {showCamera ? (
          <Camera
            isOpen={isOpen}
            formats={formats}
            handleScan={handleScan}
            switchInput={() => setShowInput(true)}
          />
        ) : (
          <FocusedInput
            inputRef={ref}
            formats={formats}
            handleScan={handleScan}
            switchCamera={() => setShowInput(false)}
          />
        )}
      </Paper>
    </Container>
  );
}

CodeReaderComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
};

export const CodeReader = forwardRef(CodeReaderComponent);

function Camera({ isOpen, handleScan, formats, switchInput }) {
  const { device, devices, setValue, videoRef, stream } = useCamera(isOpen);

  useBarcodeDetector({ handleScan, formats, stream, videoRef });

  return (
    <>
      <Box position="relative" width="100%">
        <video
          style={{ width: 'inherit', height: 'inherit' }}
          autoPlay
          muted
          ref={videoRef}
        />
        <Box
          position="absolute"
          bottom="20px"
          right="20px"
          borderRadius="50%"
          bgcolor="primary.main"
        >
          <IconButton onClick={switchInput}>
            <Keyboard htmlColor="#fff" fontSize="large" />
          </IconButton>
        </Box>
      </Box>
      <Box p={2}>
        <TextField
          label="Camara seccionada"
          name="device"
          value={device}
          setValue={setValue}
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
}

Camera.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
  switchInput: PropTypes.func,
};

function FocusedInput({ formats, handleScan, inputRef, switchCamera }) {
  const classes = useStyles();
  const { content, setValue } = useFormState({ scanner: '' }),
    { scanner } = content;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleScan(scanner);
    setValue('scanner', '');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box my={10} position="relative" display="flex">
        <CodeIcon format={formats[0]} className={classes.codeIcon} />

        <Box clone position="absolute" bottom="-50px" right="-50px">
          <CircularProgress size="200px" />
        </Box>
      </Box>
      <Box clone p={2} width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            required
            label="Scanner"
            name="scanner"
            value={scanner}
            setValue={setValue}
            onBlur={() => inputRef.current.focus()}
            inputRef={inputRef}
            InputProps={{
              endAdornment: hasBarcodeDetector && (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={switchCamera}>
                    <CameraIcon fontSize="large" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
    </Box>
  );
}
FocusedInput.propTypes = {
  inputRef: PropTypes.object.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
  switchCamera: PropTypes.func,
};

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
