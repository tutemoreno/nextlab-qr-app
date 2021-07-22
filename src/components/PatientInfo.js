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
  Typography
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import axios from 'axios';
import {
  BarcodeScan,
  ChevronDown,
  LockOutline,
  Magnify
} from 'mdi-material-ui';
import qs from 'qs';
import React, { useEffect, useState } from 'react';
import xml2js from 'xml2js';
import { useFormContent } from '../hooks/useForm';
import useStyles from '../hooks/useStyles';
import { Navbar } from './Navbar';
import QrReader from './QrReader';

const initialState = {
  // qr
  branch: '',
  origen: '',
  sampleNumber: '',
  analisis: [],
  // manual
  document: '',
  documentType: 'DNI',
  // fetch
  patientCode: '',
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
  analisis: true,
  document: true,
  patient: false,
  contact: false,
};

const {
  REACT_APP_PATIENT_SERVICE,
  REACT_APP_NEXTLAB_SERVICE,
  REACT_APP_NEXTLAB_TOKEN,
} = process.env;

const xmlParser = new xml2js.Parser({
  explicitArray: false,
  charkey: 'value',
  trim: true,
  normalize: true,
  ignoreAttrs: true,
});

const xmlBuilder = new xml2js.Builder({
  xmldec: { version: '1.0', encoding: 'utf-8' },
});

export default function PatientInfo() {
  const { content, setContent, onChange } = useFormContent(initialState),
    {
      // barcode
      branch,
      origen,
      sampleNumber,
      analisis,
      // manual
      document,
      documentType,
      // fetch patient
      patientCode,
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
  const [accordionState, setAccordionState] = useState(initialAccordionState);
  const [documentTypes, setDocumentTypes] = useState(initialDocumentTypesState);
  const [hasError, setHasError] = useState(false);
  const classes = useStyles();
  const onBloodScan = async ({ rawValue }) => {
    closeScanner();

    try {
      const { Sucursal, Origen, NroMuestra, Analisis, error } = await getQrInfo(
        rawValue,
      );

      if (error) {
        // FIXME: deberia de llevar a una pantalla que indique el error en cuestion y no mostrar nada de la carga del documento
        throw new Error(error.Descripcion);
      }

      setContent((prevState) => ({
        ...prevState,
        branch: Sucursal,
        origen: Origen,
        sampleNumber: NroMuestra,
        analisis: Analisis,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  const [scannerState, setScannerState] = useState({
    ...initialScannerState,
    handleScan: onBloodScan,
  });

  const openDocumentScanner = () => {
    setScannerState({
      open: true,
      title: 'Escanee el código de barras del documento',
      formats: ['pdf417'],
      handleScan: onDocumentScan,
    });
  };

  const onDocumentScan = async ({ rawValue }) => {
    closeScanner();

    const split = rawValue.split('@');
    let document;

    if (split[0].length) document = split[4];
    else document = split[1];

    setContent((prevState) => ({
      ...prevState,
      document,
    }));

    try {
      const { Paciente } = await getPatientInfo(document, documentType);
      onGetPatientInfo(Paciente);
    } catch (error) {
      console.log(error);
    }
  };

  const closeScanner = () => {
    setScannerState((prevState) => ({ ...prevState, open: false }));
  };

  useEffect(() => {
    (async () => {
      setDocumentTypes(await getDocumentTypes());
    })();
  }, []);

  const onGetPatientInfo = (Paciente) => {
    const {
      Codigo: patientCode,
      Nombre: firstName,
      Nombre2: secondName,
      Apellido: firstSurname,
      Apellido2: secondSurname,
      Sexo: gender,
      FechaNac: birthDate,
      Celular: cellPhone,
      Telefono: phone,
      Direccion: address,
    } = Paciente;

    setAccordionState({
      analisis: false,
      document: false,
      patient: true,
      contact: true,
    });

    setContent((prevState) => ({
      ...prevState,
      patientCode,
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
  };

  const handlePatientSubmit = async () => {
    try {
      const { Paciente } = await getPatientInfo(document, documentType);
      onGetPatientInfo(Paciente);
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

  const newOrden = () => {
    setScannerState({
      ...initialScannerState,
      handleScan: onBloodScan,
    });
    setAccordionState(initialAccordionState);
    setContent(initialState);
    setHasError(false);
  };

  const sendOrden = async () => {
    const data = xmlBuilder.buildObject({
      'soap12:Envelope': {
        $: {
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
          'xmlns:soap12': 'http://www.w3.org/2003/05/soap-envelope',
        },
        'soap12:Body': {
          RealizarPedido: {
            $: {
              xmlns: 'http://tempuri.org/',
            },
            token: REACT_APP_NEXTLAB_TOKEN,
            pedido: {
              Sucursal: branch,
              Numero: '105777', // TODO: hardcode
              FechaPedido: new Date().toISOString(),
              FechaEntrega: new Date().toISOString(),
              Origen: { Codigo: origen, Descripcion: 'Ambulatorio' }, // TODO: hardcode
              Urgente: 'N',
              Observacion: observation,
              Paciente: {
                Historia: '',
                TipoDocumento: documentType,
                NumeroDocumento: document,
                Apellido: firstSurname,
                Apellido2: secondSurname,
                Apellido3: '',
                Nombre: firstName,
                Nombre2: secondName,
                Sexo: gender,
                FechaNacimiento: birthDate.toISOString(),
                Observacion: observation,
                Telefono: phone,
                Email: email,
              },
              Direccion: address,
              CodigoPostal: '',
              Provincia: { Codigo: '', Descripcion: '' },
              Ciudad: { Codigo: '', Descripcion: '' },
              Distrito: { Codigo: '', Descripcion: '' },
              Barrio: { Codigo: '', Descripcion: '' },
              Medico: {
                // TODO: hardcode
                Codigo: '00000',
                Matricula: '00000',
                NombreCompleto: 'Medico XXX',
                Especialidad: '',
                Email: '',
              },
              Servicio: { Codigo: 'A', Descripcion: '' }, // TODO: hardcode
              Unidad: { Codigo: '', Descripcion: '' },
              Sala: '',
              Piso: '',
              Cama: '',
              Seguro: {
                // TODO: hardcode
                Codigo: 'OSD',
                Descripcion: 'OSDE',
                CodigoPlan: 'EXE',
                DescripcionPlan: 'EXENTOS',
              },
              FechaReceta: new Date().toISOString(),
              NumeroCarnet: '9518300', // TODO: hardcode
              Diagnosticos: {
                // TODO: hardcode
                ReqDiagnostico: [
                  { Codigo: '412', Descripcion: 'Hipertiroidismo' },
                ],
              },
              Peticiones: { ReqPeticion: [{ Codigo: 'N', Urgente: 'N' }] }, // TODO: hardcode
            },
          },
        },
      },
    });

    try {
      const parsedInfo = await axiosRequest({
        method: 'post',
        url: REACT_APP_NEXTLAB_SERVICE,
        params: { op: 'RealizarPedido' },
        data,
        headers: { 'content-type': 'application/soap+xml; charset=utf-8' },
      });

      const {
        'soap:Envelope': {
          'soap:Body': {
            RealizarPedidoResponse: {
              RealizarPedidoResult: { NumeroOrden, Respuesta },
            },
          },
        },
      } = parsedInfo;

      console.log(NumeroOrden, Respuesta);
    } catch (error) {
      console.log(error);
    }
  };

  const hideOnError = hasError ? classes.hidden : '';

  return (
    <>
      <Navbar />

      <Container>
        <QrReader {...scannerState} handleClose={closeScanner} />
        <div className={classes.displayColumn}>
          <Avatar className={classes.avatar}>
            <LockOutline />
          </Avatar>
          <Typography component="h1" variant="h5">
            Información del paciente
          </Typography>
          {/* <div
            className={`${classes.form} ${classes.displayColumn} ${hideOnError}`}
          >
            <Avatar className={classes.avatar}>
              <Alert fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4">
              ERROR ERROR ERROR
            </Typography>
          </div> */}
          <div className={`${classes.form} ${hideOnError}`}>
            <Accordion
              expanded={accordionState.analisis}
              onChange={() => expandAccordion('analisis')}
            >
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>Analisis</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordion}>
                <List className={classes.accordion}>
                  {analisis.map((item) => (
                    <ListItem
                      divider
                      key={item.CodigoAnalisis}
                      className={classes.accordion}
                    >
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
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>Documento</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordion}>
                <form
                  className={classes.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePatientSubmit();
                  }}
                >
                  <Grid container spacing={2}>
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
                                <BarcodeScan fontSize="large" />
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
                        <Magnify fontSize="large" />
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
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>Paciente</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordion}>
                <form className={classes.form}>
                  <Grid container spacing={2}>
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
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>Contacto</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordion}>
                <form className={classes.form}>
                  <Grid container spacing={2}>
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
          </div>
          <div className={classes.form}>
            <Grid container spacing={2}>
              <Grid item xs={hasError ? 12 : 6}>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  className={classes.button}
                  onClick={newOrden}
                >
                  {hasError ? 'Reintentar' : 'Cancelar'}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={`${classes.button} ${hideOnError}`}
                  onClick={sendOrden}
                >
                  Enviar
                </Button>
              </Grid>
            </Grid>
          </div>
        </div>
      </Container>
    </>
  );
}

async function getDocumentTypes() {
  const parsedInfo = await axiosRequest({
    method: 'post',
    url: `${REACT_APP_PATIENT_SERVICE}/GetTiposDeDocumento`,
    data: qs.stringify({ token: REACT_APP_NEXTLAB_TOKEN }),
  });

  return parsedInfo.ListaTipoDocumento.Lista.TipoDocumento.map((e) => {
    return { id: e.TipoDoc, name: e.Descripcion };
  });
}

async function getPatientInfo(document, documentType) {
  return await axiosRequest({
    method: 'post',
    url: `${REACT_APP_PATIENT_SERVICE}/paciente_datos`,
    data: qs.stringify({
      documento: document,
      tipoDoc: documentType,
      codigo: 0,
      token: REACT_APP_NEXTLAB_TOKEN,
    }),
  });
}

async function getQrInfo(idQr) {
  const parsedInfo = await axiosRequest({
    method: 'post',
    url: `${REACT_APP_PATIENT_SERVICE}/GetQr`,
    data: qs.stringify({ idQr, token: REACT_APP_NEXTLAB_TOKEN }),
  });

  return JSON.parse(parsedInfo.string.value);
}

async function axiosRequest(cfg) {
  // return parsed
  const response = await axios(cfg);

  return await xmlParser.parseStringPromise(response.data);
}
