import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { render } from '@testing-library/react';
import PropTypes from 'prop-types';
import React from 'react';
import { ProvideAuth } from '../context/auth';

const AllTheProviders = ({ children }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <ProvideAuth>{children}</ProvideAuth>
    </MuiPickersUtilsProvider>
  );
};
AllTheProviders.propTypes = {
  children: PropTypes.element.isRequired,
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render };
