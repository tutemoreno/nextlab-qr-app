import { CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const ProvideLoading = ({ children }) => {
  const [isLoading, showLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ showLoading }}>
      {isLoading && <CircularProgress />}
      {children}
    </LoadingContext.Provider>
  );
};
ProvideLoading.propTypes = {
  children: PropTypes.element.isRequired,
};

export const useLoading = () => {
  return useContext(LoadingContext);
};
