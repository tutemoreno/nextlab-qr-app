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
import React, { forwardRef } from 'react';
import { useBarcodeDetector, useCamera, useFormState } from '../hooks';

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
  { isOpen, title, formats, handleScan, handleClose },
  ref,
) {
  // const [isManual, setIsManual] = useState(false);
  const hasBarcodeDetector = window.BarcodeDetector;

  if (hasBarcodeDetector) {
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
        <Camera isOpen={isOpen} formats={formats} handleScan={handleScan} />
      </Paper>
    );
  } else {
    const classes = useStyles();
    const { content, onChange, setValue } = useFormState({ scanner: '' }),
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
  isOpen: PropTypes.bool.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
};

export const CodeReader = forwardRef(CodeReaderComponent);

function Camera({ isOpen, handleScan, formats }) {
  const { device, devices, onDeviceChange, videoRef, stream } =
    useCamera(isOpen);

  useBarcodeDetector({ handleScan, formats, stream, videoRef });

  return (
    <>
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
          id="device"
          label="Camara seccionada"
          name="device"
          variant="outlined"
          fullWidth
          value={device}
          onChange={onDeviceChange}
          select
        >
          {devices.map((e) => (
            <MenuItem key={e.deviceId} value={e.deviceId}>
              {e.label}
            </MenuItem>
          ))}
        </TextField>
        {/* <Box clone mt={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => setIsManual(true)}
            >
              Ingreso manual
            </Button>
          </Box> */}
      </Box>
    </>
  );
}

Camera.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleScan: PropTypes.func.isRequired,
  formats: PropTypes.array.isRequired,
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
