import { useEffect } from 'react';

export const useBarcodeDetector = ({
  handleScan,
  formats,
  stream,
  videoRef,
}) => {
  useEffect(() => {
    const barcodeDetector = new window.BarcodeDetector({ formats });

    let intervalId,
      handled = false;

    const startScan = async () => {
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

    if (stream) intervalId = setInterval(startScan, 200);

    return cleanUp;
  }, [stream]);

  return;
};
