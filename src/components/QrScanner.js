import React, { useState } from 'react';
import QrReader from 'react-qr-scanner';
import { useFormInput } from '../utils/form';

export default function QrScanner(props) {
  const data = useFormInput('');

  const handleScan = (data) => {
    console.log('[DATAAAAA]', data);
  };

  const handleError = (err) => {
    console.error(err);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div>
      <QrReader
        delay={1000}
        style={previewStyle}
        onError={this.handleError}
        onScan={this.handleScan}
      />
      <p>{this.state.result}</p>
    </div>
  );
}
