import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useFormContent } from '../utils/form';

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

const initialState = {
  username: null,
  password: null,
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
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
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
            className={classes.submit}
          >
            Iniciar Sesion
          </Button>
          <Grid container>
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
