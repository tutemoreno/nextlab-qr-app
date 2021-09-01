import Component from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

export default function TextField({ name, setState, ...rest }) {
  const onChange = useCallback(
    setState
      ? ({ target: { value } }) => {
          setState((prevState) => ({
            ...prevState,
            [name]: value.toUpperCase(),
          }));
        }
      : null,
    [],
  );

  return (
    <Component
      id={name}
      name={name}
      variant="outlined"
      fullWidth
      onChange={onChange}
      {...rest}
    />
  );
}
TextField.propTypes = {
  name: PropTypes.string,
  setState: PropTypes.func,
};
