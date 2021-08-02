import { render } from '@testing-library/react';
import React from 'react';
import Login from '../components/Login';

it('renders without crashing', () => {
  render(<Login />);
});
