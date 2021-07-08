import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import QrReader from 'react-qr-reader';
import { useFormInput } from '../utils/form';

export default function QrReaderComponent(props) {
  const errorScanning = useFormInput('');

  const handleError = (err) => {
    errorScanning.setValue(err);
  };

  const previewStyle = {
    height: 600,
    width: 800,
  };

  return (
    <Fragment>
      <QrReader
        style={previewStyle}
        onError={handleError}
        onScan={props.handleScan}
      />
      <p>errorScanning.value</p>
    </Fragment>
  );
}

QrReaderComponent.propTypes = {
  handleScan: PropTypes.func.isRequired,
};
