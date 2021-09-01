import { Eye, EyeOff } from 'mdi-material-ui';
import React, { useState } from 'react';
import { useAlert, useAuth } from '../context';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from './';

const initialState = {
  username: '',
  password: '',
  remember: false,
  codigo: '',
};

export const Login = () => {
  const [state, setState] = useState(initialState),
    { username, password, remember } = state;
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const { openAlert } = useAlert();

  const signIn = async (e) => {
    e.preventDefault();

    try {
      const loggedIn = await auth.signIn(state);

      if (loggedIn) window.scroll({ top: 0, behavior: 'smooth' });
      else openAlert('Usuario/Contraseña incorrectos', 'error');
    } catch (error) {
      console.log(error);
      openAlert('Error de comunicación', 'error');
    }
  };

  return (
    <Container disableGutters maxWidth="xs">
      <Box clone p={2}>
        <Paper elevation={24}>
          <form onSubmit={signIn}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="username"
                  label="Nombre de usuario"
                  name="username"
                  value={username}
                  setState={setState}
                  autoComplete="username"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  setState={setState}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color="primary"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? <Eye /> : <EyeOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="remember"
                      checked={remember}
                      setState={setState}
                      color="primary"
                    />
                  }
                  name="remember"
                  label="Recordarme"
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" color="primary">
                  Iniciar sesion
                </Button>
              </Grid>
              {/* <Grid item xs={12}>
                  <Link href="#" variant="body2">
                    Olvidé mi contraseña
                  </Link>
                </Grid> */}
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
