import {
  Box,
  Button,
  Container,
  Grid,
  Grow,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Slide,
  TextField,
  Typography,
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import axios from 'axios';
import { Alert, BarcodeScan, Magnify } from 'mdi-material-ui';
import PropTypes from 'prop-types';
import qs from 'qs';
import React, { useEffect, useState } from 'react';
import xml2js from 'xml2js';
import { useAuth } from '../context/auth';
import { useFormContent } from '../hooks/useForm';
import AccordionHoc from './AccordionHoc';
import HeaderHoc from './HeaderHoc';
import ListHoc from './ListHoc';
import QrReader from './QrReader';

const initialState = {
  // qr
  branch: '',
  protocolName: '',
  sampleNumber: '',
  analisis: [],
  // manual
  documentId: '',
  documentType: 'DNI',
  // fetch
  patientCode: '',
  firstName: '',
  secondName: '',
  lastName: '',
  firstSurname: '',
  secondSurname: '',
  gender: '',
  passport: '',
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
};

const initialAccordionState = {
  analisis: true,
  document: true,
  patient: false,
  contact: false,
};

const initialButtonResetState = {
  label: 'Cancelar',
  cols: 6,
};

const initialViewState = { old: 'scanner', current: 'scanner', new: null };

const transitionTimer = 500;

const initialNotificationState = {
  title: '',
  description: '',
};

const {
  REACT_APP_PATIENT_SERVICE,
  REACT_APP_NEXTLAB_SERVICE,
  REACT_APP_NEXTLAB_TOKEN,
  REACT_APP_MEDICO,
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

// remueve espacios en blanco duplicados
const removeDWS = (str) => str.replace(/\s+/g, ' ');

export default function PatientInfo() {
  const { user } = useAuth();
  const { content, setContent, setValue, onChange } =
    useFormContent(initialState);
  const [accordionState, setAccordionState] = useState(initialAccordionState);
  const [notificationState, setNotificationState] = useState(
    initialNotificationState,
  );
  const [{ old: oldView, current: currentView }, setViewState] =
    useState(initialViewState);

  const onBloodScan = async (rawValue) => {
    closeScanner();
    try {
      const { Sucursal, NombreProtocolo, NroMuestra, Analisis, error } =
        await getQrInfo(rawValue, user.username);

      if (error) {
        setNotificationState({
          title: 'No se pudo escanear la muestra',
          description: error.Descripcion,
        });
        toggleView('notification');

        throw new Error(error.Descripcion);
      }

      setContent((prevState) => ({
        ...prevState,
        branch: Sucursal,
        sampleNumber: NroMuestra,
        analisis: Analisis.map((e) => {
          return { ...e, checked: true };
        }),
        protocolName: NombreProtocolo,
      }));
      toggleView('form');
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
      showClose: true,
    });
    toggleView('scanner');
  };

  const onDocumentScan = async (rawValue) => {
    const { documentType } = content;
    closeScanner();

    const split = rawValue.split('@');
    let parsedInfo;

    if (split[0].length) {
      const splittedDate = split[6].split('/');

      parsedInfo = {
        documentId: split[4],
        documentType,
        gender: split[3],
        birthDate: new Date(
          Date.UTC(splittedDate[2], splittedDate[1] - 1, splittedDate[0]),
        ),
        name: removeDWS(split[2]),
        surname: removeDWS(split[1]),
        passport: '',
      };
    } else {
      parsedInfo = { documentId: split[1] };
    }

    try {
      const { Paciente } = await getPatientInfo(parsedInfo);
      onGetPatientInfo(Paciente);
    } catch (error) {
      console.log(error);
    }
  };

  const closeScanner = () => {
    setScannerState((prevState) => ({
      ...prevState,
      open: false,
    }));
  };

  const onGetPatientInfo = (Paciente) => {
    const {
      Codigo: patientCode,
      Documento: documentId,
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
      documentId,
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

    toggleView('form');
  };

  const handlePatientSubmit = async () => {
    try {
      const { Paciente } = await getPatientInfo(content);
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
    setContent(initialState);
    setAccordionState(initialAccordionState);
    toggleView('scanner');
  };

  const sendOrden = async () => {
    const {
      // barcode
      branch,
      analisis,
      // manual
      documentId,
      documentType,
      // fetch patient
      firstName,
      secondName,
      firstSurname,
      secondSurname,
      birthDate,
      gender,
      email,
      phone,
      address,
      observation,
    } = content;
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
              Numero: '',
              FechaPedido: new Date().toISOString(),
              FechaEntrega: new Date().toISOString(),
              Origen: { Codigo: user.username, Descripcion: '' },
              Urgente: 'N',
              Observacion: observation,
              Paciente: {
                Historia: '',
                TipoDocumento: documentType,
                NumeroDocumento: documentId,
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
                Codigo: REACT_APP_MEDICO,
                Matricula: '',
                NombreCompleto: '',
                Especialidad: '',
                Email: '',
              },
              Servicio: {},
              Unidad: { Codigo: '', Descripcion: '' },
              Sala: '',
              Piso: '',
              Cama: '',
              Seguro: {
                Codigo: 'C0163', // TODO: traer del origen
                Descripcion: '',
                CodigoPlan: 'LAB', // TODO: traer del origen
                DescripcionPlan: '',
              },
              FechaReceta: new Date().toISOString(),
              NumeroCarnet: '',
              Diagnosticos: {
                ReqDiagnostico: [],
              },
              Peticiones: [
                analisis
                  .filter((e) => Boolean(e.checked))
                  .map((e) => ({
                    ReqPeticion: {
                      Codigo: e.CodigoAnalisis,
                      Urgente: 'N',
                    },
                  })),
              ],
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

      setNotificationState({
        title: Respuesta.Descripcion,
        description: NumeroOrden,
      });
      toggleView('notification');
    } catch (error) {
      console.log(error);
    }
  };

  const openNextView = () => {
    setViewState((prevState) => ({
      old: prevState.new,
      current: prevState.new,
      new: null,
    }));
  };

  const toggleView = (view) => {
    setViewState((prevState) => ({
      ...prevState,
      new: view,
      current: null,
    }));
  };

  return (
    <Container>
      <Slide
        appear
        direction="right"
        in={currentView == 'scanner'}
        timeout={transitionTimer}
        onExited={openNextView}
      >
        <Box>
          <Box
            data-testid="scanner"
            clone
            display={oldView == 'scanner' ? 'block' : 'none'}
            mt={1}
          >
            <Paper elevation={24}>
              <QrReader
                {...scannerState}
                handleClose={() => {
                  closeScanner();
                  toggleView('form');
                }}
              />
            </Paper>
          </Box>
        </Box>
      </Slide>

      <Grow
        appear
        in={currentView == 'notification'}
        timeout={transitionTimer}
        onExited={openNextView}
      >
        <Box>
          <Box
            data-testid="notification"
            mt={1}
            display={oldView == 'notification' ? '' : 'none'}
          >
            <Paper elevation={24}>
              <HeaderHoc
                title={notificationState.title}
                icon={<Alert fontSize="large" />}
              />
              <Box clone display="flex" justifyContent="center" p={2}>
                <Typography variant="h3">
                  {notificationState.description}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Grow>

      <Slide
        appear
        direction="left"
        in={currentView == 'form'}
        timeout={transitionTimer}
        onExited={openNextView}
      >
        <Box>
          <Box
            data-testid="form"
            display={oldView == 'form' ? 'flex' : 'none'}
            flexDirection="column"
            alignItems="center"
            mt={1}
          >
            <HeaderHoc title="Información del paciente" />

            <Box mt={1}>
              <AccordionHoc
                title="Documento"
                expanded={accordionState.document}
                onChange={() => expandAccordion('document')}
              >
                <DocumentForm
                  content={content}
                  onChange={onChange}
                  openScanner={openDocumentScanner}
                  handleSubmit={handlePatientSubmit}
                />
              </AccordionHoc>

              <AccordionHoc
                title="Paciente"
                expanded={accordionState.patient}
                onChange={() => expandAccordion('patient')}
              >
                <PatientForm content={content} onChange={onChange} />
              </AccordionHoc>

              <AccordionHoc
                title="Contacto"
                expanded={accordionState.contact}
                onChange={() => expandAccordion('contact')}
              >
                <ContactForm content={content} onChange={onChange} />
              </AccordionHoc>

              <AccordionHoc
                title="Analisis"
                expanded={accordionState.analisis}
                onChange={() => expandAccordion('analisis')}
              >
                <Box width="100%" display="flex" flexDirection="column">
                  <Typography>{content.protocolName}</Typography>
                  <Typography>{content.sampleNumber}</Typography>
                  <ListHoc
                    items={content.analisis}
                    setItems={(arr) => setValue('analisis', arr)}
                  />
                </Box>
              </AccordionHoc>
            </Box>
          </Box>
        </Box>
      </Slide>

      <ButtonsFooter
        show={currentView != 'scanner'}
        handleSubmit={sendOrden}
        handleReset={newOrden}
        notification={currentView == 'notification'}
      />
    </Container>
  );
}

async function getPatientInfo(content) {
  const {
    documentId,
    documentType,
    gender,
    birthDate,
    name,
    surname,
    passport,
  } = content;

  return await axiosRequest({
    method: 'post',
    url: `${REACT_APP_PATIENT_SERVICE}/paciente_datos_update`,
    data: qs.stringify({
      token: REACT_APP_NEXTLAB_TOKEN,
      codigo: 0,
      tipoDoc: documentType,
      documento: documentId,
      apellido: surname,
      nombre: name,
      sexo: gender,
      fecha_nacimiento: birthDate.toISOString(),
      pasaporte: passport,
    }),
  });
}

async function getQrInfo(idQr, codOri) {
  const parsedInfo = await axiosRequest({
    method: 'post',
    url: `${REACT_APP_PATIENT_SERVICE}/GetQr`,
    data: qs.stringify({ token: REACT_APP_NEXTLAB_TOKEN, idQr, codOri }),
  });

  return JSON.parse(parsedInfo.string);
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

async function axiosRequest(cfg) {
  // return parsed
  const response = await axios(cfg);

  return await xmlParser.parseStringPromise(response.data);
}

const initialDocumentTypesState = [{ id: 'DNI', name: 'Doc. Nac. Identidad' }];

function DocumentForm(props) {
  const { handleSubmit, onChange, content, openScanner } = props;
  const { documentType, documentId } = content;
  const [documentTypes, setDocumentTypes] = useState(initialDocumentTypesState);

  useEffect(() => {
    (async () => {
      setDocumentTypes(await getDocumentTypes());
    })();
  }, []);

  return (
    <Box clone width="100%">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
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
              name="documentId"
              label="Documento"
              id="documentId"
              value={documentId}
              onChange={onChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={openScanner}>
                      <BarcodeScan fontSize="large" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item container xs={2} direction="row" alignItems="center">
            <IconButton type="submit" style={{ padding: '0px' }}>
              <Magnify fontSize="large" />
            </IconButton>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
DocumentForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  openScanner: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
};

function ContactForm(props) {
  const { content, onChange } = props;
  const { email, cellPhone, phone, address, observation } = content;

  return (
    <Box clone width="100%">
      <form>
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
    </Box>
  );
}
ContactForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
};

function PatientForm(props) {
  const { content, onChange } = props;
  const {
    firstName,
    secondName,
    firstSurname,
    secondSurname,
    birthDate,
    gender,
  } = content;

  return (
    <Box clone width="100%">
      <form>
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
    </Box>
  );
}
PatientForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
};

function ButtonsFooter(props) {
  const { show, notification, handleReset, handleSubmit } = props;
  const [buttonResetState, setButtonResetState] = useState(
    initialButtonResetState,
  );

  useEffect(() => {
    if (notification) setButtonResetState({ label: 'Nueva orden', cols: 12 });
    else setButtonResetState(initialButtonResetState);
  }, [notification]);

  return (
    <Box display={show ? '' : 'none'} width="100%" mt={3}>
      <Grid container spacing={2}>
        <Grid item xs={buttonResetState.cols}>
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleReset}
          >
            {buttonResetState.label}
          </Button>
        </Grid>
        <Box clone display={notification ? 'none' : ''}>
          <Grid item xs={6}>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Enviar
            </Button>
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
}
ButtonsFooter.propTypes = {
  handleReset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  notification: PropTypes.bool.isRequired,
  show: PropTypes.bool.isRequired,
};
