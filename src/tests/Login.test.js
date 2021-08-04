import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import Login from '../components/Login';
import { ProvideAuth } from '../context/auth';

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
});

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
  jest.spyOn(axios, 'default').mockResolvedValue({
    name: 'abc',
  });
  render(
    <ProvideAuth>
      <Login />
    </ProvideAuth>,
  );

  const usernameField = screen.getByLabelText('Nombre de usuario *');
  const passwordField = screen.getByLabelText('Contraseña *');
  const signInButton = screen.getByRole('button', { name: 'Iniciar sesion' });

  userEvent.type(usernameField, 'wrongUser');
  userEvent.type(passwordField, 'wrongPass');

  userEvent.click(signInButton);

  console.log(await waitFor(() => {}));
  // screen.debug();
});

/* import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
 */
