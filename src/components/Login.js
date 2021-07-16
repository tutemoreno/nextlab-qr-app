import {
  Avatar,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import useStyles from '../hooks/useStyles';
import { useFormContent } from '../hooks/useForm';

const initialState = {
  username: '',
  password: '',
  remember: false,
};



export default function Login() {

  const [openError, setOpenError] = React.useState(false);

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenError(false);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const { content, onChange } = useFormContent(initialState),
    { username, password, remember } = content,
    history = useHistory(),
    location = useLocation(),
    { from } = location.state || { from: { pathname: '/' } },
    auth = useAuth(),
    classes = useStyles();

  const signIn = async (e) => {
    e.preventDefault();

    try {
      
      const loggedIn = await auth.signIn(content);
  
      if (loggedIn) history.replace(from);

    } catch (error) {
      console.log(error);
      setOpenError(true);
    }

  };

  return (
    <Container maxWidth="xs">
      <div className={classes.paper}>

        <Snackbar 
          open={ openError } 
          autoHideDuration={ 2000 } 
          onClose={ handleCloseError }
        >
          <Alert 
            onClose={ handleCloseError } 
            severity="error"
          >
            Error de comunicación
          </Alert>
        </Snackbar>

        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Iniciar Sesion
        </Typography>
        <form className={classes.form} onSubmit={signIn}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de usuario"
            name="username"
            value={username}
            onChange={onChange}
            autoComplete="username"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            value={password}
            onChange={onChange}
            autoComplete="current-password"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="remember"
                checked={remember}
                onChange={onChange}
                color="primary"
              />
            }
            name="remember"
            label="Recordarme"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Iniciar Sesion
          </Button>
          <Grid Grid>
            <Grid item xs>
              <Link href="#" variant="body2">
                Olvidé mi contraseña
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
