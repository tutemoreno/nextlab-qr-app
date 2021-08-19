import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

const transitionTimer = 500;

const useStyles = makeStyles(({ palette }) => ({
  gridHeader: {
    textAlign: 'center',
    color: palette.text.secondary,
    height: '50vh',
    backgroundColor: palette.deepPurple[500],
  },
  headerBgColor: {
    backgroundColor: palette.deepPurple[500],
  },
  gridBody: {
    backgroundColor: palette.grey[50],
  },
  img: {
    maxWidth: 90,
    maxHeight: 90,
  },
  imgLogo: {
    maxWidth: 70,
    maxHeight: 70,
    marginRight: 10,
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
    marginTop: 15,
    marginBottom: 15,
  },
  gridStep: {
    padding: 40,
  },
  gridStepItems: {
    marginTop: 10,
  },
  button: {
    fontWeight: 600,
  },
}));

export default function Home({ isAuthenticated }) {
  const classes = useStyles();

  return (
    <>
      <Grid
        container
        className={classes.gridHeader}
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Grid
          item
          direction="column"
          xs={12}
          container
          justifyContent="center"
          alignItems="center"
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            className={classes.headerBgColor}
            xs={12}
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
            <Typography
              component="h1"
              variant="h5"
              className={classes.subtitle}
            >
              Ingrese muestras escaneando tubos
            </Typography>
          </Box>
          <Box clone mt={3}>
            <form onSubmit={() => {}}>
              <Button
                type="submit"
                variant="contained"
                className={classes.button}
                size="large"
              >
                Comenzar a escanear
              </Button>
            </form>
          </Box>
        </Grid>
      </Grid>
      <Grid
        className={classes.gridBody}
        container
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Grid
          item
          container
          direction="column"
          xs={12}
          lg={2}
          className={classes.gridStep}
        >
          <Box alignItems="center" flexDirection="column">
            <img
              className={classes.img}
              alt="icon-scan"
              src="./assets/icon-scan.png"
            />
            <Typography
              component="h1"
              variant="h5"
              className={classes.stepTitle}
            >
              Escaneo
            </Typography>
          </Box>
          <Typography component="h1">
            Escanee mediante codigo de barras para cargar la informacion del
            tubo
          </Typography>
        </Grid>

        <Grid item xs={12} lg={2} className={classes.gridStep}>
          <Box alignItems="center" flexDirection="column">
            <img
              className={classes.img}
              alt="complex"
              src="./assets/icon-scan.png"
            />
            <Typography
              component="h1"
              variant="h5"
              className={classes.stepTitle}
            >
              Paciente
            </Typography>
          </Box>
          <Typography component="h1">
            Escanee el DNI o cargue los datos del paciente a mano
          </Typography>
        </Grid>
        <Grid item xs={12} lg={2} className={classes.gridStep}>
          <Box alignItems="center" flexDirection="column">
            <img
              className={classes.img}
              alt="complex"
              src="./assets/icon-scan.png"
            />
            <Typography
              component="h1"
              variant="h5"
              className={classes.stepTitle}
            >
              Envio
            </Typography>
          </Box>

          <Typography component="h1">
            Envie toda la informacion que se cargara automaticamente en el LIS
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}

Home.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};
