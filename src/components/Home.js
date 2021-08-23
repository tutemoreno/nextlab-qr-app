import {
  Box,
  Button,
  Grid,
  Grow,
  makeStyles,
  Typography,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import Login from './Login';

const useStyles = makeStyles(({ palette, spacing }) => ({
  gridHeader: {
    textAlign: 'center',
    color: palette.text.secondary,
    backgroundColor: palette.deepPurple[500],
    height: '50vh',
  },
  headerBgColor: {
    backgroundColor: palette.deepPurple[500],
  },
  gridBody: {
    backgroundColor: palette.grey[50],
  },
  img: {
    maxWidth: spacing(11),
    maxHeight: spacing(11),
  },
  imgLogo: {
    maxWidth: spacing(9),
    maxHeight: spacing(9),
    marginRight: spacing(1),
  },
  title: {
    fontWeight: 600,
    color: palette.grey[50],
  },
  subtitle: {
    color: palette.grey[50],
  },
  stepTitle: {
    fontWeight: 600,
    margin: spacing(2, 0),
  },
  gridStep: {
    padding: spacing(5),
  },
  button: {
    fontWeight: 600,
  },
}));

export default function Home({ isAuthenticated }) {
  const classes = useStyles();

  return (
    <>
      <Box
        width="100%"
        className={classes.gridHeader}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px={5}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          className={classes.headerBgColor}
        >
          <img
            className={classes.imgLogo}
            alt="icon-scan"
            src="./assets/logo-app.png"
          />
          <Typography component="h1" variant="h3" className={classes.title}>
            Nextlab Handheld
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography component="h1" variant="h5" className={classes.subtitle}>
            Ingrese muestras escaneando tubos
          </Typography>
        </Box>
        <Grow in={true} timeout={1000}>
          <Box mt={3}>{isAuthenticated ? <FormStart /> : <Login />}</Box>
        </Grow>
      </Box>
      <Grid className={classes.gridBody} container justifyContent="center">
        <GridItemStep
          srcImg="./assets/barcode-scan24.png"
          title="Escaneo"
          description="Escanee mediante código de barras para cargar la información del
              tubo"
        />

        <GridItemStep
          srcImg="./assets/card-account-details-outline.png"
          title="Paciente"
          description="Escanee el DNI o ingrese los datos del paciente de forma manual"
        />

        <GridItemStep
          srcImg="./assets/playlist-check.png"
          title="Envío"
          description="Envíe toda la información que se cargará automáticamente en el LIS"
        />
      </Grid>
    </>
  );
}
Home.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

function FormStart() {
  const classes = useStyles();
  const history = useHistory();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        history.push('/paciente');
      }}
    >
      <Button
        type="submit"
        variant="contained"
        className={classes.button}
        size="large"
      >
        Comenzar a escanear
      </Button>
    </form>
  );
}

function GridItemStep({ srcImg, title, description }) {
  const classes = useStyles();

  return (
    <Grid item xs={12} lg={3} className={classes.gridStep}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <img className={classes.img} alt="icon-scan" src={srcImg} />
        <Typography component="h1" variant="h5" className={classes.stepTitle}>
          {title}
        </Typography>
        <Typography component="h1">{description}</Typography>
      </Box>
    </Grid>
  );
}
GridItemStep.propTypes = {
  srcImg: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
