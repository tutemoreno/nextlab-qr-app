import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import Login from '../components/Login';
import { render, screen, waitFor } from './test-utils';

jest.mock('axios');

describe('Login', () => {
  it('focus', async () => {
    render(<Login />);

    const usernameField = screen.getByLabelText('Nombre de usuario *');

    expect(usernameField).toHaveFocus();
  });

  it('default values', async () => {
    render(<Login />);

    const usernameField = screen.getByLabelText('Nombre de usuario *');
    const passwordField = screen.getByLabelText('Contraseña *');
    const rememberCheck = screen.getByLabelText('Recordarme');

    expect(usernameField).toHaveValue('');
    expect(passwordField).toHaveValue('');
    expect(rememberCheck).not.toBeChecked();
  });

  it('required fields', async () => {
    render(<Login />);

    const usernameField = screen.getByLabelText('Nombre de usuario *');
    const passwordField = screen.getByLabelText('Contraseña *');

    expect(usernameField).toBeRequired();
    expect(passwordField).toBeRequired();
  });

  it('signIn [FAIL]', async () => {
    jest.spyOn(axios, 'default').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          status: 200,
          data: '<?xml version="1.0" encoding="utf-8"?><Usuario xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://192.168.10.54:4110/Usuario_WS/"><EsValido>false</EsValido><Error><Codigo>0</Codigo><Descripcion /></Error></Usuario>',
        });
      });
    });

    render(<Login />);

    const usernameField = screen.getByLabelText('Nombre de usuario *');
    const passwordField = screen.getByLabelText('Contraseña *');
    const signInButton = screen.getByRole('button', { name: 'Iniciar sesion' });
    const alert = () => screen.queryByRole('alert');

    expect(alert()).toBeNull();

    userEvent.type(usernameField, 'wrongUser');
    userEvent.type(passwordField, 'wrongPass');

    userEvent.click(signInButton);

    await waitFor(() =>
      expect(axios).toHaveBeenCalledWith({
        data: 'tipo=OR&aplicacion=WEB&usuario=wrongUser&clave=wrongPass&token=nlsvctok',
        method: 'post',
        url: 'Usuario_WS.asmx/usuario_valido',
      }),
    );

    expect(alert()).toBeVisible();
  });
});
