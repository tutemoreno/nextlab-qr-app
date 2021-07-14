import {
  Avatar,
  Button,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import { KeyboardDatePicker } from '@material-ui/pickers';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import xmlParser from 'xml-js';
import { useAuth } from '../context/auth';
import useStyles from '../hooks/useStyles';
import QrCodeIcon from '../icons/QrCode';
import { useFormContent } from '../utils/form';
import QrReader from './QrReader';

const initialState = {
  // manual
  document: '',
  documentType: 'DNI',
  // qr
  branch: '',
  origin: '',
  sampleNumber: '',
  analysis: [],
  // fetch
  code: '',
  firstName: '',
  secondName: '',
  lastName: '',
  firstSurname: '',
  secondSurname: '',
  gender: '',
  benefit: '',
  populationGroup: '',
  exportationDate: '',
  address: '',
  birthDate: new Date(),
  phone: '',
  fax: '',
  cellPhone: '',
  email: '',
  auxiliarCode: '',
  active: '',
};

const { REACT_APP_PATIENT_SERVICE, REACT_APP_NEXTLAB_TOKEN } = process.env;

export default function PatientInfo() {
  const { content, setContent, onChange } = useFormContent(initialState),
    {
      document,
      branch,
      origin,
      sampleNumber,
      documentType,
      firstName,
      secondName,
      firstSurname,
      secondSurname,
      birthDate,
      gender,
      active,
    } = content,
    [documentTypes, setDocumentTypes] = useState([
      { id: 'DNI', name: 'Doc. Nac. Identidad' },
    ]),
    auth = useAuth();

  const classes = useStyles();

  useEffect(() => {
    async function fetchDocumentTypes() {
      const data = new URLSearchParams();

      data.append('token', REACT_APP_NEXTLAB_TOKEN);

      const response = await axios({
        method: 'post',
        url: `${REACT_APP_PATIENT_SERVICE}/GetTiposDeDocumento`,
        data,
      });

      const parsedInfo = xmlParser.xml2js(response.data, {
        compact: true,
        textKey: 'value',
      });

      setDocumentTypes(
        parsedInfo.ListaTipoDocumento.Lista.TipoDocumento.map((e) => {
          return { id: e.TipoDoc.value, name: e.Descripcion.value };
        }),
      );
    }

    fetchDocumentTypes();
  }, []);

  const handleScan = (data) => {
    if (data) {
      const { Sucursal, Origen, NroMuestra } = JSON.parse(data);

      setContent((prevState) => ({
        ...prevState,
        branch: Sucursal,
        origin: Origen,
        sampleNumber: NroMuestra,
      }));
    }
  };

  const getPatientInfo = async () => {
    const data = new URLSearchParams();

    data.append('documento', document);
    data.append('tipoDoc', documentType);
    data.append('codigo', 0);
    data.append('token', REACT_APP_NEXTLAB_TOKEN);

    const response = await axios({
      method: 'post',
      url: `${REACT_APP_PATIENT_SERVICE}/paciente_datos`,
      data,
    });

    const parsedInfo = xmlParser.xml2js(response.data, {
      compact: true,
      textKey: 'value',
    });

    if (parsedInfo) {
      const {
        Paciente: { Nombre, Nombre2, Apellido, Apellido2, Sexo, Activo },
      } = parsedInfo;

      setContent((prevState) => ({
        ...prevState,
        firstName: Nombre.value,
        secondName: Nombre2.value,
        firstSurname: Apellido.value,
        secondSurname: Apellido2.value,
        gender: Sexo.value,
        active: Activo.value,
      }));
    }
  };

  return (
    <Container>
      {/* eslint-disable-next-line no-constant-condition */}
      {true ? (
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Información del paciente
          </Typography>
          <form className={classes.form}>
            <Grid container spacing={2}>
              {/* <Grid fixed container item xs={12} spacing={2}> */}
              <Grid item xs={12} sm={4}>
                <TextField
                  id="documentType"
                  label="Tipo de documento"
                  name="documentType"
                  variant="outlined"
                  fullWidth
                  value={documentType}
                  onChange={onChange}
                  select
                  xs="6"
                >
                  {documentTypes.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs>
                <TextField
                  type="text"
                  variant="outlined"
                  required
                  fullWidth
                  name="document"
                  label="Documento"
                  id="document"
                  value={document}
                  onChange={onChange}
                />
              </Grid>
              <Grid
                container
                item
                xs={2}
                direction="row"
                style={{ justifyContent: 'center' }}
                alignItems="center"
              >
                <IconButton>
                  <QrCodeIcon fontSize="large" />
                </IconButton>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              {/* </Grid> */}
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  variant="outlined"
                  required
                  fullWidth
                  name="firstName"
                  autoComplete="given-name"
                  label="Primer nombre"
                  id="firstName"
                  value={firstName}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  variant="outlined"
                  required
                  fullWidth
                  name="secondName"
                  label="Segundo nombre"
                  id="secondName"
                  value={secondName}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  variant="outlined"
                  required
                  fullWidth
                  name="firstSurname"
                  autoComplete="family-name"
                  label="Primer apellido"
                  id="firstSurname"
                  value={firstSurname}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  variant="outlined"
                  required
                  fullWidth
                  name="secondSurname"
                  label="Segundo apellido"
                  id="secondSurname"
                  value={secondSurname}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KeyboardDatePicker
                  variant="inline"
                  autoOk
                  inputVariant="outlined"
                  fullWidth
                  format="MM/dd/yyyy"
                  id="birthDate"
                  label="Fecha de nacimiento"
                  value={birthDate}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="gender"
                  label="Género"
                  name="gender"
                  variant="outlined"
                  fullWidth
                  value={gender}
                  onChange={onChange}
                  select
                >
                  <MenuItem value={'M'}>Masculino</MenuItem>
                  <MenuItem value={'F'}>Femenino</MenuItem>
                </TextField>
              </Grid>

              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={getPatientInfo}
              >
                Obtener paciente
              </Button>
            </Grid>
          </form>
        </Paper>
      ) : (
        <QrReader handleScan={handleScan} />
      )}
    </Container>
  );
}
