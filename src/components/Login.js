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
} from '@material-ui/core';
import { Eye, EyeOff } from 'mdi-material-ui';
import React, { useState } from 'react';
import { useAlert, useAuth } from '../context';
import { useFormContent } from '../hooks/useForm';

const initialState = {
  username: '',
  password: '',
  remember: false,
  codigo: '',
};

export const Login = () => {
  const { content, onChange } = useFormContent(initialState),
    { username, password, remember } = content;
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const { openAlert } = useAlert();

  const signIn = async (e) => {
    e.preventDefault();

    try {
      const loggedIn = await auth.signIn(content);

      if (!loggedIn) openAlert('Usuario/Contraseña incorrectos', 'error');
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
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={onChange}
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
