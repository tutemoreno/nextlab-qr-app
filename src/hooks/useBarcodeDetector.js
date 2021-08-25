import { useEffect } from 'react';

export const useBarcodeDetector = ({ handleScan, formats, videoRef }) => {
  useEffect(() => {
    console.log('useBarcodeDetector');
    const barcodeDetector = new window.BarcodeDetector({ formats });

    let intervalId,
      handled = false;

    const startScan = async () => {
      console.log('[SCAN]');
      if (!videoRef.current.srcObject) return;

      try {
        if (handled) return;

        const data = await barcodeDetector.detect(videoRef.current);

        if (data.length) {
          handled = true;
          handleScan(data[0].rawValue);
        }
      } catch (error) {
        console.log(error, 'Error scan');
      }
    };

    const cleanUp = () => {
      clearInterval(intervalId);
    };

    if (open && videoRef.current) intervalId = setInterval(startScan, 200);

    return cleanUp;
  }, [open, videoRef.current]);

  return;
};
