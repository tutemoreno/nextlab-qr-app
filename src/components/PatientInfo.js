import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
  LockOutlined as LockOutlinedIcon,
  Search as SearchIcon,
} from '@material-ui/icons';
import { KeyboardDatePicker } from '@material-ui/pickers';
import axios from 'axios';
import qs from 'qs';
import React, { useEffect, useState } from 'react';
import xmlParser from 'xml-js';
import { useFormContent } from '../hooks/useForm';
import useStyles from '../hooks/useStyles';
import QrCodeIcon from '../icons/QrCode';
import QrReaderDialog from './QrReader copy';

const initialState = {
  // qr
  branch: '',
  origin: '',
  sampleNumber: '',
  analysis: [],
  // manual
  document: '',
  documentType: 'DNI',
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
  birthDate: null,
  phone: '',
  fax: '',
  cellPhone: '',
  email: '',
  auxiliarCode: '',
  active: '',
  observation: '',
};

const initialScannerState = {
  open: true,
  formats: ['code_128'],
  title: 'Escanee la muestra',
  showClose: false,
};

const initialDocumentTypesState = [{ id: 'DNI', name: 'Doc. Nac. Identidad' }];

const initialAccordionState = {
  analysis: true,
  document: true,
  patient: false,
  contact: false,
};

const { REACT_APP_PATIENT_SERVICE, REACT_APP_NEXTLAB_TOKEN } = process.env;

export default function PatientInfo() {
  const { content, setContent, onChange } = useFormContent(initialState),
    {
      // qr
      branch,
      origin,
      sampleNumber,
      analysis,
      // manual
      document,
      documentType,
      // fetch patient
      firstName,
      secondName,
      firstSurname,
      secondSurname,
      birthDate,
      gender,
      email,
      cellPhone,
      phone,
      address,
      observation,
    } = content;
  const onBloodScan = async ({ rawValue }) => {
    try {
      closeScanner();

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
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [scannerState, setScannerState] = useState({
    ...initialScannerState,
    handleScan: onBloodScan,
  });
  const [accordionState, setAccordionState] = useState(initialAccordionState);
  const [documentTypes, setDocumentTypes] = useState(initialDocumentTypesState);
  const classes = useStyles();

  const openDocumentScanner = () => {
    setScannerState({
      open: true,
      title: 'Escanee el código de barras del documento',
      formats: ['pdf417'],
      handleScan: onDocumentScan,
    });
  };

  const onDocumentScan = ({ rawValue }) => {
    closeScanner();

    const split = rawValue.split('@');
    let document;

    if (split[0].length) document = split[4];
    else document = split[1];

    setContent((prevState) => ({
      ...prevState,
      document,
    }));

    getPatientInfo(document);
  };

  const closeScanner = () => {
    setScannerState((prevState) => ({ ...prevState, open: false }));
  };

  useEffect(() => {
    const getDocumentTypes = async () => {
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
        console.log(error);
      }
    };

    getDocumentTypes();
  }, []);

  const getPatientInfo = async (document) => {
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
          Paciente: {
            Nombre: { value: firstName },
            Nombre2: { value: secondName },
            Apellido: { value: firstSurname },
            Apellido2: { value: secondSurname },
            Sexo: { value: gender },
            FechaNac: { value: birthDate },
            Celular: { value: cellPhone },
            Telefono: { value: phone },
            Direccion: { value: address },
          },
        } = parsedInfo;

        setAccordionState({
          ...initialAccordionState,
          analysis: false,
          document: false,
          patient: true,
        });

        setContent((prevState) => ({
          ...prevState,
          firstName,
          secondName,
          firstSurname,
          secondSurname,
          gender,
          birthDate: new Date(birthDate),
          cellPhone: cellPhone ? cellPhone.replace('-', '') : '',
          phone: phone ? phone.replace('-', '') : '',
          address,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const expandAccordion = (name) => {
    setAccordionState((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  return (
    <Container>
      <QrReaderDialog {...scannerState} handleClose={closeScanner} />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Información del paciente
        </Typography>
        <div className={classes.form}>
          <Accordion
            expanded={accordionState.analysis}
            onChange={() => expandAccordion('analysis')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Analisis</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {analysis.map((item) => (
                  <ListItem divider key={item.CodigoAnalisis}>
                    <ListItemText
                      primary={item.CodigoAnalisis}
                      secondary={item.Descripcion}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={accordionState.document}
            onChange={() => expandAccordion('document')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Documento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form
                className={classes.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  getPatientInfo(document);
                }}
              >
                <Grid item container spacing={2}>
                  <Grid item xs={12} sm={5}>
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
                            <IconButton onClick={openDocumentScanner}>
                              <QrCodeIcon fontSize="large" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    container
                    xs={2}
                    direction="row"
                    alignItems="center"
                  >
                    <IconButton type="submit" style={{ padding: '0px' }}>
                      <SearchIcon fontSize="large" />
                    </IconButton>
                  </Grid>
                </Grid>
              </form>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={accordionState.patient}
            onChange={() => expandAccordion('patient')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Paciente</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form className={classes.form}>
                <Grid item container spacing={2}>
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
                      disableFuture
                      format="dd/MM/yyyy"
                      id="birthDate"
                      label="Fecha de nacimiento"
                      value={birthDate}
                      onChange={(date) =>
                        onChange({
                          target: {
                            value: date,
                            name: 'birthDate',
                            type: 'date',
                          },
                        })
                      }
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
                </Grid>
              </form>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={accordionState.contact}
            onChange={() => expandAccordion('contact')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Contacto</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form className={classes.form}>
                <Grid item container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="email"
                      variant="outlined"
                      required
                      fullWidth
                      name="email"
                      label="Email"
                      id="email"
                      value={email}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="number"
                      variant="outlined"
                      required
                      fullWidth
                      name="cellPhone"
                      label="Celular"
                      id="cellPhone"
                      value={cellPhone}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="number"
                      variant="outlined"
                      required
                      fullWidth
                      name="phone"
                      label="Teléfono fijo"
                      id="phone"
                      value={phone}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="text"
                      variant="outlined"
                      required
                      fullWidth
                      name="address"
                      label="Dirección"
                      id="address"
                      value={address}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      type="text"
                      variant="outlined"
                      multiline
                      fullWidth
                      rows={4}
                      name="observation"
                      label="Observaciones"
                      id="observation"
                      value={observation}
                      onChange={onChange}
                    />
                  </Grid>
                </Grid>
              </form>
            </AccordionDetails>
          </Accordion>

          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {}}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Container>
  );
}
