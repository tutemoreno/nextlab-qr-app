import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import axios from 'axios';
import React, { Fragment, useEffect, useState } from 'react';
import xmlParser from 'xml-js';
import { useAuth } from '../context/auth';
import { useFormContent } from '../utils/form';
import QrReader from './QrReader';

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
  button: {
    margin: theme.spacing(3, 0, 2),
  },
  formControl: {
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

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
  birthDate: '',
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
      gender,
      active,
    } = content,
    [documentTypes, setDocumentTypes] = useState([]),
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
    <Fragment>
      {sampleNumber ? (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="branch"
                label="Sucursal"
                id="branch"
                value={branch}
                onChange={onChange}
              />
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="origin"
                label="Origen"
                id="origin"
                value={origin}
                onChange={onChange}
              />
              <TextField
                type="number"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="sampleNumber"
                label="Nro. de muestra"
                id="sampleNumber"
                value={sampleNumber}
                onChange={onChange}
              />
              <FormControl
                id="documentType"
                className={classes.formControl}
                variant="outlined"
                margin="normal"
                required
                fullWidth
              >
                <InputLabel id="documentType">Tipo de documento</InputLabel>
                <Select
                  labelId="documentType"
                  id="documentType"
                  name="documentType"
                  label="Tipo de documento"
                  value={documentType}
                  onChange={onChange}
                >
                  {documentTypes.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="document"
                label="Documento"
                id="document"
                value={document}
                onChange={onChange}
              />
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="firstName"
                label="Primer nombre"
                id="firstName"
                value={firstName}
                onChange={onChange}
              />
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="secondName"
                label="Segundo nombre"
                id="secondName"
                value={secondName}
                onChange={onChange}
              />
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="firstSurname"
                label="Primer nombre"
                id="firstSurname"
                value={firstSurname}
                onChange={onChange}
              />
              <TextField
                type="text"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="secondSurname"
                label="Segundo nombre"
                id="secondSurname"
                value={secondSurname}
                onChange={onChange}
              />
              <FormControl
                id="gender"
                className={classes.formControl}
                variant="outlined"
                margin="normal"
                required
                fullWidth
              >
                <InputLabel id="gender">Género</InputLabel>
                <Select
                  labelId="gender"
                  id="gender"
                  name="gender"
                  label="Género"
                  value={gender}
                  onChange={onChange}
                >
                  <MenuItem value={'M'}>Masculino</MenuItem>
                  <MenuItem value={'F'}>Femenino</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                id="active"
                className={classes.formControl}
                variant="outlined"
                margin="normal"
                required
                fullWidth
              >
                <InputLabel id="active">Activo</InputLabel>
                <Select
                  labelId="active"
                  id="active"
                  name="active"
                  label="Activo"
                  value={active}
                  onChange={onChange}
                >
                  <MenuItem value={'S'}>Sí</MenuItem>
                  <MenuItem value={'N'}>No</MenuItem>
                </Select>
              </FormControl>
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
            </form>
          </div>
        </Container>
      ) : (
        <QrReader handleScan={handleScan} />
      )}
    </Fragment>
  );
}
