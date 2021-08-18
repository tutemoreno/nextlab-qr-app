import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import React, { useRef } from 'react';

const transitionTimer = 500;

export default function Home() {
  const scannerInputRef = useRef(null);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      height: '100vh',
      backgroundColor: 'rgb(0, 0, 255)',
    },
    gridHeader: {
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '50%',
    },
    headerBgColor: {
      backgroundColor: 'rgb(118, 74, 188)',
    },
    gridBody: {
      backgroundColor: 'rgb(255, 255, 255)',
      height: '50%',
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
    },
    subtitle: {
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
  }));

  const theme = createTheme({
    palette: {
      secondary: {
        main: grey[50],
      },
    },
  });

  const classes = useStyles();

  return (
    <div div className={classes.root}>
      <ThemeProvider theme={theme}>
        <Grid container className={classes.gridHeader}>
          <Grid
            item
            xs={12}
            className={classes.headerBgColor}
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Box>
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <img
                  className={classes.imgLogo}
                  alt="icon-scan"
                  src="./assets/logo-app.png"
                />
                <Typography
                  component="h1"
                  variant="h3"
                  color="secondary"
                  className={classes.title}
                >
                  Nextlab Handheld
                </Typography>
              </Grid>
            </Box>
            <Box mt={1}>
              <Typography component="h1" variant="h5" color="secondary">
                Ingrese muestras escaneando tubos
              </Typography>
            </Box>
            <Box clone mt={3}>
              <form onSubmit={() => {}}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Comenzar a escanear
                </Button>
              </form>
            </Box>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.gridBody}
          container
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
        >
          <Grid
            container
            direction="column"
            xs={12}
            lg={2}
            className={classes.gridStep}
          >
            <Grid
              container
              justyContent="center"
              alignItems="center"
              direction="column"
            >
              <img
                className={classes.img}
                alt="icon-scan"
                src="./assets/icon-scan.png"
              />
              <Typography
                component="h1"
                variant="h5"
                className={classes.subtitle}
              >
                Escaneo
              </Typography>
            </Grid>
            <Typography component="h1">
              Escanee mediante codigo de barras para cargar la informacion del
              tubo
            </Typography>
          </Grid>

          <Grid direction="column" xs={12} lg={2} className={classes.gridStep}>
            <Grid
              container
              justyContent="center"
              alignItems="center"
              direction="column"
            >
              <img
                className={classes.img}
                alt="complex"
                src="./assets/icon-scan.png"
              />
              <Typography
                component="h1"
                variant="h5"
                className={classes.subtitle}
              >
                Paciente
              </Typography>
            </Grid>
            <Typography component="h1">
              Escanee el DNI o cargue los datos del paciente a mano
            </Typography>
          </Grid>
          <Grid direction="column" xs={12} lg={2} className={classes.gridStep}>
            <Grid
              container
              justyContent="center"
              alignItems="center"
              direction="column"
            >
              <img
                className={classes.img}
                alt="complex"
                src="./assets/icon-scan.png"
              />
              <Typography
                component="h1"
                variant="h5"
                className={classes.subtitle}
              >
                Envio
              </Typography>
            </Grid>

            <Typography component="h1">
              Envie toda la informacion que se cargara automaticamente en el LIS
            </Typography>
          </Grid>
        </Grid>
      </ThemeProvider>

      {/* <Zoom appear in={true} timeout={transitionTimer}>
          <Box>
            <Box clone mt={1}>
              <form onSubmit={() => {}}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Escanear muestra
                </Button>
              </form>
            </Box>
          </Box>
        </Zoom> */}
    </div>
  );
}
