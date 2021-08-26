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
import { Alert, CreditCardScan, Magnify } from 'mdi-material-ui';
import PropTypes from 'prop-types';
import qs from 'qs';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import xml2js from 'xml2js';
import { useAlert, useAuth } from '../context';
import { useFormContent } from '../hooks/useForm';
import { AccordionHoc, CodeReader, HeaderHoc, ListHoc } from './';

const initialState = {
  // qr
  branch: '',
  protocolName: '',
  sampleNumber: '',
  sampleType: '',
  analisis: [],
  // manual
  documentId: '',
  documentType: 'DNI',
  isReadOnly: false,
  // fetch
  patientCode: '',
  firstName: '',
  secondName: '',
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
  insurance: '',
  plan: '',
  cardNumber: '',
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
  billing: false,
};

const initialViewState = { onMove: 'scanner', current: 'scanner', new: null };

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
  REACT_APP_INSURANCE_TYPE,
  REACT_APP_INSURANCE_SERVICE,
} = process.env;

const xmlParser = new xml2js.Parser({
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

const retrieveNumber = (str) => str.replace(/\D/g, '');

export const PatientInfo = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { openAlert } = useAlert();
  const { content, setContent, setValue, onChange } =
    useFormContent(initialState);
  const [accordionState, setAccordionState] = useState(initialAccordionState);
  const [notificationState, setNotificationState] = useState(
    initialNotificationState,
  );
  const scannerInputRef = useRef(null);

  const [viewState, setViewState] = useState(initialViewState),
    { onMove: movingView, current: currentView } = viewState;

  const onBloodScan = async (rawValue) => {
    closeScanner();

    try {
      const {
        Sucursal,
        NombreProtocolo,
        TipoMuestra,
        NroMuestra,
        Analisis,
        error,
      } = await getQrInfo(rawValue, user.codigo);

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
        sampleType: TipoMuestra,
        analisis: Analisis.map((o) => {
          return { ...o, checked: true };
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
    handleClose: () => history.push('/'),
  });

  const focusPatientAccordion = () => {
    setAccordionState({
      analisis: false,
      document: false,
      patient: true,
      contact: true,
      billing: true,
    });
  };

  const onDocumentScan = async (rawValue) => {
    closeScanner();

    toggleView('form');

    focusPatientAccordion();

    const split = rawValue.split('@');

    let newContent;

    if (split[0].length) {
      const splittedDate = split[6].split('/'),
        splittedName = removeDWS(split[2].trim()).split(' '),
        splittedSurname = removeDWS(split[1].trim()).split(' ');

      newContent = {
        documentId: split[4],
        gender: split[3],
        birthDate: new Date(
          splittedDate[2],
          splittedDate[1] - 1,
          splittedDate[0],
        ),
        firstName: splittedName.shift(),
        secondName: splittedName.join(' '),
        firstSurname: splittedSurname.shift(),
        secondSurname: splittedSurname.join(' '),
      };
    } else {
      const splittedDate = split[7].split('/'),
        splittedName = removeDWS(split[5].trim()).split(' '),
        splittedSurname = removeDWS(split[4].trim()).split(' ');

      newContent = {
        documentId: split[1].trim(),
        gender: split[8],
        birthDate: new Date(
          splittedDate[2],
          splittedDate[1] - 1,
          splittedDate[0],
        ),
        firstName: splittedName.shift(),
        secondName: splittedName.join(' '),
        firstSurname: splittedSurname.shift(),
        secondSurname: splittedSurname.join(' '),
      };
    }

    try {
      const {
        parsedInfo: { patientCode, email, cellPhone, phone, address },
        error,
      } = await getPatientInfo({
        documentId: newContent.documentId,
        documentType: content.documentType,
      });

      if (error.Codigo == '0') {
        newContent = {
          ...newContent,
          patientCode,
          email,
          cellPhone,
          phone,
          address,
        };
      }
    } catch (error) {
      console.log(error);
    }

    setContent((prevState) => ({
      ...prevState,
      ...newContent,
      isReadOnly: true,
    }));
  };

  const openDocumentScanner = () => {
    setScannerState({
      open: true,
      title: 'Escanee el código de barras del documento',
      formats: ['pdf417'],
      handleScan: onDocumentScan,
      handleClose: () => {
        closeScanner();
        toggleView('form');
      },
    });
    toggleView('scanner');
  };

  const closeScanner = () => {
    setScannerState((prevState) => ({
      ...prevState,
      open: false,
    }));
  };

  const handleDocumentSubmit = async () => {
    try {
      const { parsedInfo, error } = await getPatientInfo(content);

      if (error.Codigo == '0') {
        focusPatientAccordion();

        setContent((prevState) => ({
          ...prevState,
          ...parsedInfo,
          isReadOnly: true,
        }));
      } else openAlert(error.Descripcion, 'warning');
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

  const handleSubmitOrder = async () => {
    try {
      const { Respuesta, NumeroOrden } = await sendOrder(content, user.codigo);

      setNotificationState({
        title: Respuesta.Descripcion,
        description: NumeroOrden,
      });
      toggleView('notification');
    } catch (error) {
      openAlert(error.Descripcion, 'error');
    }
  };

  const openNextView = () => {
    setViewState((prevState) => ({
      onMove: prevState.new,
      current: prevState.new,
      new: null,
    }));
  };

  const toggleView = (view) => {
    setViewState((prevState) => {
      if (prevState.current == view) return prevState;

      return {
        ...prevState,
        new: view,
        current: null,
      };
    });
  };

  return (
    <Container>
      <Slide
        appear
        direction="right"
        in={currentView == 'scanner'}
        timeout={transitionTimer}
        onExited={openNextView}
        onEntered={() => {
          if (scannerInputRef.current) scannerInputRef.current.focus();
        }}
      >
        <Box>
          <Box
            data-testid="scanner"
            display={movingView == 'scanner' ? 'block' : 'none'}
            mt={1}
          >
            <CodeReader ref={scannerInputRef} {...scannerState} />
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
            display={movingView == 'notification' ? '' : 'none'}
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
            <Box clone mt={3}>
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="secondary"
                onClick={newOrden}
              >
                Nueva orden
              </Button>
            </Box>
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
            display={movingView == 'form' ? 'flex' : 'none'}
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
                  handleSubmit={handleDocumentSubmit}
                  setValue={setValue}
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

              <AccordionHoc
                title="Facturación"
                expanded={accordionState.billing}
                onChange={() => expandAccordion('billing')}
              >
                <BillingForm
                  content={content}
                  onChange={onChange}
                  setContent={setContent}
                />
              </AccordionHoc>
            </Box>
            <Box width="100%" mt={3}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={newOrden}
                  >
                    Cancelar
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitOrder}
                  >
                    Enviar
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Container>
  );
};

async function getPatientInfo(content) {
  const { documentId, documentType } = content;

  const { Paciente } = await axiosRequest({
    method: 'post',
    url: `${REACT_APP_PATIENT_SERVICE}/paciente_datos`,
    data: qs.stringify({
      token: REACT_APP_NEXTLAB_TOKEN,
      codigo: 0,
      tipoDoc: documentType,
      documento: documentId,
      nombre: '',
      apellido: '',
      sexo: '',
      fecha_nacimiento: '',
    }),
  });

  const {
    Codigo: patientCode,
    Nombre: firstName,
    Nombre2: secondName,
    Apellido: firstSurname,
    Apellido2: secondSurname,
    Sexo: gender,
    FechaNac: birthDate,
    Email: email,
    Celular: cellPhone,
    Telefono: phone,
    Direccion: address,
    Error: error,
  } = Paciente;

  return {
    parsedInfo: {
      patientCode,
      firstName,
      secondName,
      firstSurname,
      secondSurname,
      gender,
      birthDate: new Date(birthDate),
      email,
      cellPhone: cellPhone ? retrieveNumber(cellPhone) : '',
      phone: phone ? retrieveNumber(phone) : '',
      address,
      error,
    },
    error,
  };
}

async function sendOrder(content, ogirinCode) {
  const {
    // barcode
    branch,
    sampleNumber,
    sampleType,
    analisis,
    // manual
    documentId,
    documentType,
    // patient
    firstName,
    secondName,
    firstSurname,
    secondSurname,
    birthDate,
    gender,
    // contact
    email,
    cellPhone,
    phone,
    address,
    observation,
    passport,
  } = content;

  const { Paciente } = await axiosRequest({
    method: 'post',
    url: `${REACT_APP_PATIENT_SERVICE}/paciente_datos_update`,
    data: qs.stringify({
      token: REACT_APP_NEXTLAB_TOKEN,
      codigo: 0,
      tipoDoc: documentType,
      documento: documentId,
      apellido: firstSurname,
      apellido2: secondSurname,
      nombre: firstName,
      nombre2: secondName,
      sexo: gender,
      fecha_nacimiento: birthDate.toISOString(),
      pasaporte: passport,
      email,
      celular: cellPhone,
      telefono: phone,
      direccion: address,
    }),
  });

  if (Paciente.Error.Codigo != '0') throw new Error(Paciente.Error);

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
            Origen: { Codigo: ogirinCode, Descripcion: '' },
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
            Muestras: [
              {
                ReqMuestra: {
                  TipoMuestra: sampleType,
                  NroMuestra: sampleNumber,
                },
              },
            ],
          },
        },
      },
    },
  });

  const {
    'soap:Envelope': {
      'soap:Body': {
        RealizarPedidoResponse: {
          RealizarPedidoResult: { NumeroOrden, Respuesta },
        },
      },
    },
  } = await axiosRequest({
    method: 'post',
    url: REACT_APP_NEXTLAB_SERVICE,
    params: { op: 'RealizarPedido' },
    data,
    headers: { 'content-type': 'application/soap+xml; charset=utf-8' },
  });

  return { Respuesta, NumeroOrden };
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

  return parsedInfo.ListaTipoDocumento.Lista[0].TipoDocumento.map((e) => ({
    id: e.TipoDoc[0],
    name: e.Descripcion[0],
  }));
}

async function getInsuranceTypes() {
  const parsedInfo = await axiosRequest({
    method: 'post',
    url: `${REACT_APP_INSURANCE_SERVICE}/segurosPorTipoSeguro`,
    data: qs.stringify({
      token: REACT_APP_NEXTLAB_TOKEN,
      tipoSeguros: REACT_APP_INSURANCE_TYPE,
    }),
  });

  return parsedInfo.ListaSeguros.Lista[0].SeguroPlan.map((e) => ({
    id: e.Codigo[0],
    name: e.Descripcion[0],
    plans: e.Planes[0].Plan.map((p) => ({
      id: p.Codigo[0],
      name: p.Descripcion[0],
    })),
  }));
}

async function axiosRequest(cfg) {
  // return parsed
  const response = await axios(cfg);

  return await xmlParser.parseStringPromise(response.data);
}

const initialDocumentTypesState = [{ id: 'DNI', name: 'Doc. Nac. Identidad' }];

function DocumentForm({
  handleSubmit,
  onChange,
  content,
  openScanner,
  setValue,
}) {
  const { documentType, documentId, isReadOnly: readOnly } = content;
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
              onChange={(e) => {
                setValue('documentId', '');
                onChange(e);
              }}
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
                readOnly,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      color="primary"
                      disabled={!['DNI'].includes(documentType)}
                      onClick={openScanner}
                    >
                      <CreditCardScan fontSize="large" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item container xs={2} direction="row" alignItems="center">
            <IconButton
              disabled={!documentId}
              color="primary"
              type="submit"
              edge="start"
            >
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
  setValue: PropTypes.func.isRequired,
};

function ContactForm({ content, onChange }) {
  const { email, cellPhone, phone, address, observation } = content;

  return (
    <Box clone width="100%">
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              type="email"
              variant="outlined"
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
              type="tel"
              variant="outlined"
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
              type="tel"
              variant="outlined"
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

function PatientForm({ content, onChange }) {
  const {
    firstName,
    secondName,
    firstSurname,
    secondSurname,
    birthDate,
    gender,
    passport,
    isReadOnly: readOnly,
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
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              variant="outlined"
              fullWidth
              name="secondName"
              label="Segundo nombre"
              id="secondName"
              value={secondName}
              onChange={onChange}
              InputProps={{ readOnly }}
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
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              variant="outlined"
              fullWidth
              name="secondSurname"
              label="Segundo apellido"
              id="secondSurname"
              value={secondSurname}
              onChange={onChange}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <KeyboardDatePicker
              variant="inline"
              autoOk
              inputVariant="outlined"
              fullWidth
              required
              disableFuture
              format="dd/MM/yyyy"
              id="birthDate"
              label="Fecha de nacimiento"
              KeyboardButtonProps={{ color: 'primary' }}
              value={birthDate}
              InputProps={{ readOnly }}
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
              required
              value={gender}
              onChange={onChange}
              select
              InputProps={{ readOnly }}
            >
              <MenuItem value={'M'}>Masculino</MenuItem>
              <MenuItem value={'F'}>Femenino</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              variant="outlined"
              fullWidth
              name="passport"
              label="Pasaporte"
              id="passport"
              value={passport}
              onChange={onChange}
            />
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

function BillingForm({ content, onChange, setContent }) {
  const { insurance, plan, cardNumber } = content;
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [planTypes, setPlanTypes] = useState([]);

  useEffect(() => {
    (async () => {
      setInsuranceTypes(await getInsuranceTypes());
    })();
  }, []);

  const onInsuranceChange = (e) => {
    setContent((prevState) => ({ ...prevState, insurance: e.id, plan: '' }));
    setPlanTypes(e.plans);
  };

  return (
    <Box clone width="100%">
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              fullWidth
              name="insurance"
              label="Seguro"
              id="insurance"
              select
              value={insurance}
            >
              {insuranceTypes.map((e) => (
                <MenuItem
                  key={e.id}
                  value={e.id}
                  onClick={() => onInsuranceChange(e)}
                >
                  {e.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              fullWidth
              name="plan"
              label="Plan"
              id="plan"
              select
              value={plan}
              onChange={onChange}
            >
              {planTypes.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              variant="outlined"
              fullWidth
              name="cardNumber"
              label="Número de carnet"
              id="cardNumber"
              value={cardNumber}
              onChange={onChange}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
BillingForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  setContent: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
};
