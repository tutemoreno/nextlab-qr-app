import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import Login from './Login';

const useStyles = makeStyles(({ palette }) => ({
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
        <Box mt={3}>{isAuthenticated ? <FormStart /> : <Login />}</Box>
      </Box>
      <Grid
        className={classes.gridBody}
        container
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
      >
        <GridItemStep
          srcImg="./assets/icon-scan.png"
          title="Escaneo"
          description="Escanee mediante codigo de barras para cargar la informacion del
              tubo"
        />

        <GridItemStep
          srcImg="./assets/icon-scan.png"
          title="Paciente"
          description="Escanee el DNI o cargue los datos del paciente a mano"
        />

        <GridItemStep
          srcImg="./assets/icon-scan.png"
          title="Envio"
          description="Envie toda la informacion que se cargara automaticamente en el LIS"
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

  return (
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
  );
}

function GridItemStep({ srcImg, title, description }) {
  const classes = useStyles();

  return (
    <Grid item xs={12} lg={3} className={classes.gridStep}>
      <Box alignItems="center" flexDirection="column" display="flex">
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
