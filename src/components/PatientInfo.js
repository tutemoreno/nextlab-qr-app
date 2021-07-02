import React, { Fragment } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useFormInput } from '../utils/form';
import QrReader from 'react-qr-reader';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function PatientInfo(props) {
  const dni = useFormInput('');
  const branch = useFormInput('');
  const origin = useFormInput('');
  const sampleNumber = useFormInput('');
  const analysis = useFormInput([]);

  const classes = useStyles();

  const handleScan = (data) => {
    if (data) {
      const json = JSON.parse(data);
      console.log('[DATAAA]', json);

      branch.setValue(json.Sucursal);
      origin.setValue(json.Origen);
      sampleNumber.setValue(json.NroMuestra);

      console.log('[branch]', branch.value);
      console.log('[origin]', origin.value);
      console.log('[sampleNumber]', sampleNumber.value);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <Fragment>
      {sampleNumber.value ? (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="dni"
                label="DNI."
                name="DNI"
                {...dni}
                autoFocus
              />
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="branch"
                label="Sucursal"
                id="branch"
                {...branch}
              />
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="origin"
                label="Origen"
                id="origin"
                {...origin}
              />
              <TextField
                type="number"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="sampleNumber"
                label="Nro. de muestra"
                id="sampleNumber"
                {...sampleNumber}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Guardar
              </Button>
            </form>
          </div>
        </Container>
      ) : (
        <div>
          <QrReader
            delay={1000}
            style={previewStyle}
            onError={handleError}
            onScan={handleScan}
          />
        </div>
      )}
    </Fragment>
  );
}
