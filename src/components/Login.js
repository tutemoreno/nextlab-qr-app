import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  Snackbar,
  TextField,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import LockOutline from 'mdi-material-ui/LockOutline';
import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { useFormContent } from '../hooks/useForm';
import HeaderHoc from './HeaderHoc';

const initialState = {
  username: '',
  password: '',
  remember: false,
};

export default function Login() {
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenError(false);
  };

  const { content, onChange } = useFormContent(initialState),
    { username, password, remember } = content,
    auth = useAuth();

  const signIn = async (e) => {
    e.preventDefault();

    try {
      const loggedIn = await auth.signIn(content);

      if (!loggedIn) displayError('Usuario/Contraseña incorrectos');
    } catch (error) {
      console.log(error);
      displayError('Error de comunicación');
    }
  };

  const displayError = (err) => {
    setErrorMessage(err);
    setOpenError(true);
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Snackbar
          open={openError}
          autoHideDuration={2000}
          onClose={handleCloseError}
        >
          <Alert
            onClose={handleCloseError}
            elevation={24}
            variant="filled"
            severity="error"
          >
            {errorMessage ? errorMessage : 'Error'}
          </Alert>
        </Snackbar>
        <Box clone mt={1} p={2}>
          <Paper elevation={24}>
            <HeaderHoc
              title="Iniciar Sesion"
              icon={<LockOutline fontSize="large" />}
            />
            <form onSubmit={signIn}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
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
                </Grid>
                <Grid item>
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
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    Iniciar sesion
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Link href="#" variant="body2">
                    Olvidé mi contraseña
                  </Link>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
