import React, { Fragment } from 'react';
import QrReader from 'react-qr-reader';
import { useFormInput } from '../utils/form';

export default function QrReaderComponent(props) {
  const errorScanning = useFormInput('');

  const handleError = (err) => {
    errorScanning.setValue(err);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <Fragment>
      <QrReader
        delay={1000}
        style={previewStyle}
        onError={handleError}
        onScan={props.handleScan}
      />
      <p>errorScanning.value</p>
    </Fragment>
  );
}
