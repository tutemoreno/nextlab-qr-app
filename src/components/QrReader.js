import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import QrReader from 'react-qr-reader';
import { useFormInput } from '../utils/form';

export default function QrReaderComponent(props) {
  const errorScanning = useFormInput('');

  // useEffect(() => {
  //   const init = async () => {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     console.log(stream);
  //   };
  //   init();
  // }, []);

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
        facingMode={'user'}
      />
      <p>errorScanning.value</p>
    </Fragment>
  );
}

QrReaderComponent.propTypes = {
  handleScan: PropTypes.func.isRequired,
};
