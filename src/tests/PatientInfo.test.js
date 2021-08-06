import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import PatientInfo from '../components/PatientInfo';
import { fireEvent, render, screen, waitFor } from './test-utils';

const getDocumentTypesXML =
  '<?xml version="1.0" encoding="utf-8"?><ListaTipoDocumento xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://192.168.10.54:4110/Paciente_WS/"><Lista><TipoDocumento><TipoDoc>BOL</TipoDoc><Descripcion>Boliviano</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>BRA</TipoDoc><Descripcion>Brasilero</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>CHI</TipoDoc><Descripcion>Chileno</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>CI </TipoDoc><Descripcion>Cédula</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>COL</TipoDoc><Descripcion>Colombiano</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>DNI</TipoDoc><Descripcion>Doc. Nac. Identidad</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>DNU</TipoDoc><Descripcion>Doc. Nac. Único</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>LC </TipoDoc><Descripcion>Lib. Cívica</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>LE </TipoDoc><Descripcion>Lib. Enrolamiento</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>NN </TipoDoc><Descripcion>No identificado</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>PAR</TipoDoc><Descripcion>Paraguayo</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>PAS</TipoDoc><Descripcion>Pasaporte</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>PER</TipoDoc><Descripcion>Peruano</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>RN </TipoDoc><Descripcion>Recien Nacido</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>URU</TipoDoc><Descripcion>Uruguayo</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>VEN</TipoDoc><Descripcion>Venezolano</Descripcion></TipoDocumento><TipoDocumento><TipoDoc>VET</TipoDoc><Descripcion>Veterinario</Descripcion></TipoDocumento></Lista><Error><Codigo>0</Codigo><Descripcion /></Error></ListaTipoDocumento>';

jest.mock('axios');

describe('PatientInfo', () => {
  beforeEach(() => {
    jest
      .spyOn(window.localStorage.__proto__, 'getItem')
      .mockImplementation((key) => {
        return key == process.env.REACT_APP_STORE_PATH
          ? '{"username":"AMB","isValid":true}'
          : null;
      });

    jest.spyOn(axios, 'default').mockImplementation((call) => {
      const { method, url } = call;
      const split = url.split('/');

      return new Promise((resolve) => {
        switch (method) {
          case 'post':
            switch (split[1]) {
              case 'GetTiposDeDocumento':
                resolve({
                  status: 200,
                  data: getDocumentTypesXML,
                });
                break;

              case 'GetQr':
                resolve({
                  status: 200,
                  data: '<?xml version="1.0" encoding="utf-8"?><Usuario xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://192.168.10.54:4110/Usuario_WS/"><EsValido>false</EsValido><Error><Codigo>0</Codigo><Descripcion /></Error></Usuario>',
                });
                break;
            }
            break;
          case 'get':
            break;
        }

        resolve({ status: 400 });
      });
    });
  });

  it('view', async () => {
    render(<PatientInfo />);

    const scanner = screen.getByTestId('scanner');
    const notification = screen.getByTestId('notification');
    const form = screen.getByTestId('form');

    expect(scanner).toBeVisible();
    expect(notification).not.toBeVisible();
    expect(form).not.toBeVisible();

    await waitFor(() =>
      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: 'Paciente_WS.asmx/GetTiposDeDocumento',
        data: 'token=nlsvctok',
      }),
    );
  });

  it('bloodScan', async () => {
    const { container } = render(<PatientInfo />);

    await waitFor(() =>
      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: 'Paciente_WS.asmx/GetTiposDeDocumento',
        data: 'token=nlsvctok',
      }),
    );

    userEvent.type(container, '123456789012345');

    fireEvent.keyDown(container, { key: 'Enter', code: 'Enter' });

    await waitFor(() =>
      expect(axios).toHaveBeenCalledWith({
        data: 'token=nlsvctok&idQr=123456789012345&codOri=AMB',
        method: 'post',
        url: 'Paciente_WS.asmx/GetQr',
      }),
    );

    // const scanner = screen.getByTestId('scanner');
    // const notification = screen.getByTestId('notification');
    // const form = screen.getByTestId('form');

    // await waitFor(() => expect(form).toBeVisible());

    // expect(scanner).not.toBeVisible();
    // expect(notification).not.toBeVisible();
    // expect(form).toBeVisible();
  });
});
