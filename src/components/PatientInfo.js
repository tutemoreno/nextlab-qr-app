import axios from 'axios';
import { Alert, CreditCardScan, Delete, Magnify } from 'mdi-material-ui';
import PropTypes from 'prop-types';
import qs from 'qs';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import xml2js from 'xml2js';
import { useAlert, useAuth } from '../context';
import {
  AccordionHoc,
  Box,
  Button,
  CodeReader,
  Container,
  Grid,
  Grow,
  HeaderHoc,
  IconButton,
  InputAdornment,
  KeyboardDatePicker,
  ListHoc,
  MenuItem,
  Paper,
  Slide,
  TextField,
  Typography,
} from './';

const initialState = {
  // qr
  branch: '',
  protocolName: '',
  sampleNumber: '',
  sampleType: '',
  analisis: [],
  // manual
  documentId: '',
  documentType: 'CI',
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
  lastInsurance: '',
  lastPlan: '',
  lastCardNumber: '',
};

const initialScannerState = {
  isOpen: true,
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
  const [state, setState] = useState(initialState);
  const [accordionState, setAccordionState] = useState(initialAccordionState);
  const [isValidForm, setIsValidForm] = useState(true);

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
      } else {
        setState((prevState) => ({
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
      }
    } catch ({ message, type }) {
      openAlert(message, type || 'error');
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
          Date.UTC(splittedDate[2], splittedDate[1] - 1, splittedDate[0]),
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
          Date.UTC(splittedDate[2], splittedDate[1] - 1, splittedDate[0]),
        ),
        firstName: splittedName.shift(),
        secondName: splittedName.join(' '),
        firstSurname: splittedSurname.shift(),
        secondSurname: splittedSurname.join(' '),
      };
    }

    try {
      const {
        parsedInfo: {
          patientCode,
          email,
          cellPhone,
          phone,
          address,
          lastInsurance,
          lastPlan,
          lastCardNumber,
        },
      } = await getPatientInfo({
        documentId: newContent.documentId,
        documentType: state.documentType,
      });

      newContent = {
        ...newContent,
        patientCode,
        email,
        cellPhone,
        phone,
        address,
        lastInsurance,
        lastPlan,
        lastCardNumber,
      };
    } catch ({ message, type }) {
      openAlert(message, type || 'error');
    }

    setState((prevState) => ({
      ...prevState,
      ...newContent,
      isReadOnly: true,
    }));
  };

  const openDocumentScanner = () => {
    setScannerState({
      isOpen: true,
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
      isOpen: false,
    }));
  };

  const handleDocumentSubmit = async () => {
    const { isReadOnly } = state;
    if (isReadOnly) {
      setState(
        ({ branch, sampleNumber, sampleType, analisis, protocolName }) => ({
          ...initialState,
          branch,
          sampleNumber,
          sampleType,
          analisis,
          protocolName,
        }),
      );
    } else {
      try {
        const { parsedInfo } = await getPatientInfo(state);

        focusPatientAccordion();

        setState((prevState) => ({
          ...prevState,
          ...parsedInfo,
          isReadOnly: true,
        }));
      } catch ({ message, type }) {
        openAlert(message, type || 'error');
      }
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
      handleClose: () => history.push('/'),
    });
    setState(initialState);
    setAccordionState(initialAccordionState);
    toggleView('scanner');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const isDocumentFormValid = document
      .querySelector('#documentForm')
      .checkValidity();
    const isPatientFormValid = document
      .querySelector('#patientForm')
      .checkValidity();
    const isContactFormValid = document
      .querySelector('#contactForm')
      .checkValidity();
    const isBillingFormValid = document
      .querySelector('#billingForm')
      .checkValidity();

    if (
      isDocumentFormValid &&
      isPatientFormValid &&
      isContactFormValid &&
      isBillingFormValid
    ) {
      try {
        const { orderNumber, response } = await sendOrder(state, user.codigo);

        setNotificationState({
          title: response.Descripcion[0],
          description: orderNumber,
        });
        toggleView('notification');
      } catch ({ message, type }) {
        openAlert(message, type || 'error');
      }
    } else {
      setAccordionState({
        document: !isDocumentFormValid,
        patient: !isPatientFormValid,
        contact: !isContactFormValid,
        analisis: false,
        billing: !isBillingFormValid,
      });
      setIsValidForm(false);
    }
  };

  useEffect(() => {
    if (!isValidForm) {
      document.querySelector('#documentForm').reportValidity();
      document.querySelector('#patientForm').reportValidity();
      document.querySelector('#contactForm').reportValidity();
      document.querySelector('#billingForm').reportValidity();

      setIsValidForm(true);
    }
  }, [isValidForm]);

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
              <Button type="button" color="secondary" onClick={newOrden}>
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
                  state={state}
                  openScanner={openDocumentScanner}
                  handleSubmit={handleDocumentSubmit}
                  setState={setState}
                />
              </AccordionHoc>

              <AccordionHoc
                title="Paciente"
                expanded={accordionState.patient}
                onChange={() => expandAccordion('patient')}
                square
              >
                <PatientForm state={state} setState={setState} />
              </AccordionHoc>

              <AccordionHoc
                title="Contacto"
                expanded={accordionState.contact}
                onChange={() => expandAccordion('contact')}
              >
                <ContactForm state={state} setState={setState} />
              </AccordionHoc>

              <AccordionHoc
                title="Analisis"
                expanded={accordionState.analisis}
                onChange={() => expandAccordion('analisis')}
              >
                <Box width="100%" display="flex" flexDirection="column">
                  <Typography>{state.protocolName}</Typography>
                  <Typography>{state.sampleNumber}</Typography>
                  <ListHoc
                    items={state.analisis}
                    setItems={(analisis) =>
                      setState((prevState) => ({ ...prevState, analisis }))
                    }
                  />
                </Box>
              </AccordionHoc>

              <AccordionHoc
                title="Facturación"
                expanded={accordionState.billing}
                onChange={() => expandAccordion('billing')}
              >
                <BillingForm state={state} setState={setState} />
              </AccordionHoc>
            </Box>
            <Box width="100%" mt={3}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button type="button" color="secondary" onClick={newOrden}>
                    Cancelar
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    form="orderForm"
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

async function getPatientInfo({ documentId, documentType }) {
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

  if (Paciente.Error[0].Codigo[0] != '0')
    throw { message: Paciente.Error[0].Descripcion[0] };

  const {
    Codigo: [patientCode],
    Nombre: [firstName],
    Nombre2: [secondName],
    Apellido: [firstSurname],
    Apellido2: [secondSurname],
    Sexo: [gender],
    FechaNac: [birthDate],
    Email: [email],
    Celular: [cellPhone],
    Telefono: [phone],
    Direccion: [address],
    UltimoSeguro: [lastInsurance],
    UltimoPlan: [lastPlan],
    UltimoCarnet: [lastCardNumber],
  } = Paciente;

  const splittedDate = birthDate.split('T')[0].split('-');

  return {
    parsedInfo: {
      patientCode,
      firstName,
      secondName,
      firstSurname,
      secondSurname,
      gender,
      birthDate: new Date(
        Date.UTC(splittedDate[0], splittedDate[1] - 1, splittedDate[2]),
      ),
      email,
      cellPhone: cellPhone ? retrieveNumber(cellPhone) : '',
      phone: phone ? retrieveNumber(phone) : '',
      address,
      lastInsurance,
      lastPlan,
      lastCardNumber,
    },
  };
}

async function sendOrder(state, ogirinCode) {
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
    cardNumber,
    insurance,
    plan,
  } = state;

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

  if (Paciente.Error[0].Codigo[0] != '0')
    throw { message: Paciente.Error[0].Descripcion[0] };

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
              Codigo: insurance,
              Descripcion: '',
              CodigoPlan: plan,
              DescripcionPlan: '',
            },
            FechaReceta: new Date().toISOString(),
            NumeroCarnet: cardNumber,
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
      'soap:Body': [
        {
          RealizarPedidoResponse: [
            {
              RealizarPedidoResult: [
                {
                  NumeroOrden: [orderNumber],
                  Respuesta: [response],
                },
              ],
            },
          ],
        },
      ],
    },
  } = await axiosRequest({
    method: 'post',
    url: REACT_APP_NEXTLAB_SERVICE,
    params: { op: 'RealizarPedido' },
    data,
    headers: { 'content-type': 'application/soap+xml; charset=utf-8' },
  });

  return { orderNumber, response };
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
      cardRequired: p.RequiereCarnet[0],
    })),
  }));
}

async function axiosRequest(cfg) {
  // return parsed
  const response = await axios(cfg);

  return await xmlParser.parseStringPromise(response.data);
}

const initialDocumentTypesState = [{ id: 'CI', name: 'Cédula' }];

function DocumentForm({ state, setState, handleSubmit, openScanner }) {
  const { documentType, documentId, isReadOnly: readOnly } = state;
  const [documentTypes, setDocumentTypes] = useState(initialDocumentTypesState);

  useEffect(() => {
    (async () => {
      setDocumentTypes(await getDocumentTypes());
    })();
  }, []);

  return (
    <Box clone width="100%">
      <form
        id="documentForm"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Tipo de documento"
              name="documentType"
              value={documentType}
              onChange={(e) => {
                setState((prevState) => ({
                  ...prevState,
                  documentId: '',
                  documentType: e.target.value,
                }));
              }}
              select
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
              required
              name="documentId"
              label="Documento"
              value={documentId}
              setState={setState}
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
          <IconButton disabled={!documentId} color="primary" type="submit">
            {readOnly ? (
              <Delete fontSize="large" />
            ) : (
              <Magnify fontSize="large" />
            )}
          </IconButton>
        </Grid>
      </form>
    </Box>
  );
}
DocumentForm.propTypes = {
  openScanner: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  setState: PropTypes.func.isRequired,
};

function ContactForm({ state, setState }) {
  const { email, cellPhone, phone, address, observation } = state;

  return (
    <Box clone width="100%">
      <form id="contactForm">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              name="email"
              label="Email"
              required
              value={email}
              setState={setState}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="tel"
              name="cellPhone"
              label="Celular"
              value={cellPhone}
              setState={setState}
              required={!cellPhone && !phone}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="tel"
              name="phone"
              label="Teléfono fijo"
              value={phone}
              setState={setState}
              required={!cellPhone && !phone}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              name="address"
              label="Dirección"
              value={address}
              setState={setState}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="text"
              multiline
              rows={4}
              name="observation"
              label="Observaciones"
              value={observation}
              setState={setState}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
ContactForm.propTypes = {
  setState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

function PatientForm({ state, setState }) {
  const {
    firstName,
    secondName,
    firstSurname,
    secondSurname,
    birthDate,
    gender,
    passport,
    isReadOnly: readOnly,
  } = state;

  return (
    <Box clone width="100%">
      <form id="patientForm">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              required
              name="firstName"
              label="Primer nombre"
              value={firstName}
              setState={setState}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              name="secondName"
              label="Segundo nombre"
              value={secondName}
              setState={setState}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              required
              name="firstSurname"
              label="Primer apellido"
              value={firstSurname}
              setState={setState}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              name="secondSurname"
              label="Segundo apellido"
              value={secondSurname}
              setState={setState}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <KeyboardDatePicker
              autoOk
              required
              disableFuture
              name="birthDate"
              label="Fecha de nacimiento"
              KeyboardButtonProps={{ color: 'primary', disabled: readOnly }}
              value={birthDate}
              InputProps={{ readOnly }}
              setState={setState}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Género"
              name="gender"
              required
              value={gender}
              setState={setState}
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
              name="passport"
              label="Pasaporte"
              value={passport}
              setState={setState}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
PatientForm.propTypes = {
  setState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

function BillingForm({ state, setState }) {
  const {
    insurance,
    plan,
    cardNumber,
    lastInsurance,
    lastPlan,
    lastCardNumber,
  } = state;

  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [planTypes, setPlanTypes] = useState([]);
  const [cardRequired, setCardRequired] = useState(false);

  useEffect(() => {
    (async () => {
      const insurances = await getInsuranceTypes();
      const insuranceFound = insurances.find((i) => i.id === lastInsurance); //lastInsurance

      setInsuranceTypes(insurances);

      if (insuranceFound) {
        setPlanTypes(insuranceFound.plans);
        setState((prevState) => ({
          ...prevState,
          insurance: lastInsurance,
          plan: lastPlan,
          cardNumber: lastCardNumber,
        }));
      }
    })();
  }, [lastInsurance]);

  const onInsuranceChange = (insurance) => {
    const plan =
      insurance.plans.length == 1
        ? insurance.plans[0]
        : { id: '', cardRequired: false };

    setState((prevState) => ({
      ...prevState,
      insurance: insurance.id,
    }));

    setPlanTypes(insurance.plans);

    setPlan(plan);
  };

  const setPlan = (plan) => {
    setState((prevState) => ({
      ...prevState,
      plan: plan.id,
    }));

    setCardRequired(plan.cardRequired == 'true');
  };

  return (
    <Box clone width="100%">
      <form id="billingForm">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="insurance"
              label="Seguro"
              select
              required
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
            <TextField name="plan" label="Plan" select required value={plan}>
              {planTypes.map((e) => (
                <MenuItem key={e.id} value={e.id} onClick={() => setPlan(e)}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              required={cardRequired}
              name="cardNumber"
              label="Número de carnet"
              value={cardNumber}
              setState={setState}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
BillingForm.propTypes = {
  setState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};
