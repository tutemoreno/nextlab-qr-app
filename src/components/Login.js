import {
  Avatar,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import useStyles from '../hooks/useStyles';
import { useFormContent } from '../utils/form';

const initialState = {
  username: '',
  password: '',
  remember: false,
};

export default function Login() {
  const { content, onChange } = useFormContent(initialState),
    { username, password, remember } = content,
    history = useHistory(),
    location = useLocation(),
    { from } = location.state || { from: { pathname: '/' } },
    auth = useAuth(),
    classes = useStyles();

  const signIn = async (e) => {
    e.preventDefault();

    const loggedIn = await auth.signIn(content);

    if (loggedIn) history.replace(from);
  };

  return (
    <Container maxWidth="xs">
      <Paper className={classes.paper}>
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
      </Paper>
    </Container>
  );
}
