import { KeyboardDatePicker as Component } from '@material-ui/pickers';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

export default function KeyboardDatePicker({ name, setState, ...rest }) {
  const onChange = useCallback((d, s) => {
    setState((prevState) => ({
      ...prevState,
      [name]: s,
    }));
  }, []);

  return (
    <Component
      id={name}
      name={name}
      variant="inline"
      inputVariant="outlined"
      fullWidth
      format="dd/MM/yyyy"
      onChange={onChange}
      {...rest}
    />
  );
}
KeyboardDatePicker.propTypes = {
  name: PropTypes.string,
  setState: PropTypes.func,
};
