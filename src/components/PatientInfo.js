import {
  Avatar,
  Button,
  Container,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Slide,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  LockOutlined as LockOutlinedIcon,
  Search as SearchIcon,
} from '@material-ui/icons';
import { KeyboardDatePicker } from '@material-ui/pickers';
import axios from 'axios';
import PropTypes from 'prop-types';
import qs from 'qs';
import React, { useEffect, useState } from 'react';
import xmlParser from 'xml-js';
import { useAuth } from '../context/auth';
import useStyles from '../hooks/useStyles';
import QrCodeIcon from '../icons/QrCode';
import { useFormContent } from '../hooks/useForm';
import QrReader from './QrReader';

const initialState = {
  // qr
  hasBooldInfo: false,
  branch: '',
  origin: '',
  sampleNumber: '',
  analysis: [],
  // manual
  document: '',
  documentType: 'DNI',
  // fetch
  hasPatientInfo: false,
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
      // qr
      hasBooldInfo,
      branch,
      origin,
      sampleNumber,
      analysis,
      // manual
      document,
      documentType,
      // fetch patient
      hasPatientInfo,
      firstName,
      secondName,
      firstSurname,
      secondSurname,
      birthDate,
      gender,
    } = content,
    [documentTypes, setDocumentTypes] = useState([
      { id: 'DNI', name: 'Doc. Nac. Identidad' },
    ]),
    auth = useAuth();

  const classes = useStyles();

  useEffect(() => {
    const getDocumentTypes = async () => {
      // TODO: agregar try catch

      try {
        
        const response = await axios({
          method: 'post',
          url: `${REACT_APP_PATIENT_SERVICE}/GetTiposDeDocumento`,
          data: qs.stringify({ token: REACT_APP_NEXTLAB_TOKEN }),
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

      } catch (error) {
        console.log(object)
      }
      
    };

    getDocumentTypes();
  }, []);

  const onBloodScan = async ({ rawValue }) => {
    
    try {
      
      const response = await axios({
        method: 'post',
        url: `${REACT_APP_PATIENT_SERVICE}/GetQr`,
        data: qs.stringify({ idQr: rawValue, token: REACT_APP_NEXTLAB_TOKEN }),
      });
  
      if (response.status == 200) {
        const parsedXml = xmlParser.xml2js(response.data, {
          compact: true,
          textKey: 'value',
        });
  
        const { Sucursal, Origen, NroMuestra, Analisis } = JSON.parse(
          parsedXml.string.value,
        );
  
        setContent((prevState) => ({
          ...prevState,
          branch: Sucursal,
          origin: Origen,
          sampleNumber: NroMuestra,
          analysis: Analisis,
          hasBooldInfo: true,
        }));
      }

    } catch (error) {
      console.log(error);
    }
    
  };

  const getPatientInfo = async (e) => {
    e.preventDefault();

    try {
      
      const response = await axios({
        method: 'post',
        url: `${REACT_APP_PATIENT_SERVICE}/paciente_datos`,
        data: qs.stringify({
          documento: document,
          tipoDoc: documentType,
          codigo: 0,
          token: REACT_APP_NEXTLAB_TOKEN,
        }),
      });

      if (response.status == 200) {
        const parsedInfo = xmlParser.xml2js(response.data, {
          compact: true,
          textKey: 'value',
        });

        console.log(parsedInfo);

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
          hasPatientInfo: true,
        }));
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      {hasBooldInfo ? (
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Información del paciente
          </Typography>
          <form className={classes.form} onSubmit={getPatientInfo}>
            <Grid item container spacing={2}>
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => {}}>
                          <QrCodeIcon fontSize="large" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item container xs={2} direction="row" alignItems="center">
                <IconButton
                  type="submit"
                  style={{ padding: '0px' }}
                  onClick={getPatientInfo}
                >
                  <SearchIcon fontSize="large" />
                </IconButton>
              </Grid>
            </Grid>
          </form>
          <Slide direction="up" in={hasPatientInfo} mountOnEnter unmountOnExit>
            <form className={classes.form}>
              <Grid item container spacing={2}>
                <Grid item xs={12}>
                  <Typography component="h1" variant="h6">
                    Detalles
                  </Typography>
                </Grid>
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
          </Slide>
        </div>
      ) : (
        <QrReader formats={['code_128']} handleScan={onBloodScan} />
      )}
    </Container>
  );
}

function SimpleDialog(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle>
      <QrReader formats={['code_128']} handleScan={handleClose} />
    </Dialog>
  );
}
SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};
